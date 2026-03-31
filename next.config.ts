import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This should strip out console logs in production, but keep warnings and errors
  // compiler: {
  //   removeConsole:
  //     process.env.NODE_ENV === "production"
  //       ? {
  //           exclude: ["warn", "error"],
  //         }
  //       : false,
  // },
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
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "media.valorant-api.com",
      },
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
