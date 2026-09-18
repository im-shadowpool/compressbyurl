const units = ["B", "KB", "MB", "GB"] as const;

export function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";

  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** unitIndex;
  const precision = value >= 10 || unitIndex === 0 ? 0 : 1;

  return `${value.toFixed(precision)} ${units[unitIndex]}`;
}

export function formatByteDelta(fromBytes: number, toBytes: number) {
  const fromStr = formatBytes(fromBytes);
  const toStr = formatBytes(toBytes);

  // When both round to the exact same display string but actual bytes differ,
  // show 2 decimal places so the user actually sees the size reduction.
  if (fromStr === toStr && fromBytes !== toBytes) {
    const formatPrecise = (b: number) => {
      const unitIndex = Math.min(
        Math.floor(Math.log(Math.max(b, 1)) / Math.log(1024)),
        units.length - 1,
      );
      const val = b / 1024 ** unitIndex;
      return `${val.toFixed(2)} ${units[unitIndex]}`;
    };
    return { from: formatPrecise(fromBytes), to: formatPrecise(toBytes) };
  }

  return { from: fromStr, to: toStr };
}
