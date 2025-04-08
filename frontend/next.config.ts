import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
    ];
  },
  images: {
    domains: ['localhost'],
    // Add placeholder images support for the video call UI
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.placeholder.com',
        pathname: '/**',
      },
    ],
  },
  // Set environment variables for the frontend
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080',
  },
  // Enable webpack 5 for better performance
  webpack(config) {
    return config;
  },
  // Support for internationalization if needed in the future
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
  // Optimize output for improved performance
  output: 'standalone',
  // Disable automatic static optimization for pages that need
  // server-side features like authentication
  experimental: {
    // Modern optimizations
    optimizeCss: true,
    scrollRestoration: true,
  },
};

export default nextConfig;