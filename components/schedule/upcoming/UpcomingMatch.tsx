"use client";

import { TEAM_LOGOS_URL, TIER_COLOR_MAP } from "@/lib/common/constants";
import Image from "next/image";
import Link from "next/link";

export default function UpcomingMatch({ match }) {
  const matchDate = new Date(match.dateScheduled).toLocaleString();
  const homeTeam = match.Home.Franchise;
  const awayTeam = match.Away.Franchise;

  return (
    <div
      className={`flex flex-col p-5 rounded-2xl bg-gradient-to-b from-${
        TIER_COLOR_MAP[match.tier]
      } from-3% to-vdcBlack to-0% text-center gap-2 flex-shrink-0`}
    >
      <h1 className="italic text-vdcWhite">{match.tier}</h1>
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
      <h1 className="italic text-vdcWhite">{matchDate}</h1>
    </div>
  );
}
