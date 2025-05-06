import { Tier } from "@prisma/client";
import StandingsCard from "./StandingsCard";
import {
  getFranchiseStandingsCached,
  getSeasonCached,
  getStandingsByCached,
} from "@/lib/common/cache";

const isTier = (value: string): value is Tier => {
  return Object.values(Tier).includes(value as Tier);
};

export default async function StandingsPanel(props: { query: Tier | string }) {
  const currentSeason = await getSeasonCached();
  let standings;
  let isFranchise = false;
  if (props.query === "franchises") {
    isFranchise = true;
    standings = await getFranchiseStandingsCached(currentSeason);
  } else if (isTier(props.query)) {
    standings = await getStandingsByCached(currentSeason, props.query);
  }
  if (standings.length === 0) {
    return (
      <div className="flex flex-col italic text-2xl text-center min-w-5 m-auto xl:mr-24">
        <div className="flex flex-col gap-3 xl:bg-auto">
          <h1>No standings Found for {props.query}</h1>
          <h2 className="text-xl">
            (Season <span>{currentSeason}</span> probably hasnt started yet,
            please check back later!)
          </h2>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3 bg-vdcRed p-5 rounded-2xl">
      {standings?.map((standing, index) => (
        <StandingsCard
          key={index}
          standing={standing}
          ranking={index + 1}
          isFranchise={isFranchise}
        />
      ))}
    </div>
  );
}
