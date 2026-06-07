import { GameType, Prisma } from "@prisma/client";
import { InformationCircleIcon } from "@heroicons/react/16/solid";
import PlayerRating from "./PlayerRating";
import { PlayerStats } from "./PlayerStats";
import PlayerMatches from "./PlayerMatches";

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

export default function PlayerSummary({ stats, gameType }: Props) {
  if (!stats || stats.length === 0) {
    return <NoStats />;
  }

  const processedPlayerStats: ProcessedPlayerStat[] = stats.map((s) => ({
    ...s,
    rounds: s.Game.rounds,
    totalDamage: s.damage,
  }));

  const isCombine = gameType?.toUpperCase() === GameType.COMBINE;

  return (
    <div className="flex flex-col xl:px-0 gap-2">
      {isCombine && <CombineDisclaimer />}

      <div className="flex flex-col xl:flex-row px-2 xl:px-0 gap-2">
        <div className="flex flex-col gap-2 xl:w-1/2">
          <PlayerRating stats={processedPlayerStats} />
          <PlayerStats stats={processedPlayerStats} />
        </div>
        <div className="w-full">
          <PlayerMatches stats={stats} gameType={gameType?.toUpperCase()} />
        </div>
      </div>
    </div>
  );
}

function CombineDisclaimer() {
  return (
    <div className="rounded-md bg-vdcRed/30 dark:bg-vdcRed/10 p-4 mx-2 xl:mx-0 outline outline-vdcRed/20">
      <div className="flex">
        <div className="shrink-0">
          <InformationCircleIcon
            aria-hidden="true"
            className="size-5 text-vdcRed"
          />
        </div>
        <div className="ml-3 flex-1 md:flex md:justify-between">
          <p className="text-sm text-vdcBlack dark:text-vdcWhite font-roboto italic">
            Combine stats are stored differently than regular season stats. Some
            data might be different or missing entirely.
          </p>
        </div>
      </div>
    </div>
  );
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
