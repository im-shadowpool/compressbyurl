import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  async redirects() {
    return [
      {
        destination: "/compress-image-from-url",
        permanent: true,
        source: "/compress-by-url",
      },
      {
        destination: "/compress-image-from-url",
        permanent: true,
        source: "/image-url-compressor",
      },
      {
        destination: "/compress-image-from-url",
        permanent: true,
        source: "/optimize-image-from-url",
      },
      {
        destination: "/website-image-optimizer",
        permanent: true,
        source: "/optimize-images-from-webpage",
      },
    ];
  },
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
