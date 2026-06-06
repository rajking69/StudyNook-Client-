/** @type {import('next').NextConfig} */
const apiUrl =
  process.env.API_INTERNAL_URL ||
  (process.env.VERCEL_ENV === "production"
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
