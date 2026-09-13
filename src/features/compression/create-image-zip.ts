export interface ImageZipEntry {
  blob: Blob;
  name: string;
}

export interface ImageZipProgress {
  currentFile: string | null;
  percent: number;
}

export async function createImageZip(
  entries: readonly ImageZipEntry[],
  onProgress?: (progress: ImageZipProgress) => void,
) {
  if (entries.length === 0) throw new Error("There are no successful images to add.");
  const { default: JSZip } = await import("jszip");
  const archive = new JSZip();
  for (const entry of entries) archive.file(entry.name, entry.blob);

  const blob = await archive.generateAsync(
    {
      compression: "STORE",
      platform: "DOS",
      streamFiles: true,
      type: "blob",
    },
    (metadata) => {
      onProgress?.({
        currentFile: metadata.currentFile ?? null,
        percent: Math.round(Math.min(100, Math.max(0, metadata.percent))),
      });
    },
  );

  if (process.env.NODE_ENV !== "production") {
    const loaded = await JSZip.loadAsync(blob);
    const files = Object.values(loaded.files).filter((file) => !file.dir);
    if (files.length !== entries.length) {
      throw new Error("The ZIP verification found an unexpected number of files.");
    }
    for (const entry of entries) {
      const archived = loaded.file(entry.name);
      if (
        !archived ||
        (await archived.async("uint8array")).byteLength !== entry.blob.size
      ) {
        throw new Error(`The ZIP verification failed for ${entry.name}.`);
      }
    }
  }

  return blob;
}
