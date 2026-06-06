/** @type {import('next').NextConfig} */
// NOTE: Do NOT use API_INTERNAL_URL here — it is a runtime env var for the
// middleware only. Rewrites are baked at BUILD TIME so we must detect Vercel
// via VERCEL_ENV which Vercel always sets automatically during the build.
const rewriteBackendUrl = process.env.VERCEL_ENV
  ? "https://study-nook-server-peach.vercel.app"
  : "http://localhost:5000";

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: `${rewriteBackendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
