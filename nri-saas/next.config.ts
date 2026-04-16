import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  webpack: (config, { isServer }) => {
    // Ignore canvas module (used by pdfjs-dist for Node.js)
    config.resolve.alias.canvas = false
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
    }
    
    // Externalize canvas for server-side
    if (isServer) {
      config.externals = [...(config.externals || []), 'canvas']
    }
    
    return config
  },
}

export default nextConfig
