import CommonTable from "../theme/CommonTable";
import { getStatsBy } from "@/lib/queries/stats/stats";

export default async function MatchStats({ matchId }: { matchId: string }) {
  const data = await getStatsBy({ matchId });
  if (data.length === 0) return <NoStatsFound />;
  return <CommonTable data={data} />;
}

function NoStatsFound() {
  return (
    <div className="p-10 m-auto text-vdcRed text-center">
      <h2 className="mt-4 rounded-lg border border-vdcRed/40 bg-vdcRed/10 px-4 py-3 text-sm xl:text-lg text-center">
        No stats found. Please check back later as they might not have been
        processed yet!
      </h2>
    </div>
  );
}
