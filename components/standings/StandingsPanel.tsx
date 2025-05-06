import StandingsCard from "./StandingsCard";
import {
  getFranchiseStandingsCached,
  getSeasonCached,
} from "@/lib/common/cache";

export default async function StandingsPanel(props: { query: string }) {
  const currentSeason = await getSeasonCached();
  let standings;
  let isFranchise = false;
  if (props.query === "franchises") {
    isFranchise = true;
    standings = await getFranchiseStandingsCached(currentSeason);
  } else {
    standings = null;
  }
  if (!standings) {
    return (
      <div className="flex bg-vdcWhite">
        <h1>No standings yet!</h1>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3 bg-vdcRed p-5 rounded-2xl">
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
