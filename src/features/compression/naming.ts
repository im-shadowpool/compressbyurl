import type { ImageDimensions, StaticImageFormat } from "@/types/image";

import type { NamingSettings } from "./types";

const WINDOWS_RESERVED_NAME = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;
const UNSAFE_FILENAME_CHARACTERS = /[<>:"/\\|?*\u0000-\u001f]/g;

function safePart(value: string) {
  return value
    .normalize("NFKC")
    .replace(UNSAFE_FILENAME_CHARACTERS, "")
    .replace(/\s+/g, " ")
    .trim();
}

function sourceStem(inputName: string) {
  const withoutExtension = inputName.replace(/\.[^.]+$/, "");
  const safe = safePart(withoutExtension).replace(/[. ]+$/g, "");
  return safe && !WINDOWS_RESERVED_NAME.test(safe) ? safe : "image";
}

function applyLetterCase(
  value: string,
  letterCase: "lowercase" | "unchanged" | "uppercase",
) {
  if (letterCase === "lowercase") return value.toLocaleLowerCase();
  if (letterCase === "uppercase") return value.toLocaleUpperCase();
  return value;
}

export function extensionForFormat(format: StaticImageFormat) {
  return format === "jpeg" ? "jpg" : format;
}

export interface OutputNamingContext {
  dimensions?: ImageDimensions;
  page?: number;
  sequence?: number;
}

export function createOutputName(
  inputName: string,
  format: StaticImageFormat,
  naming: NamingSettings,
  context: OutputNamingContext = {},
) {
  const originalStem = sourceStem(inputName);
  const extension = extensionForFormat(format);
  const sequence =
    naming.mode === "pattern" ? naming.startNumber + (context.sequence ?? 0) : 1;
  const pattern =
    naming.mode === "pattern" && naming.pattern.trim() ? naming.pattern : "{name}";
  const includesExtension = naming.mode === "pattern" && pattern.includes("{ext}");
  const tokenValues: Readonly<Record<string, string>> = {
    ext: extension,
    format,
    height: context.dimensions ? String(context.dimensions.height) : "height",
    name: originalStem,
    number:
      naming.mode === "pattern"
        ? String(sequence).padStart(naming.padding, "0")
        : String(sequence),
    page: String(context.page ?? 1),
    width: context.dimensions ? String(context.dimensions.width) : "width",
  };
  const expanded = pattern.replace(
    /\{(name|ext|format|width|height|number|page)\}/g,
    (token) => tokenValues[token.slice(1, -1)] ?? token,
  );
  const composedStem =
    naming.mode === "original"
      ? originalStem
      : `${safePart(naming.prefix)}${safePart(expanded)}${safePart(naming.suffix)}`;
  const letterCase = naming.mode === "original" ? "unchanged" : naming.letterCase;
  const safeStem = applyLetterCase(composedStem, letterCase)
    .replace(/[. ]+$/g, "")
    .slice(0, 180);
  const finalStem =
    safeStem && !WINDOWS_RESERVED_NAME.test(safeStem) ? safeStem : "image";
  return includesExtension ? finalStem : `${finalStem}.${extension}`;
}

export function resolveUniqueOutputName(name: string, usedNames: Set<string>) {
  const normalized = name.toLocaleLowerCase();
  if (!usedNames.has(normalized)) {
    usedNames.add(normalized);
    return name;
  }

  const extensionMatch = name.match(/(\.[^.]+)$/);
  const extension = extensionMatch?.[1] ?? "";
  const stem = extension ? name.slice(0, -extension.length) : name;
  let copy = 2;
  let candidate = `${stem} (${copy})${extension}`;
  while (usedNames.has(candidate.toLocaleLowerCase())) {
    copy += 1;
    candidate = `${stem} (${copy})${extension}`;
  }
  usedNames.add(candidate.toLocaleLowerCase());
  return candidate;
}
