/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@repo/trpc",
    "@repo/services",
    "@repo/database",
    "@repo/logger",
  ],
};

export default nextConfig;
