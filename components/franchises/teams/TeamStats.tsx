import CommonTable from "@/components/theme/CommonTable";
import { getStatsBy } from "@/lib/queries/stats/stats";
import { getAgentsCached } from "@/lib/common/cache";
import { Tier } from "@prisma/client";

type Props = {
  teamId: number;
  season: number;
  tier: Tier;
  rosterIgns: string[];
};

export default async function TeamStatsPanel({
  teamId,
  season,
  tier,
  rosterIgns,
}: Props) {
  const [data, agents] = await Promise.all([
    getStatsBy({ teamId, season }),
    getAgentsCached(),
  ]);
  return (
    <CommonTable
      data={data}
      agents={agents}
      hiddenFields={["team"]}
      tier={tier.toLowerCase()}
      season={season}
      rosterIgns={rosterIgns}
    />
  );
}
