import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'images-americanas.b2w.io',
      },
      {
        protocol: 'https',
        hostname: 'a-static.mlcdn.com.br',
      },
      {
        protocol: 'https',
        hostname: '*.alicdn.com',
      },
      {
        protocol: 'https',
        hostname: 'http2.mlstatic.com',
      },
    ],
  },
};

export default nextConfig;
