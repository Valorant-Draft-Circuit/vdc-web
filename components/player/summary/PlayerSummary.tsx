import { GameType, Prisma } from "@prisma/client";
import PlayerRating from "./PlayerRating";
import { PlayerStats } from "./PlayerStats";
import PlayerMatches from "./PlayerMatches";
import {
  getTeamLogoMap,
  type TeamLogoMap,
} from "@/lib/queries/teams/teams";
import CombineDisclaimer from "@/components/player/CombineDisclaimer";

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
};

export default async function PlayerSummary({ stats, gameType }: Props) {
  if (!stats || stats.length === 0) {
    return <NoStats />;
  }

  const processedPlayerStats: ProcessedPlayerStat[] = stats.map((s) => ({
    ...s,
    rounds: s.Game.rounds,
    totalDamage: s.damage,
  }));

  const isCombine = gameType?.toUpperCase() === GameType.COMBINE;
  const teamMap: TeamLogoMap = isCombine ? {} : await buildTeamMap(stats);

  return (
    <div className="flex flex-col xl:px-0 gap-2">
      {isCombine && <CombineDisclaimer />}

      <div className="flex flex-col xl:flex-row px-2 xl:px-0 gap-2">
        <div className="flex flex-col gap-2 xl:w-1/2">
          <PlayerRating stats={processedPlayerStats} />
          <PlayerStats stats={processedPlayerStats} />
        </div>
        <div className="w-full">
          <PlayerMatches
            stats={stats}
            gameType={gameType?.toUpperCase()}
            teamMap={teamMap}
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

export function NoStats() {
  return (
    <div className="m-auto text-center py-10">
      <h1 className="text-vdcRed">
        Player has no available stats for the season!
      </h1>
    </div>
  );
}
