import "server-only";
import { LeagueStatus } from "@prisma/client";
import { TIERS_LIST } from "@/lib/common/constants/tiers";
import { meilisearchClient } from "@/lib/meilisearch/meilisearch";
import { prisma } from "@/lib/prisma";
import { MeiliPlayer } from "@/lib/types/meilisearch";

export const PLAYER_SEARCH_PAGE_SIZE = 30;
const MAX_QUERY_LENGTH = 50;
const MAX_PAGE = 33;

const PUBLIC_ATTRIBUTES = [
  "id",
  "discordId",
  "discordName",
  "riotIGN",
  "tier",
  "teamName",
  "franchiseSlug",
  "franchiseLogo",
  "leagueStatus",
  "image",
  "banner",
];

const TIER_VALUES = new Set<string>(TIERS_LIST);
const STATUS_VALUES = new Set<string>(Object.values(LeagueStatus));

export type PlayerSearchInput = {
  query?: unknown;
  page?: unknown;
  tier?: unknown;
  statuses?: unknown;
};

export type PlayerSearchResult = { hits: MeiliPlayer[]; hasMore: boolean };

/** MMR is never stored in the search index; it is read from the database only when it is public. */
async function attachMmr(hits: MeiliPlayer[]): Promise<void> {
  if (hits.length === 0) return;
  const users = await prisma.user.findMany({
    where: { id: { in: hits.map((hit) => String(hit.id)) } },
    select: {
      id: true,
      PrimaryRiotAccount: {
        select: { MMR: { select: { mmrEffective: true } } },
      },
    },
  });
  const mmrByUserId = new Map(
    users.map((user) => [
      user.id,
      user.PrimaryRiotAccount?.MMR?.mmrEffective ?? null,
    ]),
  );
  for (const hit of hits) {
    hit.mmrEffective = mmrByUserId.get(String(hit.id)) ?? null;
  }
}

/** Every filter value is checked against a fixed list, so nothing user-typed reaches the filter string. */
export async function searchPlayers(
  input: PlayerSearchInput,
  options: { includeMmr: boolean },
): Promise<PlayerSearchResult> {
  const query =
    typeof input.query === "string" ? input.query.slice(0, MAX_QUERY_LENGTH) : "";
  const page =
    typeof input.page === "number" && Number.isInteger(input.page)
      ? Math.min(Math.max(input.page, 0), MAX_PAGE)
      : 0;

  const filters: string[] = [];
  if (typeof input.tier === "string" && TIER_VALUES.has(input.tier)) {
    filters.push(`tier = "${input.tier}"`);
  }
  if (Array.isArray(input.statuses)) {
    const statuses = input.statuses.filter(
      (status): status is string =>
        typeof status === "string" && STATUS_VALUES.has(status),
    );
    if (statuses.length > 0) {
      filters.push(
        statuses.map((status) => `leagueStatus = "${status}"`).join(" OR "),
      );
    }
  }

  const result = await meilisearchClient.getIndex("players").search(query, {
    limit: PLAYER_SEARCH_PAGE_SIZE,
    offset: page * PLAYER_SEARCH_PAGE_SIZE,
    filter: filters,
    attributesToRetrieve: PUBLIC_ATTRIBUTES,
  });

  const hits = result.hits as MeiliPlayer[];
  if (options.includeMmr) await attachMmr(hits);
  return { hits, hasMore: hits.length === PLAYER_SEARCH_PAGE_SIZE };
}
