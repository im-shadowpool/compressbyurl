"use client";

import { useState, type FormEvent } from "react";

import { MaterialSymbol } from "@/components/icons";
import { MediaFrame } from "@/components/media";
import { Button, Input } from "@/components/ui";
import { FileIntake } from "@/features/file-intake";
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

export function ImageUrlIntake() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imported, setImported] = useState<ImportedImage | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
    try {
      const result = await fetchImageUrl(url);
      setImported((current) => ({
        file: result.file,
        id: (current?.id ?? 0) + 1,
        method: result.method,
      }));
    } catch (fetchError) {
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
    <div className="mode-panel">
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
          error={error ?? undefined}
          hint="HTTP or HTTPS · JPEG, PNG, WebP or static AVIF · up to 25 MB"
          label="Public image URL"
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://example.com/image.jpg"
          spellCheck={false}
          type="url"
          value={url}
        />
        <Button
          leadingIcon={<MaterialSymbol name="download" size={20} />}
          loading={loading}
          type="submit"
        >
          {loading ? "Fetching image" : "Fetch image"}
        </Button>
      </form>
      <p className="mode-panel__note">
        <MaterialSymbol name="shield_lock" size={20} />
        Direct browser fetch is tried first. The fallback blocks private networks,
        validates redirects and never forwards credentials.
      </p>
      {imported ? (
        <div className="mode-panel__result">
          <p aria-live="polite" className="mode-panel__success" role="status">
            <MaterialSymbol name="check_circle" size={20} />
            Image ready via{" "}
            {imported.method === "direct" ? "direct fetch" : "secure fallback"}.
          </p>
          <FileIntake initialFiles={[imported.file]} key={imported.id} />
        </div>
      ) : null}
    </div>
  );
}
