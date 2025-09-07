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
  experimental: {
    // Thêm IP LAN/dev domain để tránh warning cross-origin
    allowedDevOrigins: ["http://192.168.1.4"],
    // Nếu muốn cho phép tất cả IP trong mạng LAN:
    // allowedDevOrigins: ["http://192.168.1.0/24"]
  },
};

export default nextConfig;
