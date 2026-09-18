import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CompressByURL",
    short_name: "CompressByURL",
    description: "Compress, resize and convert static images privately in your browser.",
    start_url: "/",
    display: "standalone",
    background_color: "#fffdf8",
    theme_color: "#3c315b",
    orientation: "any",
    categories: ["productivity", "utilities", "photo"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
