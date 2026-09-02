/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Accept the sandbox preview host and any local origins
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [{ key: 'X-Frame-Options', value: 'SAMEORIGIN' }],
      },
    ];
  },
};

export default nextConfig;
