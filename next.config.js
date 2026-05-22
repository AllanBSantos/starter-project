/** @type {import('next').NextConfig} */
const nextConfig = {
  // Empty turbopack config (server-side deps like Bull/Redis handled automatically)
  turbopack: {},
  async headers() {
    return [
      {
        source: '/pyodide-worker.js',
        headers: [
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
