import { Suspense } from "react";
import { GameType } from "@prisma/client";
import PlayerMapsLoader from "@/components/player/maps/PlayerMapsLoader";
import PlayerMapsSkeleton from "@/components/player/maps/PlayerMapsSkeleton";

type Props = {
  riotIGN: string;
  season: number;
  gameType: GameType;
};

export default function PlayerMaps({ riotIGN, season, gameType }: Props) {
  return (
    <Suspense fallback={<PlayerMapsSkeleton />}>
      <PlayerMapsLoader riotIGN={riotIGN} season={season} gameType={gameType} />
    </Suspense>
  );
}
