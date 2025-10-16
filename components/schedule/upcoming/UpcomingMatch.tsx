"use client";

import { TEAM_LOGOS_URL, TIER_COLOR_MAP } from "@/lib/common/constants";
import Image from "next/image";
import Link from "next/link";

export default function UpcomingMatch({ match }) {
  const now = new Date();
  const matchDate = new Date(match.dateScheduled);
  const dateDiff = new Date(matchDate.getTime() - now.getTime());

  const days = dateDiff.getUTCDate() - 1;
  const hours = dateDiff.getUTCHours();
  const minutes = dateDiff.getUTCMinutes();

  const timeUntil = `${days}d ${hours}h ${minutes}m`;

  const homeTeam = match.Home.Franchise;
  const awayTeam = match.Away.Franchise;
  return (
    <div
      className={`flex flex-col p-5 rounded-2xl bg-gradient-to-b from-${
        TIER_COLOR_MAP[match.tier]
      } from-3% to-gray-100 dark:to-vdcBlack to-0% text-center gap-2 flex-shrink-0`}
    >
      <h1 className="italic">{match.tier}</h1>
      <div className="flex flex-row m-auto gap-10">
        <Link
          onClick={(e) => {
            e.stopPropagation();
          }}
          href={`/franchises/${
            homeTeam.slug
          }?team=${match.tier.toLocaleLowerCase()}`}
          className="hover:scale-105 hover:brightness-90 rounded-md transition-transform m-auto"
        >
          <Image
            src={`${TEAM_LOGOS_URL}${homeTeam.Brand.logo}`}
            alt={homeTeam.slug}
            width={500}
            height={500}
            className="size-15"
          />
        </Link>
        <h1 className="italic text-vdcRed text-4xl m-auto">VS</h1>
        <Link
          onClick={(e) => {
            e.stopPropagation();
          }}
          href={`/franchises/${
            homeTeam.slug
          }?team=${match.tier.toLocaleLowerCase()}`}
          className="hover:scale-105 hover:brightness-90 rounded-md transition-transform m-auto"
        >
          <Image
            src={`${TEAM_LOGOS_URL}${awayTeam.Brand.logo}`}
            alt={awayTeam.slug}
            width={500}
            height={500}
            className="size-15"
          />
        </Link>
      </div>
      <h2 className="italic">{timeUntil}</h2>
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
        <h1 className="italic text-vdcRed m-auto ">View Full Schedule!</h1>
      </div>
    </Link>
  );
}
