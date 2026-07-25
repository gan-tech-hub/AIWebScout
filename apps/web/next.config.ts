import { loadEnvConfig } from '@next/env';
import type { NextConfig } from 'next';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const webDirectory = dirname(fileURLToPath(import.meta.url));
loadEnvConfig(
  resolve(webDirectory, '../..'),
  process.env.NODE_ENV !== 'production',
  console,
  true,
);

const nextConfig: NextConfig = {
  transpilePackages: ['@ai-web-scout/shared'],
  poweredByHeader: false,
};

export default nextConfig;
