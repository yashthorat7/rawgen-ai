import { type NextConfig } from "next";

const config: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "woozy-malamute-880.convex.cloud",
      },
      {
        protocol: "https",
        hostname: "assets.leetcode.com",
      },
      {
        protocol: "https",
        hostname: "leetcode.com",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default config;
