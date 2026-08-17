import { getPlayoffHighlightsCached, getSeasonCached } from "@/lib/common/cache";
import { TIERS_LIST } from "@/lib/common/constants/tiers";
import PlayoffBracket from "@/components/playoffs/PlayoffBracket";
import PlayoffResults from "./PlayoffResults";

export default async function PlayoffResultsLoader() {
  const season = await getSeasonCached();
  const highlights = await getPlayoffHighlightsCached(season);
  const brackets = TIERS_LIST.map((tier) => ({
    tier,
    node: <PlayoffBracket tier={tier} season={season} />,
  }));

  return <PlayoffResults brackets={brackets} highlights={highlights} />;
}
