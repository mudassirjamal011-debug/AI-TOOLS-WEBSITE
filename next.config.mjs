/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  // Allow the app to be served through preview / tunnel hostnames in dev.
  allowedDevOrigins: ['*.e2b.app', '*.arena.ai', '*.vercel.app', 'localhost'],
  images: {
    formats: ['image/webp'],
  },
  experimental: {
    // pdf.js ships a large ESM bundle; keep imports tree-shaken.
    optimizePackageImports: ['lucide-react'],
  },
  async headers() {
    return [
      {
        source: '/pdf.worker.min.mjs',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        // Privacy: our browser-based tools never need third-party framing.
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
    ];
  },
};

export default nextConfig;
