import StatsTable from "@/components/stats/StatsTable";
import { getStatsBy } from "@/lib/queries/stats/stats";

type Props = {
  teamId: number;
  season: number;
};

export default async function TeamStatsPanel({ teamId, season }: Props) {
  const data = await getStatsBy({ teamId, season });
  return <StatsTable data={data} hiddenFields={["team"]} />;
}
