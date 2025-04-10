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
  };
  
  module.exports = nextConfig;