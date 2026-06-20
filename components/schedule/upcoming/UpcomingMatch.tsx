"use client";

import { TEAM_LOGOS_URL } from "@/lib/common/constants/urls";
import { TIER_COLOR_MAP } from "@/lib/common/constants/tiers";
import { getTimeUntil } from "@/lib/common/times";
import { UpcomingMatchRow } from "@/lib/queries/schedule/schedule";
import Image from "next/image";
import Link from "next/link";

export default function UpcomingMatch({ match }: { match: UpcomingMatchRow }) {
  const timeUntil = getTimeUntil(match.dateScheduled);
  const homeTeam = match.Home!.Franchise;
  const awayTeam = match.Away!.Franchise;
  const matchType = match.matchType;

  return (
    <div
      className={`relative flex flex-col p-5 rounded-2xl bg-gradient-to-b from-${
        TIER_COLOR_MAP[match.tier]
      } from-3% to-gray-100 dark:to-vdcBlack to-0% text-center gap-2 flex-shrink-0 hover:brightness-90`}
    >
      <Link
        href={`/match/${match.matchID}`}
        aria-label={`View match: ${match.tier} ${matchType}`}
        className="absolute inset-0 z-0 rounded-2xl"
      />
      <h1 className="">
        {match.tier} - {matchType}
      </h1>
      <div className="relative z-10 flex flex-row m-auto gap-10">
        <Link
          href={`/franchises/${
            homeTeam.slug
          }?team=${match.tier.toLocaleLowerCase()}`}
          className="hover:scale-105 hover:brightness-90 rounded-md transition-transform m-auto"
        >
          <Image
            src={`${TEAM_LOGOS_URL}${homeTeam.Brand!.logo}`}
            alt={homeTeam.slug}
            width={500}
            height={500}
            className="size-15"
          />
        </Link>
        <h1 className="text-vdcRed text-4xl m-auto">VS</h1>
        <Link
          href={`/franchises/${
            awayTeam.slug
          }?team=${match.tier.toLocaleLowerCase()}`}
          className="hover:scale-105 hover:brightness-90 rounded-md transition-transform m-auto"
        >
          <Image
            src={`${TEAM_LOGOS_URL}${awayTeam.Brand!.logo}`}
            alt={awayTeam.slug}
            width={500}
            height={500}
            className="size-15"
          />
        </Link>
      </div>
      <h2 className="">{timeUntil}</h2>
    </div>
  );
}

export function ViewFullSchedule() {
  return (
    <Link
      href={"/schedule"}
      className="flex flex-col p-10 rounded-2xl bg-gray-100 dark:bg-vdcBlack text-center gap-2 flex-shrink-0 hover:brightness-90 hover:underline decoration-vdcRed"
    >
      <div className="flex flex-row m-auto gap-10">
        <h1 className="text-vdcRed m-auto ">View Full Schedule!</h1>
      </div>
    </Link>
  );
}
