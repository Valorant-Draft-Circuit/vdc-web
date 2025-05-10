"use client";

import { TEAM_LOGOS_URL } from "@/lib/common/constants";
import { EyeSlashIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Team = {
  slug: string;
  name: string;
  logo: string;
};

type Match = {
  id: string;
  Home: Team;
  Away: Team;
  homeWins?: number;
  awayWins?: number;
};

export default function MatchCard({ match }: { match: Match }) {
  const goToMatch = () => router.push(`/match/${match.id}`);
  const router = useRouter();
  return (
    <div
      onClick={goToMatch}
      className="flex flex-row h-22 gap-8 sm:gap-3 py-3 w-full xl:px-24 m-auto justify-evenly rounded-2xl bg-vdcWhite dark:bg-vdcGrey drop-shadow-lg hover:cursor-pointer hover:opacity-98 transition-opacity ease-in-out duration-150"
    >
      <HomeBadge home={match.Home} />
      <MatchScore homeWins={match.homeWins!} awayWins={match.awayWins!} />
      <AwayBadge away={match.Away} />
    </div>
  );
}

function HomeBadge({ home }: { home: Team }) {
  return (
    <Link
      onClick={(e) => {
        e.stopPropagation();
      }}
      href={`/about/franchises/${home.slug}?team=${home.name}`}
      className="hover:scale-105 hover:brightness-90 rounded-md transition-transform m-auto"
    >
      <div className="flex-shrink-0 w-20 sm:w-50 flex items-center justify-end space-x-2 xl:space-x-5">
        <h1 className="italic hidden sm:block text-sm sm:text-md xl:text-xl text-end break-words">
          {home.name}
        </h1>

        <Image
          src={`${TEAM_LOGOS_URL}${home.logo}`}
          alt={home.slug}
          width={250}
          height={250}
          className="w-12 h-auto sm:w-15 xl:w-16 drop-shadow-md mr-0"
        />
      </div>
    </Link>
  );
}

function AwayBadge({ away }: { away: Team }) {
  return (
    <Link
      onClick={(e) => {
        e.stopPropagation();
      }}
      href={`/about/franchises/${away.slug}?team=${away.name}`}
      className="hover:scale-105 hover:brightness-90 rounded-md transition-transform m-auto"
    >
      <div className="flex-shrink-0 w-20 sm:w-50 flex items-center  space-x-2 xl:space-x-5">
        <Image
          src={`${TEAM_LOGOS_URL}${away.logo}`}
          alt={away.slug}
          width={250}
          height={250}
          className="w-12 h-auto sm:w-15 xl:w-16 drop-shadow-md ml-0"
        />
        <h1 className="italic hidden sm:block text-sm sm:text-md xl:text-xl break-words">
          {away.name}
        </h1>
      </div>
    </Link>
  );
}

function MatchScore({ homeWins, awayWins }: { homeWins?; awayWins? }) {
  const [revealed, setRevealed] = useState(false);
  let pastGame = false;
  if (homeWins || awayWins) {
    pastGame = true;
  }
  if (!pastGame) {
    return (
      <div className="flex w-25 xl:w-30 text-center m-auto">
        <h1 className="italic m-auto text-2xl lg:text-4xl text-vdcRed">VS</h1>
      </div>
    );
  }
  return (
    <div className="flex w-25 xl:w-30 text-center m-auto">
      {!revealed && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setRevealed(true);
          }}
          className="m-auto rounded-sm px-7 py-3 sm:px-6 sm:py-2 xl:px-10 xl:py-3 text-sm font-semibold shadow-xs bg-vdcGrey dark:bg-vdcBlack hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vdcGrey hover:cursor-pointer transition-all duration-75 "
        >
          <EyeSlashIcon className="w-5 sm:w-7 text-vdcWhite" />
        </button>
      )}
      <div
        className={
          revealed
            ? "flex flex-row italic gap-3 xl:gap-5 m-auto text-lg sm:text-2xl xl:text-3xl my-auto items-center"
            : "hidden"
        }
      >
        <h1 className="italic">{homeWins}</h1>
        <h1 className="italic text-2xl lg:text-4xl text-vdcRed">VS</h1>
        <h1 className="italic">{awayWins}</h1>
      </div>
    </div>
  );
}
