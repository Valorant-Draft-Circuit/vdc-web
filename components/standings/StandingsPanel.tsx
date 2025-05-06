import StandingsCard from "./StandingsCard";
import {
  getFranchiseStandingsCached,
  getSeasonCached,
} from "@/lib/common/cache";

export default async function StandingsPanel(props: { query: string }) {
  const currentSeason = await getSeasonCached();
  const standings = await getFranchiseStandingsCached(currentSeason);

  let isFranchise = false;
  if (props.query === "franchises") {
    isFranchise = true;
  }

  return (
    <div className="flex flex-col gap-3">
      {standings?.map((standing, index) => (
        <StandingsCard
          key={index}
          standing={standing}
          rank={index + 1}
          isFranchise={isFranchise}
        />
      ))}
    </div>
  );
}
