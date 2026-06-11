import {
  getMapsCached,
  getMatchNightRecapCached,
  getSeasonCached,
} from "@/lib/common/cache";
import MatchNightRecap from "./MatchNightRecap";

export default async function MatchNightRecapLoader() {
  const season = await getSeasonCached();
  const [recap, mapUuidsByName] = await Promise.all([
    getMatchNightRecapCached(season),
    getMapsCached(),
  ]);
  if (!recap) return null;

  return <MatchNightRecap recap={recap} mapUuidsByName={mapUuidsByName} />;
}
