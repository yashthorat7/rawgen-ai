import { type NextConfig } from 'next';

const config: NextConfig = {
  images: {
    domains: ['woozy-malamute-880.convex.cloud'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default config;
