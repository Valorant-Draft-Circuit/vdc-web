import { Tier } from "@prisma/client";
import Filter from "../standings/filter/Filter";
import { isTier } from "@/lib/common/utils";
import { getSeasonCached } from "@/lib/common/cache";
import ScheduleCard from "./ScheduleCard";

export default async function SchedulePanel(props: { query: Tier | string }) {
  const currentSeason = await getSeasonCached();
  const schedule = [
    {
      md: 1,
      date: "Monday, April 28",
      time: "9:00PM",
      matches: [
        {
          matchId: 1,
          homeScore: 1,
          awayScore: 1,
          home: {
            slug: "pn",
            teamName: "orion",
            teamLogo: "pn.png",
          },
          away: {
            slug: "ht",
            teamName: "riptide",
            teamLogo: "ht.png",
          },
        },
        {
          matchId: 2,
          homeScore: 2,
          awayScore: 0,
          home: {
            slug: "pn",
            teamName: "orion",
            teamLogo: "pn.png",
          },
          away: {
            slug: "ht",
            teamName: "riptide",
            teamLogo: "ht.png",
          },
        },
        {
          matchId: 3,
          home: {
            slug: "pn",
            teamName: "orion",
            teamLogo: "pn.png",
          },
          away: {
            slug: "ht",
            teamName: "riptide",
            teamLogo: "ht.png",
          },
        },
        {
          matchId: 4,
          home: {
            slug: "pn",
            teamName: "orion",
            teamLogo: "pn.png",
          },
          away: {
            slug: "ht",
            teamName: "riptide",
            teamLogo: "ht.png",
          },
        },
      ],
    },
    {
      md: 2,
      date: "Wednesday, May 7",
      time: "9:00PM",
      matches: [
        {
          matchId: 1,
          home: {
            slug: "pn",
            teamName: "orion",
            teamLogo: "pn.png",
          },
          away: {
            slug: "ht",
            teamName: "riptide",
            teamLogo: "ht.png",
          },
        },
        {
          matchId: 2,
          home: {
            slug: "pn",
            teamName: "orion",
            teamLogo: "pn.png",
          },
          away: {
            slug: "ht",
            teamName: "riptide",
            teamLogo: "ht.png",
          },
        },
        {
          matchId: 3,
          home: {
            slug: "pn",
            teamName: "orion",
            teamLogo: "pn.png",
          },
          away: {
            slug: "ht",
            teamName: "riptide",
            teamLogo: "ht.png",
          },
        },
        {
          matchId: 4,
          home: {
            slug: "pn",
            teamName: "orion",
            teamLogo: "pn.png",
          },
          away: {
            slug: "ht",
            teamName: "riptide",
            teamLogo: "ht.png",
          },
        },
      ],
    },
  ];
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
    <div className="flex flex-col gap-3 rounded-2xl xl:gap-5">
      <Filter tier={tier} />
      {schedule.map((matchDay, md) => (
        <ScheduleCard key={md} matchDay={matchDay} />
      ))}
    </div>
  );
}
