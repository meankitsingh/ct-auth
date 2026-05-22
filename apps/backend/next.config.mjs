/** @type {import('next').NextConfig} */
const nextConfig = {
  // optionally set output to "standalone" for Docker builds
  // https://nextjs.org/docs/pages/api-reference/next-config-js/output
  output: process.env.NEXT_CONFIG_OUTPUT,

  // we're open-source, so we can provide source maps
  productionBrowserSourceMaps: true,
  poweredByHeader: false,

  experimental: {
    serverMinification: false,  // needs to be disabled for oidc-provider to work, which relies on the original constructor names
  },

  serverExternalPackages: [
    'oidc-provider',
  ],

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
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
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
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
