import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
      },
      {
        protocol: "https",
        hostname: "media.valorant-api.com",
      },
      {
        protocol: "https",
        hostname: "uni-objects.nyc3.cdn.digitaloceanspaces.com",
      },
      {
        protocol: "https",
        hostname: "blog.vdc.gg",
      },
      {
        protocol: "http",
        hostname: "localhost"
      }
    ],
  },
  serverExternalPackages: ["@prisma/client", ".prisma/client"],
};

export default nextConfig;