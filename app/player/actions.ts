"use server";

import { headers } from "next/headers";
import { ControlPanel } from "@/prisma";
import { clientIpFrom, isRateLimited } from "@/lib/common/rateLimit";
import {
  PlayerSearchInput,
  PlayerSearchResult,
  searchPlayers,
} from "@/lib/meilisearch/searchPlayers";

const SEARCH_LIMIT_PER_MINUTE = 120;
const MMR_STATE_TTL_MS = 30_000;

let mmrState: { visible: boolean; expiresAt: number } | null = null;

async function isMmrVisible(): Promise<boolean> {
  if (mmrState && mmrState.expiresAt > Date.now()) return mmrState.visible;
  const visible = Boolean(await ControlPanel.getMMRDisplayState());
  mmrState = { visible, expiresAt: Date.now() + MMR_STATE_TTL_MS };
  return visible;
}

export async function searchPlayersAction(
  input: PlayerSearchInput,
): Promise<PlayerSearchResult> {
  const ip = clientIpFrom(await headers());
  if (isRateLimited(`player-search:${ip}`, SEARCH_LIMIT_PER_MINUTE, 60_000)) {
    return { hits: [], hasMore: false };
  }

  try {
    return await searchPlayers(input ?? {}, {
      includeMmr: await isMmrVisible(),
    });
  } catch (error) {
    console.error("[player-search] search failed", error);
    return { hits: [], hasMore: false };
  }
}
