import StatsTable from "../stats/StatsTable";
import { getStatsBy } from "@/lib/queries/stats/stats";

type Props = {
  matchId: string;
  gameId?: string;
};

export default async function MatchStats({ matchId, gameId }: Props) {
  const data = gameId
    ? await getStatsBy({ gameId })
    : await getStatsBy({ matchId });

  if (data.length === 0) {
    return (
      <div className="p-10 m-auto text-vdcRed text-center">
        <h2 className="mt-4 rounded-lg border border-vdcRed/40 bg-vdcRed/10 px-4 py-3 text-sm xl:text-lg text-center">
          No stats found. Please check back later as they might not have been
          processed yet!
        </h2>
      </div>
    );
  }

  return <StatsTable data={data} />;
}
