/** @type {import('next').NextConfig} */
const nextConfig = {
  // optionally set output to "standalone" for Docker builds
  // https://nextjs.org/docs/pages/api-reference/next-config-js/output
  output: process.env.NEXT_CONFIG_OUTPUT,

  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],

  // we're open-source, so we can provide source maps
  productionBrowserSourceMaps: true,

  poweredByHeader: false,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.featurebase-attachments.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  async rewrites() {
    return [];
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            // needed for stripe connect embedded components
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          {
            key: "Permissions-Policy",
            value: "",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          ...process.env.NEXT_PUBLIC_STACK_IS_PREVIEW === "true" ? [] : [{
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          }],
          {
            key: "Content-Security-Policy",
            value: "",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
