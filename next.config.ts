import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  poweredByHeader: false,
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
      ...(isDev
        ? [{ protocol: "http" as const, hostname: "localhost" }]
        : []),
      {
        protocol: "https",
        hostname: "vdc-assets.nyc3.cdn.digitaloceanspaces.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  serverExternalPackages: ["@prisma/client", ".prisma/client"],
};

export default nextConfig;
