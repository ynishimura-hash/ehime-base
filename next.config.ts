import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/babybase',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
