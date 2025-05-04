import getFranchiseStandings from "@/lib/standings/franchise-standings";
import StandingsCard from "./StandingsCard";
import { cache } from "@/lib/cache";

export default async function StandingsPanel(props: { query: string }) {
  let standings;
  let isFranchise = false;
  if (props.query === "franchises") {
    isFranchise = true;
    if (cache.standings.franchise) {
      console.log("cache hit for frachises");
      standings = cache.standings.franchise;
    } else {
      standings = await getFranchiseStandings(cache.currentSeason!);
      cache.standings.franchise = standings;
    }
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
