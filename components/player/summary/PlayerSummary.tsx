import { GameType, Prisma } from "@prisma/client";
import PlayerRating from "./PlayerRating";
import { PlayerStats } from "./PlayerStats";
import PlayerMatches from "./PlayerMatches";
import PlayerTeamCard from "./PlayerTeamCard";
import PlayerTeamHistory from "./PlayerTeamHistory";
import FreeAgentCard from "./FreeAgentCard";
import RolesPlayed from "./RolesPlayed";
import PlayerFormCard from "./PlayerFormCard";
import PlayerUpcomingCard from "./PlayerUpcomingCard";
import { deriveTeamIdFromStats } from "@/lib/common/player";
import { getTeamLogoMap, type TeamLogoMap } from "@/lib/queries/teams/teams";
import CombineDisclaimer from "@/components/player/CombineDisclaimer";
import {
  buildLobbyRosters,
  computeLobbyRanks,
  type MatchLobbyContext,
} from "@/lib/common/match";
import {
  getLobbyStatsForGames,
  type LobbyStatRow,
} from "@/lib/queries/stats/getLobbyStatsForGames";

export type StatsPayload = Prisma.PlayerStatsGetPayload<{
  include: { Game: { include: { Match: true } } };
}>;

export type ProcessedPlayerStat = StatsPayload & {
  rounds: number;
  totalDamage: number | null;
};

type Props = {
  stats: StatsPayload[] | null;
  gameType: string | undefined;
  season: number;
  currentSeason: number;
  hasTeam: boolean;
  mmr: number | null;
};

export default async function PlayerSummary({
  stats,
  gameType,
  season,
  currentSeason,
  hasTeam,
  mmr,
}: Props) {
  if (!stats || stats.length === 0) {
    return <NoStats />;
  }

  const processedPlayerStats: ProcessedPlayerStat[] = stats.map((s) => ({
    ...s,
    rounds: s.Game.rounds,
    totalDamage: s.damage,
  }));

  const isCombine = gameType?.toUpperCase() === GameType.COMBINE;
  const [teamMap, lobbyContextByStatId] = await Promise.all([
    isCombine ? Promise.resolve({} as TeamLogoMap) : buildTeamMap(stats),
    buildLobbyContextByStatId(stats),
  ]);

  const teamId = isCombine ? null : deriveTeamIdFromStats(stats);
  const isCurrentSeason = season === currentSeason;

  return (
    <div className="flex flex-col xl:px-0 gap-2">
      {isCombine && <CombineDisclaimer />}

      <div className="flex flex-col xl:flex-row px-2 xl:px-0 gap-2">
        <div className="flex flex-col gap-2 xl:w-1/2">
          {!isCombine &&
            (isCurrentSeason ? (
              hasTeam ? (
                teamId !== null && (
                  <PlayerTeamCard teamId={teamId} season={season} />
                )
              ) : (
                <FreeAgentCard stats={stats} mmr={mmr} />
              )
            ) : (
              <PlayerTeamHistory stats={processedPlayerStats} />
            ))}
          <PlayerRating stats={processedPlayerStats} />
          <PlayerStats stats={processedPlayerStats} />
          <RolesPlayed stats={processedPlayerStats} />
          {!isCombine && (
            <>
              <PlayerFormCard stats={processedPlayerStats} />
              {teamId !== null && isCurrentSeason && (
                <PlayerUpcomingCard teamId={teamId} />
              )}
            </>
          )}
        </div>
        <div className="w-full">
          <PlayerMatches
            stats={stats}
            gameType={gameType?.toUpperCase()}
            teamMap={teamMap}
            lobbyContextByStatId={lobbyContextByStatId}
          />
        </div>
      </div>
    </div>
  );
}

async function buildTeamMap(stats: StatsPayload[]) {
  const teamIds: number[] = [];
  for (const s of stats) {
    const home = s.Game.Match?.home;
    const away = s.Game.Match?.away;
    if (typeof home === "number") teamIds.push(home);
    if (typeof away === "number") teamIds.push(away);
  }
  return getTeamLogoMap(teamIds);
}

async function buildLobbyContextByStatId(
  stats: StatsPayload[],
): Promise<Record<number, MatchLobbyContext>> {
  const gameIds = [...new Set(stats.map((s) => s.Game.gameID))];
  const lobbyRows = await getLobbyStatsForGames(gameIds);

  const rowsByGame: Record<string, LobbyStatRow[]> = {};
  for (const row of lobbyRows) {
    if (!rowsByGame[row.gameID]) rowsByGame[row.gameID] = [];
    rowsByGame[row.gameID].push(row);
  }

  const contextByStatId: Record<number, MatchLobbyContext> = {};
  for (const stat of stats) {
    const gameRows = rowsByGame[stat.Game.gameID] ?? [];
    const home = stat.Game.Match?.home;
    const away = stat.Game.Match?.away;
    const hasTeams = typeof home === "number" && typeof away === "number";

    contextByStatId[stat.id] = {
      ranks: computeLobbyRanks(gameRows, stat.userID),
      rosters: hasTeams
        ? buildLobbyRosters(gameRows, home, away, stat.userID)
        : null,
    };
  }
  return contextByStatId;
}

export function NoStats() {
  return (
    <div className="m-auto text-center py-10">
      <h1 className="text-vdcRed">
        Player has no available stats for the season!
      </h1>
    </div>
  );
}
