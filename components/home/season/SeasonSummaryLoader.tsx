import { getMapsCached, getSeasonSummaryCached, getSeasonCached } from "@/lib/common/cache";
import SeasonSummary from "./SeasonSummary";

export default async function SeasonSummaryLoader() {
  const season = await getSeasonCached();
  const [summary, mapUuidsByName] = await Promise.all([
    getSeasonSummaryCached(season),
    getMapsCached(),
  ]);
  if (!summary) return null;

  return (
    <SeasonSummary
      summary={summary}
      mapUuidsByName={mapUuidsByName}
      season={season}
    />
  );
}
