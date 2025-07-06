/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/socket.io/:path*',
        destination: '/api/socket/:path*', // /socket.io로 들어오는 요청을 /api/socket으로 리다이렉트
      },
    ];
  },
};

module.exports = nextConfig;