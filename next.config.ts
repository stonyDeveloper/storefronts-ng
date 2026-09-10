import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "ng.jumia.is",
      },
      {
        protocol: "https",
        hostname: "jumia.com.ng",
      },
    ],
  },
};

export default nextConfig;
