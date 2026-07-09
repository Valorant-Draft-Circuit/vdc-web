import { GameType, Tier } from "@prisma/client";
import { getStatsBy } from "@/lib/queries/stats/stats";
import CommonTable from "../theme/CommonTable";

export default async function StatsPanel({
  tier,
  season,
  gameType,
}: {
  tier: Tier;
  season: number;
  gameType: GameType;
}) {
  const data = await getStatsBy({ tier, season, gameType });
  return (
    <CommonTable
      data={data}
      gameType={gameType.toLowerCase()}
      tier={tier.toLowerCase()}
      season={season}
    />
  );
}
