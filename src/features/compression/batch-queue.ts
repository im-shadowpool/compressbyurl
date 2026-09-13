export const MAX_BATCH_CONCURRENCY = 3;
export const LARGE_IMAGE_PIXELS = 12_000_000;
export const HUGE_IMAGE_PIXELS = 24_000_000;
export const HUGE_IMAGE_BYTES = 32 * 1024 * 1024;

export interface BatchWorkloadItem {
  height: number;
  size: number;
  width: number;
}

export function resolveBatchConcurrency(
  items: readonly BatchWorkloadItem[],
  hardwareConcurrency: number,
) {
  if (items.length === 0) return 0;
  const largestPixels = Math.max(...items.map((item) => item.width * item.height));
  const largestBytes = Math.max(...items.map((item) => item.size));
  if (largestPixels >= HUGE_IMAGE_PIXELS || largestBytes >= HUGE_IMAGE_BYTES) return 1;

  const available = Math.max(1, Math.floor(hardwareConcurrency / 2));
  const normalLimit = Math.min(MAX_BATCH_CONCURRENCY, available, items.length);
  return largestPixels >= LARGE_IMAGE_PIXELS ? Math.min(2, normalLimit) : normalLimit;
}
