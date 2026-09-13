import type { ImageDimensions } from "@/types/image";

export const TARGET_SEARCH_MIN_QUALITY = 0.01;
export const TARGET_SEARCH_MAX_QUALITY = 1;
export const TARGET_SEARCH_MAX_ITERATIONS = 8;
export const SMART_TARGET_MIN_EDGE = 256;
export const SMART_TARGET_MAX_DIMENSION_STEPS = 4;

export interface TargetSizeCandidate<T> {
  bytes: number;
  quality: number;
  value: T;
}

export interface TargetSizeSearchOptions<T> {
  encode: (quality: number, iteration: number) => Promise<TargetSizeCandidate<T>>;
  maxIterations?: number;
  maxQuality?: number;
  minQuality?: number;
  targetBytes: number;
}

export class TargetSizeUnreachableError extends Error {
  readonly minimumBytes?: number;

  constructor(minimumBytes?: number) {
    super("The target cannot be reached without reducing the image dimensions.");
    this.name = "TargetSizeUnreachableError";
    this.minimumBytes = minimumBytes;
  }
}

export function resolveNextTargetDimensions(
  dimensions: ImageDimensions,
  targetBytes: number,
  currentBytes: number,
): ImageDimensions | null {
  const shortestEdge = Math.min(dimensions.width, dimensions.height);
  if (shortestEdge <= SMART_TARGET_MIN_EDGE) return null;

  const minimumScale = SMART_TARGET_MIN_EDGE / shortestEdge;
  const estimatedScale = Math.sqrt(targetBytes / currentBytes) * 0.92;
  const scale = Math.max(minimumScale, Math.min(0.9, estimatedScale));
  const next = {
    height: Math.max(1, Math.floor(dimensions.height * scale)),
    width: Math.max(1, Math.floor(dimensions.width * scale)),
  };
  return next.width < dimensions.width && next.height < dimensions.height ? next : null;
}

export async function searchTargetSize<T>({
  encode,
  maxIterations = TARGET_SEARCH_MAX_ITERATIONS,
  maxQuality = TARGET_SEARCH_MAX_QUALITY,
  minQuality = TARGET_SEARCH_MIN_QUALITY,
  targetBytes,
}: TargetSizeSearchOptions<T>): Promise<TargetSizeCandidate<T>> {
  const highest = await encode(maxQuality, 0);
  if (highest.bytes <= targetBytes) return highest;

  const lowest = await encode(minQuality, 1);
  if (lowest.bytes > targetBytes) throw new TargetSizeUnreachableError(lowest.bytes);

  let best = lowest;
  let lowerBound = minQuality;
  let upperBound = maxQuality;

  for (let iteration = 2; iteration < maxIterations; iteration += 1) {
    const quality = (lowerBound + upperBound) / 2;
    const candidate = await encode(quality, iteration);
    if (candidate.bytes <= targetBytes) {
      best = candidate;
      lowerBound = quality;
    } else {
      upperBound = quality;
    }
  }

  return best;
}
