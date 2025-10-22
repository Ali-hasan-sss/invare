/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    loader: "default",
    domains: [],
    formats: ["image/webp", "image/avif"],
  },
  assetPrefix: "",
  trailingSlash: false,
  output: "standalone",
  experimental: {
    outputFileTracingRoot: undefined,
  },
  async rewrites() {
    return [
      {
        source: "/images/:path*",
        destination: "/images/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/sitemap.xml",
        destination: "/api/sitemap",
      },
    ];
  },
};

module.exports = nextConfig;
