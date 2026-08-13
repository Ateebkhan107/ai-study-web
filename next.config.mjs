/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,

  // Serve gzip/brotli compressed responses
  compress: true,

  // Remove X-Powered-By: Next.js header (minor security hardening)
  poweredByHeader: false,

  // Serve modern image formats — AVIF first, then WebP fallback.
  // This is critical for the 2 MB logo PNGs; Next.js will auto-convert
  // and serve appropriately-sized versions via the image optimizer.
  images: {
    formats: ["image/avif", "image/webp"],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
