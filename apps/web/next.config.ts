import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@ai-web-scout/shared'],
  poweredByHeader: false,
};

export default nextConfig;
