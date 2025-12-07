/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // ✅ Bật lại - Hydration warning đã được fix bằng ExtensionCleanup
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
  async rewrites() {
    return [
      // Proxy API requests to backend during development so cookies are sent as same-site
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_PROXY || 'http://localhost:8080/api/v1/:path*',
      },
    ];
  },

};

export default nextConfig;
