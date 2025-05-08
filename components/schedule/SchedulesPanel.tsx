import { Tier } from "@prisma/client";
import Filter from "../standings/filter/Filter";
import { isTier } from "@/lib/common/utils";
import { getSeasonCached } from "@/lib/common/cache";
import ScheduleCard from "./ScheduleCard";
import { getScheduleByTier } from "@/lib/queries/schedule/schedule";

export default async function SchedulePanel(props: {
  tier: Tier;
  season?: number;
}) {
  const currentSeason = await getSeasonCached();
  let season = props.season;
  if (!season) {
    season = currentSeason;
  }
  let tier;

  if (isTier(props.tier)) {
    tier = props.tier;
  }
  const schedule = await getScheduleByTier(tier, season);
  const isCurrentSeason = currentSeason === season;
  const isScheduleEmpty =
    Object.keys(schedule.regularSeason).length === 0 &&
    Object.keys(schedule.preSeason).length === 0;
  if (isScheduleEmpty) {
    return (
      <>
        <div className="flex flex-col italic text-2xl text-center min-w-5 m-auto xl:mr-24">
          <div className="flex flex-col gap-3 xl:bg-auto">
            <h1>
              No scheduled season {season} matches found for {props.tier}
            </h1>
            {isCurrentSeason ? (
              <h2 className="text-xl">
                (Season <span>{season}</span> probably hasnt started yet, please
                check back later!)
              </h2>
            ) : (
              <h2 className="text-xl">
                (We probably didnt keep track of matches back then!)
              </h2>
            )}
          </div>
        </div>
      </>
    );
  }
  return (
    <div className="flex flex-col gap-3 rounded-2xl xl:gap-5">
      <Filter tier={tier} />
      {Object.keys(schedule.preSeason).map((matchDay, i) => (
        <ScheduleCard key={i} matchDay={matchDay} season={schedule.preSeason} />
      ))}
      {Object.keys(schedule.regularSeason).map((matchDay, i) => (
        <ScheduleCard
          key={i}
          matchDay={matchDay}
          season={schedule.regularSeason}
        />
      ))}
    </div>
  );
}
