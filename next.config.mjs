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

};

export default nextConfig;
