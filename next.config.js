/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.resolve.fallback = { 
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      dns: false,
    };
    
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@google-cloud/speech': false,
        '@google-cloud/storage': false,
      };
    }
    
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['@google-cloud/speech', '@google-cloud/storage', 'fluent-ffmpeg']
  }
};

module.exports = nextConfig;
