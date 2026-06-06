/** @type {import('next').NextConfig} */
const isVercel = !!process.env.VERCEL_ENV;

const apiUrl =
  process.env.API_INTERNAL_URL ||
  (isVercel
    ? "https://study-nook-server-peach.vercel.app"
    : "http://localhost:5000");

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
