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
    ],
  },
  serverExternalPackages: ["@prisma/client", ".prisma/client"],
};

export default nextConfig;

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
