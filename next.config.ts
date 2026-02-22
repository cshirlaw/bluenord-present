/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep if you expose /investors/reports in Present; harmless if the source path doesn't exist
  async redirects() {
    return [
      { source: '/investors/presentations', destination: '/investors/reports', permanent: true },
    ];
  },

  async headers() {
    return [
      // 1) Global headers — Vimeo everywhere (for embedded videos in slides/microsites)
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'", // lean global policy
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://i.vimeocdn.com https://f.vimeocdn.com",
              "font-src 'self' data:",
              "connect-src 'self' https://player.vimeo.com https://i.vimeocdn.com https://f.vimeocdn.com",
              "frame-src https://player.vimeo.com",
              "worker-src 'self' blob:",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'geolocation=(), camera=(), microphone=()' },
        ],
      },

      // 2) Share page — only if Present also hosts /investors/share with TradingView
      {
        source: '/investors/share',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://s3.tradingview.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://*.tradingview.com https://i.vimeocdn.com https://f.vimeocdn.com",
              "font-src 'self' data: https://*.tradingview.com",
              "connect-src 'self' https://*.tradingview.com https://player.vimeo.com https://i.vimeocdn.com https://f.vimeocdn.com",
              "frame-src https://*.tradingview.com https://player.vimeo.com",
              "worker-src 'self' blob:",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'geolocation=(), camera=(), microphone=()' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;