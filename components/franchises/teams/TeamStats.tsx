import CommonTable from "@/components/theme/CommonTable";
import { getStatsBy } from "@/lib/queries/stats/stats";
import { Tier } from "@prisma/client";

type Props = {
  teamId: number;
  season: number;
  tier: Tier;
};

export default async function TeamStatsPanel({ teamId, season, tier }: Props) {
  const data = await getStatsBy({ teamId, season });
  return (
    <CommonTable
      data={data}
      hiddenFields={["team"]}
      tier={tier.toLowerCase()}
      season={season}
    />
  );
}
