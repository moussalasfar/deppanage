import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/** @type {import('next').NextConfig} */

// On GitHub Pages the site is served from https://<user>.github.io/<repo>/,
// so every asset needs the repo name as a prefix. The workflow sets this;
// locally it stays empty and the app runs at /.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig = {
  // A stray package-lock.json in the home directory makes Next guess the wrong
  // workspace root, so pin it to this folder.
  turbopack: { root: dirname(fileURLToPath(import.meta.url)) },

  // Fully static build — no server, no API routes. Output lands in ./out
  output: 'export',

  basePath,
  assetPrefix: basePath || undefined,

  // Serve /demander as /demander/index.html, which is what static hosts expect
  trailingSlash: true,

  // next/image optimisation needs a server; static export has none
  images: { unoptimized: true },
};

export default nextConfig;
