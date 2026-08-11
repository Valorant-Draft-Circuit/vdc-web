import { getPlayoffResultsCached, getSeasonCached } from "@/lib/common/cache";
import PlayoffResults from "./PlayoffResults";

export default async function PlayoffResultsLoader() {
  const season = await getSeasonCached();
  const results = await getPlayoffResultsCached(season);
  if (results.tiers.length === 0) return null;

  return <PlayoffResults results={results} />;
}
