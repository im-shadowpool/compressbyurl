import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const rootDir = process.cwd();
const sourceFavicon = path.join(rootDir, "public", "media", "favicon.png.png");
const iconsDir = path.join(rootDir, "public", "icons");
const appDir = path.join(rootDir, "src", "app");
const publicDir = path.join(rootDir, "public");

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

function createIcoFromPngs(pngBuffers) {
  const count = pngBuffers.length;
  const headerSize = 6;
  const entrySize = 16;
  const dirSize = headerSize + entrySize * count;

  let totalSize = dirSize;
  for (const item of pngBuffers) {
    totalSize += item.buffer.length;
  }

  const ico = Buffer.alloc(totalSize);

  // Header
  ico.writeUInt16LE(0, 0); // Reserved
  ico.writeUInt16LE(1, 2); // Type 1 = ICO
  ico.writeUInt16LE(count, 4); // Number of images

  let currentOffset = dirSize;
  for (let i = 0; i < count; i++) {
    const item = pngBuffers[i];
    const entryOffset = headerSize + i * entrySize;

    ico.writeUInt8(item.width >= 256 ? 0 : item.width, entryOffset);
    ico.writeUInt8(item.height >= 256 ? 0 : item.height, entryOffset + 1);
    ico.writeUInt8(0, entryOffset + 2); // Color palette
    ico.writeUInt8(0, entryOffset + 3); // Reserved
    ico.writeUInt16LE(1, entryOffset + 4); // Color planes
    ico.writeUInt16LE(32, entryOffset + 6); // Bits per pixel
    ico.writeUInt32LE(item.buffer.length, entryOffset + 8); // Size of image data
    ico.writeUInt32LE(currentOffset, entryOffset + 12); // Offset of image data

    item.buffer.copy(ico, currentOffset);
    currentOffset += item.buffer.length;
  }

  return ico;
}

async function main() {
  console.log("Generating favicons from:", sourceFavicon);

  // 1. 16x16 PNG
  const png16 = await sharp(sourceFavicon)
    .resize(16, 16, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();

  // 2. 32x32 PNG
  const png32 = await sharp(sourceFavicon)
    .resize(32, 32, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();

  // 3. 48x48 PNG
  const png48 = await sharp(sourceFavicon)
    .resize(48, 48, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();

  // 4. 180x180 Apple Touch Icon
  const appleTouch = await sharp(sourceFavicon)
    .resize(180, 180, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();

  // 5. 192x192 Android / Google Search snippet
  const png192 = await sharp(sourceFavicon)
    .resize(192, 192, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();

  // 6. 512x512 PWA / high-res
  const png512 = await sharp(sourceFavicon)
    .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();

  // 7. Brand avatar (96x96) for crisp header/footer logo
  const brandAvatar = await sharp(sourceFavicon)
    .resize(96, 96, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();

  // Generate multi-resolution ICO (16, 32, 48)
  const icoBuffer = createIcoFromPngs([
    { width: 16, height: 16, buffer: png16 },
    { width: 32, height: 32, buffer: png32 },
    { width: 48, height: 48, buffer: png48 },
  ]);

  // Write outputs
  fs.writeFileSync(path.join(publicDir, "favicon.ico"), icoBuffer);
  fs.writeFileSync(path.join(appDir, "favicon.ico"), icoBuffer);

  fs.writeFileSync(path.join(iconsDir, "icon-32.png"), png32);
  fs.writeFileSync(path.join(appDir, "icon.png"), png32);

  fs.writeFileSync(path.join(iconsDir, "apple-touch-icon.png"), appleTouch);
  fs.writeFileSync(path.join(appDir, "apple-icon.png"), appleTouch);

  fs.writeFileSync(path.join(iconsDir, "icon-192.png"), png192);
  fs.writeFileSync(path.join(iconsDir, "icon-512.png"), png512);
  fs.writeFileSync(path.join(iconsDir, "brand-avatar.png"), brandAvatar);

  console.log("Successfully generated all icons:");
  console.log("- public/favicon.ico & src/app/favicon.ico:", icoBuffer.length, "bytes");
  console.log("- public/icons/icon-32.png & src/app/icon.png:", png32.length, "bytes");
  console.log("- public/icons/apple-touch-icon.png & src/app/apple-icon.png:", appleTouch.length, "bytes");
  console.log("- public/icons/icon-192.png:", png192.length, "bytes");
  console.log("- public/icons/icon-512.png:", png512.length, "bytes");
  console.log("- public/icons/brand-avatar.png:", brandAvatar.length, "bytes");
}

main().catch((err) => {
  console.error("Error generating favicons:", err);
  process.exit(1);
});
