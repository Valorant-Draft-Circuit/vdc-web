import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const IMAGE_HOSTS = [
  "cdn.discordapp.com",
  "media.valorant-api.com",
  "uni-objects.nyc3.cdn.digitaloceanspaces.com",
  "vdc-assets.nyc3.cdn.digitaloceanspaces.com",
  "blog.vdc.gg",
  "images.unsplash.com",
];

const imageSources = IMAGE_HOSTS.map((host) => `https://${host}`).join(" ");

// Enforced everywhere: these directives cannot break page rendering.
const enforcedCsp = [
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

// Report-only until the browser console stays clean, then merge into enforcedCsp.
const proposedCsp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://static.cloudflareinsights.com${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${imageSources} https://i.ytimg.com`,
  "font-src 'self' data:",
  `connect-src 'self' https://cdn.discordapp.com https://valorant-api.com https://cloudflareinsights.com wss://vdc.gg${isDev ? " ws://localhost:*" : ""}`,
  "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://challenges.cloudflare.com",
  "form-action 'self' https://discord.com https://auth.riotgames.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: enforcedCsp },
  { key: "Content-Security-Policy-Report-Only", value: proposedCsp },
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      ...IMAGE_HOSTS.map((hostname) => ({
        protocol: "https" as const,
        hostname,
      })),
      ...(isDev ? [{ protocol: "http" as const, hostname: "localhost" }] : []),
    ],
  },
  serverExternalPackages: ["@prisma/client", ".prisma/client"],
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
