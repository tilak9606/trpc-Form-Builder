const apiBase = process.env.API_BASE_URL || "http://localhost:8000";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@repo/trpc",
    "@repo/services",
    "@repo/database",
    "@repo/logger",
  ],
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${apiBase}/api/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;
