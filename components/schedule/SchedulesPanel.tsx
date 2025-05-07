import { Tier } from "@prisma/client";
import Filter from "../standings/filter/Filter";
import { isTier } from "@/lib/common/utils";
import { getSeasonCached } from "@/lib/common/cache";

export default async function SchedulePanel(props: { query: Tier | string }) {
  const currentSeason = await getSeasonCached()
  const schedule = [];
  let tier;
  if (isTier(props.query)) {
    tier = props.query;
  }

  if (schedule.length === 0) {
    return (
      <>
        <div className="flex flex-col italic text-2xl text-center min-w-5 m-auto xl:mr-24">
          <div className="flex flex-col gap-3 xl:bg-auto">
            <h1>No scheduled matches found for {props.query}</h1>
            <h2 className="text-xl">
              (Season <span>{currentSeason}</span> probably hasnt started yet,
              please check back later!)
            </h2>
          </div>
        </div>
      </>
    );
  }
  return (
    <div className="flex flex-col gap-3 p-5 rounded-2xl">
      <div>
        <Filter tier={tier} />
      </div>
    </div>
  );
}
