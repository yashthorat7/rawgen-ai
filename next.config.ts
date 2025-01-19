import { type NextConfig } from 'next';

const config: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'woozy-malamute-880.convex.cloud',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default config;
