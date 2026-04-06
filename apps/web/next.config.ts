import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/** Monorepo root (estateiq/), parent of apps/ and packages/ */
const monorepoRoot = path.join(__dirname, "../..");

const nextConfig: NextConfig = {
  // Trace workspace files from repo root (Netlify monorepo + custom Prisma output).
  outputFileTracingRoot: monorepoRoot,
  // Keep Prisma as external (runtime env + native engine). Do NOT list `@estateiq/database` here —
  // it lives outside `node_modules` and externalizing it drops the generated query-engine binaries
  // from the Netlify bundle (Prisma looks for `libquery_engine-rhel-openssl-3.0.x.so.node`).
  serverExternalPackages: ["@prisma/client", "prisma"],
  // Paths relative to apps/web (Next project dir). Copy script mirrors engines into src/generated/prisma for Netlify.
  outputFileTracingIncludes: {
    "/*": [
      "../../packages/database/src/generated/prisma/**/*",
      "src/generated/prisma/**/*",
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options',           value: 'DENY'              },
          { key: 'X-Content-Type-Options',    value: 'nosniff'           },
          { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-XSS-Protection',          value: '1; mode=block'     },
        ],
      },
    ]
  },


  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
