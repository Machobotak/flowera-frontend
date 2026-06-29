import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Proxy backend auth/seller API
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/:path*`,
      },
      // Proxy uploads folder from backend
      {
        source: "/uploads/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/uploads/:path*`,
      },
      // Proxy regional API (provinces, cities, districts)
      {
        source: "/regional-api/:path*",
        destination: `${process.env.NEXT_PUBLIC_REGIONAL_API || "http://localhost:3002"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
