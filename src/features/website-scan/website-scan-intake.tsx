"use client";

import { useMemo, useState, type FormEvent } from "react";

import { MaterialSymbol } from "@/components/icons";
import { Button, Input } from "@/components/ui";
import { FileIntake, formatBytes } from "@/features/file-intake";
import { fetchImageUrl } from "@/features/image-url";
import { useOnlineStatus } from "@/features/pwa";

import {
  websiteScanManifestSchema,
  type WebsiteImageCandidate,
  type WebsiteScanManifest,
} from "./types";

const MAX_SELECTED_IMAGES = 20;

export type WebsiteScanPurpose = "download" | "optimizer" | "scanner";

const PURPOSE_COPY = {
  download: {
    action: "Prepare selected downloads",
    description:
      "Discover image candidates, choose supported files, then download locally.",
    heading: "Find images on one webpage",
    scanning: "Finding images",
    submit: "Find webpage images",
    workspace: "Review and package selected images",
  },
  optimizer: {
    action: "Import selected for optimization",
    description:
      "Find heavy image candidates, choose what matters, then optimize locally.",
    heading: "Optimize webpage images",
    scanning: "Scanning for opportunities",
    submit: "Find images to optimize",
    workspace: "Compress, compare and package replacements",
  },
  scanner: {
    action: "Prepare selected images",
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
    action: string;
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
    return "Resize to its largest rendered size, then apply Smart compression.";
  }
  if (/\.(?:jpe?g|png)(?:$|[?#])/i.test(candidate.url)) {
    return "Try WebP with the Blog Image or Website Hero preset.";
  }
  return "Apply Smart compression and compare before replacing it.";
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
}: {
  purpose?: WebsiteScanPurpose;
}) {
  const isOnline = useOnlineStatus();
  const copy = PURPOSE_COPY[purpose];
  const [url, setUrl] = useState("");
  const [manifest, setManifest] = useState<WebsiteScanManifest | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [measurements, setMeasurements] = useState<Record<string, CandidateMeasurement>>(
    {},
  );
  const [prepared, setPrepared] = useState<PreparedAudit | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [preparedCount, setPreparedCount] = useState(0);

  const supported = useMemo(
    () =>
      manifest?.candidates.filter((candidate) => !isKnownUnsupported(candidate)) ?? [],
    [manifest],
  );
  const duplicateFilenames = useMemo(() => {
    const counts = new Map<string, number>();
    for (const candidate of manifest?.candidates ?? []) {
      const key = filenameKey(candidate);
      if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return new Set(
      Array.from(counts.entries())
        .filter(([, count]) => count > 1)
        .map(([key]) => key),
    );
  }, [manifest]);

  async function scanWebsite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setScanError(null);
    let normalized: string;
    try {
      normalized = normalizeWebsiteUrl(url);
    } catch (error) {
      setScanError(error instanceof Error ? error.message : "Enter a valid webpage URL.");
      return;
    }

    setScanning(true);
    setManifest(null);
    setSelected(new Set());
    setPrepared(null);
    setImportErrors([]);
    setMeasurements({});
    try {
      const response = await fetch("/api/website-scan", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: normalized }),
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
      setManifest(parsed.data);
    } catch (error) {
      setScanError(
        error instanceof Error ? error.message : "The webpage could not be scanned.",
      );
    } finally {
      setScanning(false);
    }
  }

  function toggleCandidate(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else if (next.size < MAX_SELECTED_IMAGES) next.add(id);
      return next;
    });
    setPrepared(null);
  }

  async function prepareSelectedImages() {
    if (!manifest || selected.size === 0) return;
    const queue = manifest.candidates.filter((candidate) => selected.has(candidate.id));
    const fetched: Array<{ candidate: WebsiteImageCandidate; file: File } | undefined> =
      Array.from({ length: queue.length });
    const failed: Array<string | undefined> = Array.from({ length: queue.length });
    const sources: Record<string, string> = {};
    const measured: Record<string, CandidateMeasurement> = {};
    let nextIndex = 0;
    let complete = 0;

    setPreparing(true);
    setPreparedCount(0);
    setPrepared(null);
    setImportErrors([]);
    await Promise.all(
      Array.from({ length: Math.min(3, queue.length) }, async () => {
        while (nextIndex < queue.length) {
          const candidateIndex = nextIndex;
          const candidate = queue[candidateIndex];
          nextIndex += 1;
          if (!candidate) continue;
          try {
            const result = await fetchImageUrl(candidate.url);
            fetched[candidateIndex] = { candidate, file: result.file };
          } catch (error) {
            failed[candidateIndex] = `${new URL(candidate.url).hostname}: ${
              error instanceof Error ? error.message : "image fetch failed"
            }`;
          } finally {
            complete += 1;
            setPreparedCount(complete);
          }
        }
      }),
    );

    const usedNames = new Set<string>();
    const files: File[] = [];
    for (const result of fetched) {
      if (!result) continue;
      const file = uniqueFile(result.file, usedNames);
      sources[file.name] = result.candidate.url;
      measured[result.candidate.id] = await measureImage(file);
      files.push(file);
    }
    const failures = failed.filter((message): message is string => Boolean(message));

    setMeasurements((current) => ({ ...current, ...measured }));
    setImportErrors(failures);
    if (files.length > 0) {
      setPrepared((current) => ({
        files,
        id: (current?.id ?? 0) + 1,
        replacementSources: sources,
      }));
    }
    setPreparing(false);
  }

  return (
    <div className="mode-panel website-scan">
      <header className="mode-panel__intro">
        <span aria-hidden="true" className="mode-panel__icon">
          <MaterialSymbol name="search_insights" size={24} />
        </span>
        <div>
          <h2>{copy.heading}</h2>
          <p>{copy.description}</p>
        </div>
      </header>
      <form className="mode-panel__form" onSubmit={scanWebsite}>
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
          type="url"
          value={url}
        />
        <Button
          disabled={!isOnline}
          leadingIcon={<MaterialSymbol name="travel_explore" size={20} />}
          loading={scanning}
          type="submit"
        >
          {scanning ? copy.scanning : copy.submit}
        </Button>
      </form>
      <p className="mode-panel__note">
        <MaterialSymbol name="shield_lock" size={20} />
        Private networks and metadata endpoints are blocked. Scripts are never executed.
      </p>

      {manifest ? (
        <section className="website-audit" aria-labelledby="website-audit-title">
          <header className="website-audit__header">
            <div>
              <p className="website-audit__eyebrow">Scan complete</p>
              <h3 id="website-audit-title">
                {manifest.page.title ?? new URL(manifest.page.url).hostname}
              </h3>
              <p>
                {manifest.candidates.length} candidates · {supported.length} supported ·
                select up to {MAX_SELECTED_IMAGES}
              </p>
            </div>
            <div className="website-audit__actions">
              <Button
                size="small"
                variant="secondary"
                onClick={() =>
                  setSelected(
                    new Set(
                      supported
                        .slice(0, MAX_SELECTED_IMAGES)
                        .map((candidate) => candidate.id),
                    ),
                  )
                }
              >
                Select supported
              </Button>
              <Button size="small" variant="ghost" onClick={() => setSelected(new Set())}>
                Clear
              </Button>
            </div>
          </header>

          {manifest.candidates.length === 0 ? (
            <div className="website-audit__empty">
              <MaterialSymbol name="image_not_supported" size={32} />
              <p>No static image candidates were found in the page HTML.</p>
            </div>
          ) : (
            <ul className="website-audit__list" aria-label="Discovered image candidates">
              {manifest.candidates.map((candidate) => {
                const unsupported = isKnownUnsupported(candidate);
                const measurement = measurements[candidate.id];
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
                        disabled={
                          unsupported ||
                          (!checked && selected.size >= MAX_SELECTED_IMAGES)
                        }
                        onChange={() => toggleCandidate(candidate.id)}
                        type="checkbox"
                      />
                      <span className="sr-only">
                        Select {candidate.alt ?? candidate.url}
                      </span>
                    </label>
                    <div className="website-candidate__body">
                      <div className="website-candidate__topline">
                        <strong>{candidate.alt || sourceLabel(candidate.source)}</strong>
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
                      <div className="website-candidate__issues">
                        {issues.map((issue) => (
                          <span key={issue}>{issue}</span>
                        ))}
                      </div>
                      <p>{recommendation(candidate)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="website-audit__prepare">
            <div>
              <strong>{selected.size} selected</strong>
              <span>
                Fetched three at a time; optimization remains in browser workers.
              </span>
            </div>
            <Button
              disabled={selected.size === 0}
              leadingIcon={<MaterialSymbol name="auto_fix_high" size={20} />}
              loading={preparing}
              onClick={() => void prepareSelectedImages()}
            >
              {preparing ? `Preparing ${preparedCount} of ${selected.size}` : copy.action}
            </Button>
          </div>

          {importErrors.length > 0 ? (
            <div className="website-audit__errors" role="alert">
              <strong>{importErrors.length} images could not be imported</strong>
              <ul>
                {importErrors.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {prepared ? (
            <section
              className="website-audit__workspace"
              aria-label="Replacement workspace"
            >
              <div>
                <p className="website-audit__eyebrow">Local replacement workspace</p>
                <h3>{copy.workspace}</h3>
                <p>
                  Try Website Hero or Blog Image. The ZIP includes
                  <code>replacement-map.json</code> with source-to-file mappings.
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
