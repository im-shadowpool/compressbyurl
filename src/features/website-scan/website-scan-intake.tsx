"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";

import { MaterialSymbol } from "@/components/icons";
import { MediaFrame } from "@/components/media";
import { Button, Input } from "@/components/ui";
import { FileIntake, formatBytes } from "@/features/file-intake";
import { fetchImageUrl } from "@/features/image-url";
import { useOnlineStatus } from "@/features/pwa";
import { media } from "@/lib/media";

import {
  websiteScanManifestSchema,
  type WebsiteImageCandidate,
  type WebsiteScanManifest,
} from "./types";

export type WebsiteScanPurpose = "download" | "optimizer" | "scanner";

const PURPOSE_COPY = {
  download: {
    description:
      "Discover image candidates, choose supported files, then download locally.",
    heading: "Find images on one webpage",
    scanning: "Finding images",
    submit: "Find webpage images",
    workspace: "Review and package selected images",
  },
  optimizer: {
    description:
      "Find heavy image candidates, choose what matters, then optimize locally.",
    heading: "Optimize webpage images",
    scanning: "Scanning for opportunities",
    submit: "Find images to optimize",
    workspace: "Compress, compare and package replacements",
  },
  scanner: {
    description:
      "Audit discoverable images, dimensions, formats and optimization issues.",
    heading: "Audit webpage images",
    scanning: "Auditing page",
    submit: "Run image audit",
    workspace: "Inspect selected images locally",
  },
} as const satisfies Record<
  WebsiteScanPurpose,
  {
    description: string;
    heading: string;
    scanning: string;
    submit: string;
    workspace: string;
  }
>;

interface PreparedAudit {
  files: File[];
  id: number;
  replacementSources: Record<string, string>;
}

interface CandidateMeasurement {
  bytes: number;
  format: string;
  height: number | null;
  width: number | null;
}

interface AuditedCandidate {
  candidate: WebsiteImageCandidate;
  file: File;
  measurement: CandidateMeasurement;
  previewUrl: string;
}

interface ScanProgress {
  complete: number;
  total: number;
}

function normalizeWebsiteUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error("Enter a complete webpage URL beginning with http:// or https://.");
  }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new Error(
      "Only public HTTP or HTTPS webpages without sign-in details are allowed.",
    );
  }
  url.hash = "";
  return url.toString();
}

function isKnownUnsupported(candidate: WebsiteImageCandidate) {
  return /\.(?:gif|svg)(?:$|[?#])/i.test(candidate.url);
}

function sourceLabel(source: WebsiteImageCandidate["source"]) {
  const labels = {
    image: "Image",
    "lazy-image": "Lazy image",
    srcset: "Responsive source",
    picture: "Picture source",
    metadata: "Social preview",
    preload: "Preloaded image",
  } satisfies Record<WebsiteImageCandidate["source"], string>;
  return labels[source];
}

function candidateIssues(
  candidate: WebsiteImageCandidate,
  measurement: CandidateMeasurement | undefined,
  possibleDuplicate: boolean,
) {
  const issues: string[] = [];
  if (isKnownUnsupported(candidate)) issues.push("Unsupported format");
  if (!candidate.declaredWidth || !candidate.declaredHeight)
    issues.push("Missing dimensions");
  if ((candidate.declaredWidth ?? 0) > 2000 || (candidate.declaredHeight ?? 0) > 2000) {
    issues.push("Large dimensions");
  }
  if (/\.(?:jpe?g|png)(?:$|[?#])/i.test(candidate.url)) {
    issues.push("Modern format opportunity");
  }
  if (measurement?.bytes && measurement.bytes >= 250 * 1024) issues.push("Heavy file");
  if (
    measurement &&
    candidate.declaredWidth &&
    candidate.declaredHeight &&
    ((measurement.width ?? 0) > candidate.declaredWidth * 1.5 ||
      (measurement.height ?? 0) > candidate.declaredHeight * 1.5)
  ) {
    issues.push("Oversized for layout");
  }
  if (
    measurement &&
    ["WEBP", "AVIF"].includes(measurement.format) &&
    measurement.bytes < 150 * 1024
  ) {
    issues.push("Already lean");
  }
  if (possibleDuplicate) issues.push("Possible duplicate variant");
  return issues;
}

function recommendation(candidate: WebsiteImageCandidate) {
  if (isKnownUnsupported(candidate))
    return "Use a static JPEG, PNG, WebP or AVIF source.";
  if ((candidate.declaredWidth ?? 0) > 2000 || (candidate.declaredHeight ?? 0) > 2000) {
    return "Resize to its largest rendered size, then convert to WebP at 90% quality.";
  }
  if (/\.(?:jpe?g|png)(?:$|[?#])/i.test(candidate.url)) {
    return "Convert to WebP at 90% quality, then compare before replacing it.";
  }
  return "Compress at 90% quality and compare before replacing it.";
}

function uniqueFile(file: File, usedNames: Set<string>) {
  const dot = file.name.lastIndexOf(".");
  const stem = dot > 0 ? file.name.slice(0, dot) : file.name;
  const extension = dot > 0 ? file.name.slice(dot) : "";
  let name = file.name;
  let sequence = 2;
  while (usedNames.has(name.toLowerCase())) {
    name = `${stem} (${sequence})${extension}`;
    sequence += 1;
  }
  usedNames.add(name.toLowerCase());
  return name === file.name
    ? file
    : new File([file], name, { lastModified: file.lastModified, type: file.type });
}

async function measureImage(file: File): Promise<CandidateMeasurement> {
  const base = {
    bytes: file.size,
    format: file.type.replace("image/", "").replace("jpeg", "jpg").toUpperCase(),
  };
  try {
    const bitmap = await createImageBitmap(file);
    const dimensions = { height: bitmap.height, width: bitmap.width };
    bitmap.close();
    return { ...base, ...dimensions };
  } catch {
    return { ...base, height: null, width: null };
  }
}

function candidateFormat(candidate: WebsiteImageCandidate) {
  const match = candidate.url.match(/\.(jpe?g|png|webp|avif|gif|svg)(?:$|[?#])/i);
  return match?.[1]?.replace("jpeg", "jpg").toUpperCase() ?? "Unknown format";
}

function estimateSavings(measurement: CandidateMeasurement) {
  const rate =
    measurement.format === "PNG"
      ? 0.42
      : ["JPG", "JPEG"].includes(measurement.format)
        ? 0.24
        : measurement.format === "WEBP"
          ? 0.1
          : 0.05;
  const sizeFactor = measurement.bytes < 50 * 1024 ? 0.55 : 1;
  return Math.round(measurement.bytes * rate * sizeFactor);
}

function filenameKey(candidate: WebsiteImageCandidate) {
  try {
    return new URL(candidate.url).pathname
      .split("/")
      .filter(Boolean)
      .at(-1)
      ?.toLowerCase();
  } catch {
    return undefined;
  }
}

export function WebsiteScanIntake({
  purpose = "scanner",
  onWorkspaceStart,
}: {
  purpose?: WebsiteScanPurpose;
  onWorkspaceStart?: () => void;
}) {
  const isOnline = useOnlineStatus();
  const copy = PURPOSE_COPY[purpose];
  const [url, setUrl] = useState("");
  const [manifest, setManifest] = useState<WebsiteScanManifest | null>(null);
  const [auditedCandidates, setAuditedCandidates] = useState<AuditedCandidate[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [prepared, setPrepared] = useState<PreparedAudit | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<ScanProgress | null>(null);
  const [excludedCount, setExcludedCount] = useState(0);
  const [query, setQuery] = useState("");
  const [editingUrl, setEditingUrl] = useState(false);
  const [sort, setSort] = useState("largest");
  const [view, setView] = useState<"review" | "optimize">("review");
  const requestRef = useRef<AbortController | null>(null);
  const resultsRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => () => requestRef.current?.abort(), []);
  const visibleCandidates = useMemo(() => {
    const term = query.trim().toLowerCase();
    const items = auditedCandidates.filter(({ candidate, measurement }) =>
      `${candidate.alt ?? ""} ${candidate.url} ${measurement.format}`
        .toLowerCase()
        .includes(term),
    );
    return sort === "largest"
      ? items.sort((a, b) => b.measurement.bytes - a.measurement.bytes)
      : items;
  }, [auditedCandidates, query, sort]);

  useEffect(
    () => () => {
      auditedCandidates.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    },
    [auditedCandidates],
  );

  const duplicateFilenames = useMemo(() => {
    const counts = new Map<string, number>();
    for (const { candidate } of auditedCandidates) {
      const key = filenameKey(candidate);
      if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return new Set(
      Array.from(counts.entries())
        .filter(([, count]) => count > 1)
        .map(([key]) => key),
    );
  }, [auditedCandidates]);
  const totalImageBytes = useMemo(
    () => auditedCandidates.reduce((total, item) => total + item.measurement.bytes, 0),
    [auditedCandidates],
  );
  const estimatedSavingsBytes = useMemo(
    () =>
      auditedCandidates.reduce(
        (total, item) => total + estimateSavings(item.measurement),
        0,
      ),
    [auditedCandidates],
  );
  const estimatedSavingsPercent =
    totalImageBytes > 0 ? (estimatedSavingsBytes / totalImageBytes) * 100 : 0;

  async function scanWebsite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (scanning) return;
    setScanError(null);
    let normalized: string;
    try {
      normalized = normalizeWebsiteUrl(url);
    } catch (error) {
      setScanError(error instanceof Error ? error.message : "Enter a valid webpage URL.");
      return;
    }

    setScanning(true);
    onWorkspaceStart?.();
    const controller = new AbortController();
    requestRef.current = controller;
    const fetched: Array<AuditedCandidate | undefined> = [];
    setManifest(null);
    setAuditedCandidates([]);
    setSelected(new Set());
    setPrepared(null);
    setExcludedCount(0);
    setScanProgress(null);
    setQuery("");
    setView("review");
    try {
      const response = await fetch("/api/website-scan", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: normalized }),
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(30_000)]),
      });
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          typeof body === "object" &&
          body !== null &&
          "message" in body &&
          typeof body.message === "string"
            ? body.message
            : "The webpage could not be scanned safely.";
        throw new Error(message);
      }
      const parsed = websiteScanManifestSchema.safeParse(body);
      if (!parsed.success) throw new Error("The scanner returned an invalid manifest.");

      const queue = parsed.data.candidates.filter(
        (candidate) => !isKnownUnsupported(candidate),
      );
      let nextIndex = 0;
      let complete = 0;
      setScanProgress({ complete: 0, total: queue.length });
      await Promise.all(
        Array.from({ length: Math.min(3, queue.length) }, async () => {
          while (nextIndex < queue.length && !controller.signal.aborted) {
            const candidateIndex = nextIndex;
            const candidate = queue[candidateIndex];
            nextIndex += 1;
            if (!candidate) continue;
            try {
              const result = await fetchImageUrl(candidate.url, controller.signal);
              const measurement = await measureImage(result.file);
              fetched[candidateIndex] = {
                candidate,
                file: result.file,
                measurement,
                previewUrl: URL.createObjectURL(result.file),
              };
            } catch {
              // Unsupported, oversized and unreachable resources are omitted.
            } finally {
              complete += 1;
              setScanProgress({ complete, total: queue.length });
            }
          }
        }),
      );
      controller.signal.throwIfAborted();
      const supportedItems = fetched.filter((item): item is AuditedCandidate =>
        Boolean(item),
      );
      const supportedManifest = {
        ...parsed.data,
        candidates: supportedItems.map((item) => item.candidate),
      };
      setManifest(supportedManifest);
      setEditingUrl(false);
      setAuditedCandidates(supportedItems);
      setSelected(new Set(supportedItems.map((item) => item.candidate.id)));
      setExcludedCount(parsed.data.candidates.length - supportedItems.length);
      requestAnimationFrame(() => resultsRef.current?.focus());
    } catch (error) {
      fetched.forEach((item) => item && URL.revokeObjectURL(item.previewUrl));
      if (controller.signal.aborted) return;
      setScanError(
        error instanceof Error ? error.message : "The webpage could not be scanned.",
      );
    } finally {
      setScanning(false);
      setScanProgress(null);
    }
  }

  function toggleCandidate(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setPrepared(null);
  }

  function prepareSelectedImages() {
    if (!manifest || selected.size === 0) return;
    const sources: Record<string, string> = {};
    const usedNames = new Set<string>();
    const files: File[] = [];
    for (const item of auditedCandidates) {
      if (!selected.has(item.candidate.id)) continue;
      const file = uniqueFile(item.file, usedNames);
      sources[file.name] = item.candidate.url;
      files.push(file);
    }
    if (files.length > 0) {
      setPrepared((current) => ({
        files,
        id: (current?.id ?? 0) + 1,
        replacementSources: sources,
      }));
      setView("optimize");
      onWorkspaceStart?.();
    }
  }

  return (
    <div
      className={`mode-panel website-scan${manifest || scanning ? " mode-panel--loaded" : ""}`}
    >
      <header className="mode-panel__intro">
        <MediaFrame
          asset={media.hero.compressionFlow}
          className="mode-panel__art"
          sizes="(max-width: 640px) 96px, 120px"
        />
        <div>
          <h2>{copy.heading}</h2>
          <p>{copy.description}</p>
        </div>
      </header>
      <form
        className="mode-panel__form"
        onSubmit={scanWebsite}
        hidden={Boolean(manifest) && !editingUrl}
      >
        <Input
          autoCapitalize="none"
          autoComplete="url"
          error={
            !isOnline
              ? "Internet access is required to scan a webpage."
              : (scanError ?? undefined)
          }
          hint="One public HTTP or HTTPS page · no full-site crawling"
          label="Website URL"
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://example.com"
          spellCheck={false}
          readOnly={scanning}
          type="url"
          required
          value={url}
        />
        <Button
          disabled={!isOnline}
          leadingIcon={<MaterialSymbol name="travel_explore" size={20} />}
          loading={scanning}
          type="submit"
        >
          {scanning
            ? scanProgress
              ? `Checking ${scanProgress.complete} of ${scanProgress.total}`
              : copy.scanning
            : copy.submit}
        </Button>
      </form>
      <p className="mode-panel__note">
        <MaterialSymbol name="shield_lock" size={20} />
        Scan one public page, choose images, then optimize them on your device.
      </p>
      {scanning ? (
        <div className="mode-panel__progress" role="status">
          <div>
            <p>
              {scanProgress
                ? `Checking images · ${scanProgress.complete} of ${scanProgress.total}`
                : "Finding images on this page…"}
            </p>
            <progress
              aria-label="Images checked"
              max={scanProgress?.total || 1}
              value={scanProgress ? scanProgress.complete : undefined}
            />
          </div>
          <Button variant="ghost" onClick={() => requestRef.current?.abort()}>
            Cancel scan
          </Button>
        </div>
      ) : null}

      {manifest ? (
        <section className="website-audit" aria-labelledby="website-audit-title">
          <div className="website-audit__heading">
            <h2 id="website-audit-title" tabIndex={-1} ref={resultsRef}>
              {view === "review" ? "Choose your images" : copy.workspace}
            </h2>
            <Button
              variant="ghost"
              size="small"
              aria-label={editingUrl ? "Keep this scan" : "Scan another page"}
              title={editingUrl ? "Keep this scan" : "Scan another page"}
              leadingIcon={
                <MaterialSymbol name={editingUrl ? "close" : "add_link"} size={20} />
              }
              onClick={() => setEditingUrl(!editingUrl)}
            >
              <span className="website-audit__rescan-label">
                {editingUrl ? "Keep this scan" : "Scan another page"}
              </span>
            </Button>
            {prepared ? (
              <Button
                variant="ghost"
                size="small"
                onClick={() => setView(view === "review" ? "optimize" : "review")}
              >
                {view === "review" ? "Return to workspace" : "Back to images"}
              </Button>
            ) : null}
          </div>
          <div hidden={view !== "review"} className="website-audit__review">
            <details className="website-audit__overview">
              <summary>
                {auditedCandidates.length} images · {formatBytes(totalImageBytes)}
                <span>Scan details</span>
              </summary>
              <dl className="website-audit__summary">
                <div className="website-audit__url">
                  <dt>Scanned page</dt>
                  <dd>
                    <a href={manifest.page.url} rel="noreferrer" target="_blank">
                      {manifest.page.url}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt>Images found</dt>
                  <dd>{auditedCandidates.length}</dd>
                  <span>
                    {excludedCount > 0
                      ? `${excludedCount} unsupported or unavailable excluded`
                      : "Supported static images only"}
                  </span>
                </div>
                <div>
                  <dt>Total image size</dt>
                  <dd>{formatBytes(totalImageBytes)}</dd>
                </div>
                <div className="website-audit__savings">
                  <dt>Rough savings estimate</dt>
                  <dd>{formatBytes(estimatedSavingsBytes)}</dd>
                  <span>{`${estimatedSavingsPercent.toFixed(1)}% · actual results vary`}</span>
                </div>
              </dl>
            </details>
            <div className="website-audit__toolbar">
              <Input
                label="Filter images"
                placeholder="Search name, URL or format"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <label className="ui-field">
                <span className="ui-field__label">Sort by</span>
                <select
                  className="ui-input"
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                >
                  <option value="largest">Largest first</option>
                  <option value="page">Page order</option>
                </select>
              </label>
              <Button
                variant="ghost"
                size="small"
                disabled={visibleCandidates.length === 0}
                onClick={() => {
                  const allSelected = visibleCandidates.every(({ candidate }) =>
                    selected.has(candidate.id),
                  );
                  setSelected((current) => {
                    const next = new Set(current);
                    visibleCandidates.forEach(({ candidate }) => {
                      if (allSelected) next.delete(candidate.id);
                      else next.add(candidate.id);
                    });
                    return next;
                  });
                  setPrepared(null);
                }}
              >
                {visibleCandidates.length > 0 &&
                visibleCandidates.every(({ candidate }) => selected.has(candidate.id))
                  ? "Deselect shown"
                  : "Select shown"}
              </Button>
            </div>

            {auditedCandidates.length === 0 ? (
              <div className="website-audit__empty">
                <MaterialSymbol name="image_not_supported" size={32} />
                <p>No supported static images could be loaded from this webpage.</p>
              </div>
            ) : (
              <ul className="website-audit__list" aria-label="Supported images found">
                {visibleCandidates.map(({ candidate, measurement, previewUrl }) => {
                  const key = filenameKey(candidate);
                  const issues = candidateIssues(
                    candidate,
                    measurement,
                    key ? duplicateFilenames.has(key) : false,
                  );
                  const checked = selected.has(candidate.id);
                  return (
                    <li className="website-candidate" key={candidate.id}>
                      <label className="website-candidate__select">
                        <input
                          checked={checked}
                          onChange={() => toggleCandidate(candidate.id)}
                          type="checkbox"
                        />
                        <span className="sr-only">
                          Select {candidate.alt || candidate.url}
                        </span>
                      </label>
                      <div className="website-candidate__preview">
                        <Image
                          alt=""
                          height={88}
                          src={previewUrl}
                          unoptimized
                          width={112}
                        />
                      </div>
                      <div className="website-candidate__body">
                        <div className="website-candidate__topline">
                          <strong>
                            {candidate.alt || sourceLabel(candidate.source)}
                          </strong>
                          <span>{sourceLabel(candidate.source)}</span>
                        </div>
                        <a href={candidate.url} rel="noreferrer" target="_blank">
                          {candidate.url}
                        </a>
                        <div className="website-candidate__facts">
                          <span>
                            {measurement?.width && measurement.height
                              ? `${measurement.width} × ${measurement.height} natural`
                              : candidate.declaredWidth && candidate.declaredHeight
                                ? `${candidate.declaredWidth} × ${candidate.declaredHeight} declared`
                                : "Dimensions not declared"}
                          </span>
                          <span>{measurement?.format ?? candidateFormat(candidate)}</span>
                          {measurement ? (
                            <span>{formatBytes(measurement.bytes)}</span>
                          ) : null}
                        </div>
                        <details className="website-candidate__details">
                          <summary>
                            {issues.length
                              ? `${issues.length} notes · View details`
                              : "View details"}
                          </summary>
                          <div className="website-candidate__issues">
                            {issues.map((issue) => (
                              <span key={issue}>{issue}</span>
                            ))}
                          </div>
                          <p>{recommendation(candidate)}</p>
                        </details>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            {auditedCandidates.length > 0 && visibleCandidates.length === 0 ? (
              <p role="status">
                No images match “{query}”. Clear the filter to see all images.
              </p>
            ) : null}

            <div className="website-audit__prepare">
              <div>
                <strong>{selected.size} selected</strong>
                <span>
                  {formatBytes(
                    auditedCandidates.reduce(
                      (total, item) =>
                        total +
                        (selected.has(item.candidate.id) ? item.measurement.bytes : 0),
                      0,
                    ),
                  )}{" "}
                  of source images · processed on your device
                </span>
              </div>
              <Button
                disabled={selected.size === 0}
                leadingIcon={<MaterialSymbol name="auto_fix_high" size={20} />}
                onClick={prepareSelectedImages}
              >
                {selected.size > 0
                  ? `Use ${selected.size} ${selected.size === 1 ? "image" : "images"}`
                  : "Select images to continue"}
              </Button>
            </div>
          </div>

          {prepared ? (
            <section
              className="website-audit__workspace"
              hidden={view !== "optimize"}
              aria-label="Replacement workspace"
            >
              <div>
                <p>
                  Optimize your selection, then create a ZIP. It includes
                  <code>replacement-map.json</code> linking each original URL to its
                  replacement.
                </p>
              </div>
              <FileIntake
                initialFiles={prepared.files}
                key={prepared.id}
                replacementSources={prepared.replacementSources}
              />
            </section>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
