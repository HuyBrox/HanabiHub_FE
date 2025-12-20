import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Cho phép build ngay cả khi có lỗi ESLint
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Cho phép build ngay cả khi có lỗi TS
    ignoreBuildErrors: true,
  },
  images: {
    // Không tối ưu ảnh (phù hợp khi deploy Vercel free hoặc static host)
    unoptimized: true,
  },

  // Tối ưu performance
  poweredByHeader: false, // Remove X-Powered-By header

  // Fix warning về multiple lockfiles
  outputFileTracingRoot: __dirname,

  // Experimental features để tối ưu
  experimental: {
    optimizePackageImports: ['lucide-react'], // Tree-shake icons
  },

  // Headers để cache static assets
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png|webp|gif|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
