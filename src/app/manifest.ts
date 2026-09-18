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
        src: "/media/hero/shiz%20(12).webp",
        sizes: "1200x1200",
        type: "image/webp",
        purpose: "any",
      },
      {
        src: "/icons/app-icon-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
