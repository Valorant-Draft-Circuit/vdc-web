"use client";

import { TEAM_LOGOS_URL } from "@/lib/common/constants";
import { EyeSlashIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Team = {
  slug: string;
  teamName: string;
  teamLogo: string;
};

type Match = {
  matchId: string;
  home: Team;
  away: Team;
  homeScore?: number;
  awayScore?: number;
};

export default function MatchCard({ match }: { match: Match }) {
  const goToMatch = () => router.push(`/match/${match.matchId}`);
  const router = useRouter();
  return (
    <div
      onClick={goToMatch}
      className="hover:cursor-pointer hover:scale-101 hover:brightness-98 transition-transform ease-in-out duration-150 flex flex-row gap-3 rounded-2xl m-auto xl:w-full bg-vdcWhite dark:bg-vdcGrey py-3 px-5 w-full xl:px-24 drop-shadow-lg z-0 justify-center"
    >
      <HomeBadge home={match.home} />
      <MatchScore home={match.homeScore!} away={match.awayScore!} />
      <AwayBadge away={match.away} />
    </div>
  );
}

function HomeBadge({ home }: { home: Team }) {
  return (
    <Link
      href={`/franchise/${home.slug}?team=${home.teamName}`}
      className="sm:min-w-1/6 flex flex-row mx-auto text-center hover:scale-105 hover:brightness-90 rounded-md transition-transform sm:px-2 py-1"
    >
      <div className="flex flex-row gap-2 sm:gap-4 items-center sm:text-2xl xl:text-3xl">
        <h1 className="italic">{home.teamName}</h1>
        <Image
          src={`${TEAM_LOGOS_URL}${home.teamLogo}`}
          alt={home.slug}
          width={250}
          height={250}
          className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-md"
        />
      </div>
    </Link>
  );
}

function AwayBadge({ away }: { away: Team }) {
  return (
    <Link
      href={`/franchise/${away.slug}?team=${away.teamName}`}
      className="sm:min-w-1/6 flex flex-row mx-auto text-center hover:scale-105 hover:brightness-90 rounded-md transition-transform"
    >
      <div className="flex flex-row gap-2 sm:gap-4 items-center sm:text-2xl xl:text-3xl">
        <Image
          src={`${TEAM_LOGOS_URL}${away.teamLogo}`}
          alt={away.slug}
          width={250}
          height={250}
          className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-md"
        />
        <h1 className="italic">{away.teamName}</h1>
      </div>
    </Link>
  );
}

function MatchScore({ home, away }: { home?: number; away?: number }) {
  const [revealed, setRevealed] = useState(false);
  const pastGame = home != null && away != null;
  if (!pastGame) {
    return (
      <div className="min-w-1/4 m-auto flex flex-row italic text-xl sm:text-3xl xl:text-5xl items-center">
        <h1 className="text-vdcRed m-auto">VS</h1>
      </div>
    );
  }

  return (
    <div className="min-w-1/4 sm:m-auto flex flex-row italic text-xl sm:text-3xl gap-5 xl:text-5xl items-center z-20">
      {!revealed && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setRevealed(true);
          }}
          className="m-auto rounded-md bg-vdcGrey dark:bg-vdcBlack px-6 py-2 xl:px-10 xl:py-3text-sm font-semibold shadow-xs hover:brightness-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vdcGrey hover:cursor-pointer hover:scale-105 transition-transform"
        >
          <EyeSlashIcon className="w-7 text-vdcWhite" />
        </button>
      )}
      <div
        className={
          revealed
            ? "flex flex-row italic gap-2 text-xl m-auto sm:text-2xl xl:text-3xl sm:gap-5 my-auto items-center z-20"
            : "hidden"
        }
      >
        <h1>{home}</h1>
        <h1 className="text-vdcRed text-xl sm:text-3xl xl:text-5xl">VS</h1>
        <h1>{away}</h1>
      </div>
    </div>
  );
}
