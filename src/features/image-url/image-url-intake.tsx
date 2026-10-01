"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

import { MaterialSymbol } from "@/components/icons";
import { MediaFrame } from "@/components/media";
import { Button, Input } from "@/components/ui";
import { FileIntake } from "@/features/file-intake";
import { useOnlineStatus } from "@/features/pwa";
import { media } from "@/lib/media";

import {
  fetchImageUrl,
  normalizeImageUrl,
  type ImageUrlFetchMethod,
} from "./fetch-image-url";

interface ImportedImage {
  file: File;
  id: number;
  method: ImageUrlFetchMethod;
}

export function ImageUrlIntake({ onWorkspaceStart }: { onWorkspaceStart?: () => void }) {
  const isOnline = useOnlineStatus();
  const requestRef = useRef<AbortController | null>(null);
  useEffect(() => () => requestRef.current?.abort(), []);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imported, setImported] = useState<ImportedImage | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError(null);
    try {
      normalizeImageUrl(url);
    } catch (validationError) {
      setError(
        validationError instanceof Error
          ? validationError.message
          : "Enter a valid image URL.",
      );
      return;
    }

    setLoading(true);
    onWorkspaceStart?.();
    const controller = new AbortController();
    requestRef.current = controller;
    try {
      const result = await fetchImageUrl(url, controller.signal);
      setImported((current) => ({
        file: result.file,
        id: (current?.id ?? 0) + 1,
        method: result.method,
      }));
    } catch (fetchError) {
      if (controller.signal.aborted) return;
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "The image could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`mode-panel${imported ? " mode-panel--loaded" : ""}`}>
      <header className="mode-panel__intro">
        <MediaFrame
          asset={media.hero.compressionFlow}
          className="mode-panel__art"
          sizes="(max-width: 640px) 96px, 120px"
        />
        <div>
          <h2>Paste an image URL</h2>
          <p>Fetch one public image, then compress and download it locally.</p>
        </div>
      </header>
      <form className="mode-panel__form" onSubmit={handleSubmit}>
        <Input
          autoCapitalize="none"
          autoComplete="url"
          error={
            !isOnline
              ? "Connect to the internet to fetch an image. Your imported image is still available."
              : (error ?? undefined)
          }
          hint="HTTP or HTTPS · JPEG, PNG, WebP or static AVIF · up to 25 MB"
          label="Public image URL"
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://example.com/image.jpg"
          spellCheck={false}
          readOnly={loading}
          type="url"
          required
          value={url}
        />
        <Button
          disabled={!isOnline}
          leadingIcon={<MaterialSymbol name="download" size={20} />}
          loading={loading}
          type="submit"
        >
          {loading ? "Fetching image" : "Fetch image"}
        </Button>
      </form>
      {loading ? (
        <div className="mode-panel__progress" role="status">
          <span>Fetching your image…</span>
          <Button variant="ghost" onClick={() => requestRef.current?.abort()}>
            Cancel
          </Button>
        </div>
      ) : null}
      <p className="mode-panel__note">
        <MaterialSymbol name="shield_lock" size={20} />
        Import a public image. Compression and downloads happen on your device.
      </p>
      {imported ? (
        <div className="mode-panel__result">
          <p aria-live="polite" className="mode-panel__success" role="status">
            <MaterialSymbol name="check_circle" size={20} />
            Image ready to compress and download.
          </p>
          <FileIntake initialFiles={[imported.file]} key={imported.id} />
        </div>
      ) : null}
    </div>
  );
}
