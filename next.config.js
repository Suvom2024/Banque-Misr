/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Optimize image loading
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Enable compression
  compress: true,
  // Optimize production builds
  swcMinify: true,
  // Performance optimizations
  poweredByHeader: false,
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['apexcharts', 'react-apexcharts'],
  },
  // Webpack optimizations
  webpack: (config, { isServer, dev }) => {
    // Suppress build warnings for cleaner production output
    if (!dev) {
      config.infrastructureLogging = {
        level: 'error',
      }
      
      // Suppress specific webpack warnings
      config.ignoreWarnings = [
        { module: /node_modules\/@supabase/ },
        { file: /node_modules\/@supabase/ },
        { message: /Edge Runtime/ },
      ]
    }

    if (!isServer) {
      // Optimize client-side bundle
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        runtimeChunk: 'single',
        minimize: !dev, // Only minimize in production
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk for node_modules
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            // Separate chunk for heavy libraries
            apexcharts: {
              name: 'apexcharts',
              test: /[\\/]node_modules[\\/](apexcharts|react-apexcharts)[\\/]/,
              chunks: 'all',
              priority: 30,
            },
            // Common chunk for shared code
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        },
      }
    }
    return config
  },
  // Suppress Next.js build output warnings
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
}

module.exports = nextConfig






