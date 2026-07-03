import type { ReactNode } from "react";
import Image from "next/image";
import { GameType } from "@prisma/client";
import { agentToUrlSlug } from "@/lib/common/agents";
import { TEAM_LOGOS_URL } from "@/lib/common/constants/urls";
import { getAgentCatalog } from "@/lib/queries/agents/getAgentCatalog";
import {
  getPlayerAgentBreakdown,
  type BestGameRef,
  type PlayerAgentBreakdown,
} from "@/lib/queries/stats/getPlayerAgentBreakdown";
import { getTeamLogoMap } from "@/lib/queries/teams/teams";
import { getPlayerByRiotIGN } from "@/lib/queries/user/user";
import type { PlayerProfile } from "@/lib/types/player";
import NoAgentStats from "./NoAgentStats";
import PlayerAgents from "./PlayerAgents";

type Props = {
  riotIGN: string;
  season: number;
  gameType: GameType;
  basePath: string;
  searchParams: Record<string, string | string[] | undefined>;
};

function pickBestAcrossEntries(
  entries: PlayerAgentBreakdown[],
): BestGameRef | null {
  let best: BestGameRef | null = null;
  for (const e of entries) {
    if (!e.bestGame) continue;
    if (
      best === null ||
      e.bestGame.acs > best.acs ||
      (e.bestGame.acs === best.acs && e.bestGame.kills > best.kills)
    ) {
      best = e.bestGame;
    }
  }
  return best;
}

function collectTeamIds(refs: Array<BestGameRef | null | undefined>): number[] {
  const ids = new Set<number>();
  for (const r of refs) {
    if (!r) continue;
    if (r.home !== null) ids.add(r.home);
    if (r.away !== null) ids.add(r.away);
  }
  return Array.from(ids);
}

function buildCaptureLabel(
  playerInfo: PlayerProfile | null,
  season: number,
): ReactNode {
  if (!playerInfo) return null;
  const ign = playerInfo.PrimaryRiotAccount?.riotIGN;
  if (!ign) return null;
  const team = playerInfo.Team;
  if (!team) {
    return <h2 className="text-[10px] font-normal">{ign}</h2>;
  }
  const logo = team.Franchise.Brand?.logo;
  return (
    <>
      <h2 className="text-[10px] font-normal">{ign}</h2>
      <h2 className="flex items-center gap-1 text-[10px] font-normal">
        <span>
          {team.Franchise.slug} | {team.name}
        </span>
        {logo && (
          <Image
            src={`${TEAM_LOGOS_URL}${logo}`}
            alt={team.Franchise.slug}
            width={50}
            height={50}
            priority
            className="size-5"
          />
        )}
      </h2>
      <h2 className="text-[10px] font-normal">
        S{season} {team.tier}
      </h2>
    </>
  );
}

export default async function PlayerAgentsLoader({
  riotIGN,
  season,
  gameType,
  basePath,
  searchParams,
}: Props) {
  const catalog = await getAgentCatalog();
  const breakdown = await getPlayerAgentBreakdown({
    riotIgn: riotIGN,
    season,
    gameType,
    catalog,
  });

  if (breakdown.length === 0) {
    const inverse =
      gameType === GameType.SEASON ? GameType.COMBINE : GameType.SEASON;
    const fallback = await getPlayerAgentBreakdown({
      riotIgn: riotIGN,
      season,
      gameType: inverse,
      catalog,
    });

    if (fallback.length === 0) {
      return (
        <NoAgentStats
          variant="empty"
          currentPlayerHref={basePath}
          searchParams={searchParams}
        />
      );
    }

    if (gameType === GameType.SEASON) {
      const bestCombineGame = pickBestAcrossEntries(fallback);
      const teamMap = await getTeamLogoMap(collectTeamIds([bestCombineGame]));
      return (
        <NoAgentStats
          variant="season-empty-has-combine"
          currentPlayerHref={basePath}
          searchParams={searchParams}
          bestCombineGame={bestCombineGame}
          teamMap={teamMap}
        />
      );
    }

    return (
      <NoAgentStats
        variant="combine-empty-has-season"
        currentPlayerHref={basePath}
        searchParams={searchParams}
      />
    );
  }

  const mostPlayed = breakdown[0];
  const requestedSlug =
    typeof searchParams.agent === "string" ? searchParams.agent : undefined;
  const selected =
    breakdown.find(
      (e) =>
        agentToUrlSlug(e.catalog?.displayName ?? e.agent) === requestedSlug,
    ) ?? mostPlayed;
  const selectedSlug = agentToUrlSlug(
    selected.catalog?.displayName ?? selected.agent,
  );

  const teamIds = collectTeamIds(breakdown.map((e) => e.bestGame));
  const [teamMap, playerInfo] = await Promise.all([
    getTeamLogoMap(teamIds),
    getPlayerByRiotIGN(riotIGN),
  ]);
  const captureLabel = buildCaptureLabel(playerInfo, season);

  return (
    <PlayerAgents
      breakdown={breakdown}
      selected={selected}
      selectedSlug={selectedSlug}
      gameType={gameType}
      teamMap={teamMap}
      basePath={basePath}
      searchParams={searchParams}
      captureLabel={captureLabel}
    />
  );
}
