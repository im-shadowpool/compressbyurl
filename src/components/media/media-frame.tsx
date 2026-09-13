"use client";

import Image from "next/image";
import { useState, useSyncExternalStore } from "react";

import type { MediaAsset } from "@/lib/media";

interface MediaFrameProps {
  asset: MediaAsset;
  className?: string;
  priority?: boolean;
  sizes: string;
}

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const mediaQuery = window.matchMedia(reducedMotionQuery);
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(reducedMotionQuery).matches;
}

function getServerReducedMotionSnapshot() {
  return true;
}

export function MediaFrame({
  asset,
  className,
  priority = false,
  sizes,
}: MediaFrameProps) {
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getServerReducedMotionSnapshot,
  );
  const [videoFailed, setVideoFailed] = useState(false);
  const classes = ["media-frame", className].filter(Boolean).join(" ");
  const fallback = asset.kind === "video" ? asset.poster : asset;
  const showVideo = asset.kind === "video" && !reducedMotion && !videoFailed;

  return (
    <figure
      className={classes}
      style={{ aspectRatio: `${asset.width} / ${asset.height}` }}
    >
      <Image
        alt={fallback.alt}
        className="media-frame__fallback"
        fill
        priority={priority}
        sizes={sizes}
        src={fallback.src}
      />
      {showVideo ? (
        <video
          aria-label={asset.alt}
          autoPlay
          className="media-frame__video"
          loop
          muted
          onError={() => setVideoFailed(true)}
          playsInline
          poster={asset.poster.src}
          preload="metadata"
        >
          <source src={asset.src} />
        </video>
      ) : null}
    </figure>
  );
}
