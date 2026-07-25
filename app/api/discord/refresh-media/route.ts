import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  refreshDiscordMedia,
  type DiscordMedia,
} from "@/lib/queries/user/refreshDiscordMedia";

export const dynamic = "force-dynamic";

const COOLDOWN_MS = 10 * 60 * 1000;
const lastRefreshedAt = new Map<string, number>();
const inFlight = new Map<string, Promise<DiscordMedia>>();

const MAX_BURST_TOKENS = 10;
const TOKENS_PER_SECOND = 5;
let availableTokens = MAX_BURST_TOKENS;
let lastTokenRefill = Date.now();

function tryConsumeDiscordToken(): boolean {
  const now = Date.now();
  const refilled = ((now - lastTokenRefill) / 1000) * TOKENS_PER_SECOND;
  availableTokens = Math.min(MAX_BURST_TOKENS, availableTokens + refilled);
  lastTokenRefill = now;
  if (availableTokens >= 1) {
    availableTokens -= 1;
    return true;
  }
  return false;
}

async function urlIsBroken(url: string | null): Promise<boolean> {
  if (!url) {
    return false;
  }
  try {
    const res = await fetch(url, { cache: "no-store" });
    return !res.ok;
  } catch {
    return true;
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const userId = body?.userId;
  if (typeof userId !== "string" || userId.length === 0) {
    return Response.json({ image: null, banner: null }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { image: true, banner: true },
  });
  if (!user) {
    return Response.json({ image: null, banner: null }, { status: 404 });
  }

  const stored: DiscordMedia = { image: user.image, banner: user.banner };

  if (!process.env.DISCORD_BOT_TOKEN) {
    return Response.json(stored);
  }

  const last = lastRefreshedAt.get(userId);
  if (last && Date.now() - last < COOLDOWN_MS) {
    return Response.json(stored);
  }

  const [imageBroken, bannerBroken] = await Promise.all([
    urlIsBroken(user.image),
    urlIsBroken(user.banner),
  ]);
  if (!imageBroken && !bannerBroken) {
    return Response.json(stored);
  }

  let pending = inFlight.get(userId);
  if (!pending) {
    if (!tryConsumeDiscordToken()) {
      return Response.json(stored);
    }
    pending = refreshDiscordMedia(userId).finally(() => {
      inFlight.delete(userId);
      lastRefreshedAt.set(userId, Date.now());
    });
    inFlight.set(userId, pending);
  }

  const result = await pending;
  return Response.json(result);
}
