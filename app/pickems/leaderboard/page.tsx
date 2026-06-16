import { Metadata } from "next";
import { Tier } from "@prisma/client";

import { auth } from "@/lib/auth/auth";
import { getSeasonCached } from "@/lib/common/cache";
import { TIERS_LIST } from "@/lib/common/constants/tiers";
import {
  getLeaderboard,
  type LeaderboardScope,
} from "@/lib/queries/pickems/getLeaderboard";
import { getMyGroups } from "@/lib/queries/pickems/getGroups";
import LeaderboardScopes from "@/components/pickems/leaderboard/LeaderboardScopes";
import LeaderboardTable from "@/components/pickems/leaderboard/LeaderboardTable";
import GroupScopeTitle from "@/components/pickems/groups/GroupScopeTitle";
import HubButton from "@/components/pickems/common/HubButton";

export const metadata: Metadata = {
  title: "VDC | Pick'ems Leaderboard",
  description: "Pick'ems standings across the league.",
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const TIER_SLUGS = new Set(TIERS_LIST.map((t) => t.toLowerCase()));

function parseScope(raw: string | undefined): {
  scope: LeaderboardScope;
  key: string;
} {
  if (raw && raw.startsWith("group:")) {
    const groupId = Number(raw.slice("group:".length));
    if (!Number.isNaN(groupId))
      return { scope: { kind: "group", groupId }, key: raw };
  }
  return { scope: { kind: "global" }, key: "global" };
}

function parseView(raw: string | undefined): {
  tier: Tier | null;
  view: string;
} {
  if (raw && TIER_SLUGS.has(raw))
    return { tier: raw.toUpperCase() as Tier, view: raw };
  return { tier: null, view: "overall" };
}

export default async function LeaderboardPage({ searchParams }: Props) {
  const [sp, currentSeason, session] = await Promise.all([
    searchParams,
    getSeasonCached(),
    auth(),
  ]);

  const scopeParam = typeof sp.scope === "string" ? sp.scope : undefined;
  const viewParam = typeof sp.view === "string" ? sp.view : undefined;
  const season =
    typeof sp.season === "string" && !Number.isNaN(Number(sp.season))
      ? Number(sp.season)
      : currentSeason;

  const { scope, key: scopeKey } = parseScope(scopeParam);
  const { tier, view } = parseView(viewParam);
  const viewerId = session?.user?.id ?? null;

  const [rows, groups] = await Promise.all([
    getLeaderboard(season, tier, scope),
    viewerId ? getMyGroups(viewerId, season) : Promise.resolve([]),
  ]);

  const linkTier = view === "overall" ? "mythic" : view;
  const activeGroup =
    scope.kind === "group"
      ? (groups.find((group) => group.id === scope.groupId) ?? null)
      : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <HubButton />
          <h1 className="text-2xl font-extrabold">
            LEADER<b className="text-vdcRed">BOARD</b>
          </h1>
        </div>
        <h2 className="rounded-lg border border-black/10 bg-black/5 px-3 py-1.5 text-sm font-semibold dark:border-white/10 dark:bg-black/25">
          Season {season}
        </h2>
      </div>

      <LeaderboardScopes scope={scopeKey} view={view} groups={groups} />

      {activeGroup && (
        <GroupScopeTitle
          groupId={activeGroup.id}
          name={activeGroup.name}
          image={activeGroup.image}
          isOwner={activeGroup.isOwner}
        />
      )}

      <LeaderboardTable
        rows={rows}
        viewerId={viewerId}
        season={season}
        linkTier={linkTier}
      />

      <p className="text-[11px] text-vdcGrey dark:text-gray-400">
        Ties broken by accuracy. Overall = sum of points across every tier you
        played.
      </p>
    </div>
  );
}
