/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: this disables ESLint during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: this disables TypeScript type checking during builds
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["pbs.twimg.com"], // Allow Twitter profile images
  },
};

module.exports = nextConfig;
