import type { IntakeItem, RejectedIntakeItem, ValidatedIntakeItem } from "./types";
import { validateImageFile } from "./validate-file";

function corruptImage(item: ValidatedIntakeItem): RejectedIntakeItem {
  return {
    code: "corrupt-image",
    file: item.file,
    id: item.id,
    message: "This image could not be decoded in your browser.",
    name: item.name,
    size: item.size,
    status: "rejected",
  };
}

export function revokePreview(item: IntakeItem) {
  if (item.status === "ready") URL.revokeObjectURL(item.previewUrl);
}

export async function createPreview(item: ValidatedIntakeItem): Promise<IntakeItem> {
  const previewUrl = URL.createObjectURL(item.file);

  return new Promise((resolve) => {
    const image = new Image();
    let settled = false;

    function rejectPreview() {
      if (settled) return;
      settled = true;
      URL.revokeObjectURL(previewUrl);
      resolve(corruptImage(item));
    }

    image.addEventListener(
      "load",
      () => {
        if (settled) return;
        if (image.naturalWidth === 0 || image.naturalHeight === 0) {
          rejectPreview();
          return;
        }

        settled = true;
        resolve({
          ...item,
          height: image.naturalHeight,
          previewUrl,
          status: "ready",
          width: image.naturalWidth,
        });
      },
      { once: true },
    );
    image.addEventListener("error", rejectPreview, { once: true });
    image.src = previewUrl;
  });
}

export async function prepareImageFile(file: File, id: string): Promise<IntakeItem> {
  const validation = await validateImageFile(file, id);
  if (validation.status === "rejected") return validation;

  try {
    return await createPreview(validation);
  } catch {
    return corruptImage(validation);
  }
}
