import { Metadata } from "next";
import { Tier } from "@prisma/client";

import { auth } from "@/lib/auth/auth";
import { getUserRoles, hasAccess } from "@/lib/auth/access";
import { getAgentsCached, getSeasonCached } from "@/lib/common/cache";
import { buildAgentOptions } from "@/lib/common/constants/agents";
import { TIERS_LIST } from "@/lib/common/constants/tiers";
import { MODERATION_ROLES } from "@/lib/common/constants/roles";
import {
  getLeaderboard,
  type LeaderboardScope,
} from "@/lib/queries/pickems/getLeaderboard";
import { getMyGroups, getGroup } from "@/lib/queries/pickems/getGroups";
import { getGroupLeaderboard } from "@/lib/queries/pickems/getGroupLeaderboard";
import LeaderboardScopes from "@/components/pickems/leaderboard/LeaderboardScopes";
import LeaderboardTable from "@/components/pickems/leaderboard/LeaderboardTable";
import GroupLeaderboardTable from "@/components/pickems/leaderboard/GroupLeaderboardTable";
import GroupScopeTitle from "@/components/pickems/groups/GroupScopeTitle";
import HubButton from "@/components/pickems/common/HubButton";
import {
  PICKEM_FIRST_SEASON,
  requirePickemsEnabled,
} from "@/lib/pickems/guard";

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
  await requirePickemsEnabled();

  const [sp, currentSeason, session] = await Promise.all([
    searchParams,
    getSeasonCached(),
    auth(),
  ]);

  const scopeParam = typeof sp.scope === "string" ? sp.scope : undefined;
  const viewParam = typeof sp.view === "string" ? sp.view : undefined;
  const season =
    typeof sp.season === "string" &&
    !Number.isNaN(Number(sp.season)) &&
    Number(sp.season) >= PICKEM_FIRST_SEASON
      ? Number(sp.season)
      : currentSeason;

  const isGroupRanking = scopeParam === "groups";
  const { scope, key: scopeKey } = parseScope(scopeParam);
  const { tier, view } = parseView(viewParam);
  const viewerId = session?.user?.id ?? null;

  const isGroupScope = !isGroupRanking && scope.kind === "group";
  const scopedGroupId = scope.kind === "group" ? scope.groupId : null;

  const [rows, groupRows, groups, activeGroup] = await Promise.all([
    isGroupRanking ? Promise.resolve([]) : getLeaderboard(season, tier, scope),
    isGroupRanking ? getGroupLeaderboard(season, tier) : Promise.resolve([]),
    viewerId ? getMyGroups(viewerId, season) : Promise.resolve([]),
    isGroupScope && scopedGroupId !== null
      ? getGroup(scopedGroupId)
      : Promise.resolve(null),
  ]);

  const canModerate =
    viewerId && (isGroupRanking || isGroupScope)
      ? hasAccess(await getUserRoles(viewerId), MODERATION_ROLES)
      : false;

  const linkTier = view === "overall" ? "mythic" : view;
  const activeScopeKey = isGroupRanking ? "groups" : scopeKey;

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

      <LeaderboardScopes scope={activeScopeKey} view={view} groups={groups} />

      {activeGroup && (
        <GroupScopeTitle
          groupId={activeGroup.id}
          name={activeGroup.name}
          image={activeGroup.image}
          isOwner={activeGroup.ownerID === viewerId}
          ownerName={activeGroup.Owner?.name ?? "Unknown"}
          canModerate={canModerate}
          season={season}
          agentOptions={buildAgentOptions(await getAgentsCached())}
        />
      )}

      {isGroupRanking ? (
        <GroupLeaderboardTable
          rows={groupRows}
          season={season}
          view={view}
          canModerate={canModerate}
        />
      ) : (
        <LeaderboardTable
          rows={rows}
          viewerId={viewerId}
          season={season}
          linkTier={linkTier}
          showTotals={view === "overall"}
        />
      )}

      <p className="text-[11px] text-vdcGrey dark:text-gray-400">
        {isGroupRanking
          ? "Group score = average points of members who made picks. The Members column shows participants out of total. Ties broken by total points."
          : "Ties broken by accuracy. Overall ranks by average points across your tiers with resolved results; sort the Total column to rank by combined points instead."}
      </p>
    </div>
  );
}
