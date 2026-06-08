import { Suspense } from "react";
import { GameType } from "@prisma/client";
import PlayerAgentsLoader from "@/components/player/agents/PlayerAgentsLoader";
import PlayerAgentsSkeleton from "@/components/player/agents/PlayerAgentsSkeleton";

type Props = {
  riotIGN: string;
  season: number;
  gameType: GameType;
  basePath: string;
  searchParams: Record<string, string | string[] | undefined>;
};

export default function PlayerAgents({
  riotIGN,
  season,
  gameType,
  basePath,
  searchParams,
}: Props) {
  return (
    <Suspense fallback={<PlayerAgentsSkeleton />}>
      <PlayerAgentsLoader
        riotIGN={riotIGN}
        season={season}
        gameType={gameType}
        basePath={basePath}
        searchParams={searchParams}
      />
    </Suspense>
  );
}
