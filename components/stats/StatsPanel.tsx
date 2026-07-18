import { GameType, Tier } from "@prisma/client";
import { getStatsBy } from "@/lib/queries/stats/stats";
import { getAgentsCached } from "@/lib/common/cache";
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
  const [data, agents] = await Promise.all([
    getStatsBy({ tier, season, gameType }),
    getAgentsCached(),
  ]);
  return (
    <CommonTable
      data={data}
      agents={agents}
      gameType={gameType.toLowerCase()}
      tier={tier.toLowerCase()}
      season={season}
    />
  );
}
