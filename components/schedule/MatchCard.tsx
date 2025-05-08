"use client";

import { TEAM_LOGOS_URL } from "@/lib/common/constants";
import { EyeSlashIcon } from "@heroicons/react/24/solid";
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
      className="flex flex-row h-22 gap-8 sm:gap-3 py-3 w-full xl:px-24 m-auto justify-evenly rounded-2xl bg-vdcWhite dark:bg-vdcGrey drop-shadow-lg hover:cursor-pointer hover:opacity-98 transition-opacity ease-in-out duration-150"
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
      onClick={(e) => {
        e.stopPropagation();
      }}
      href={`/franchise/${home.slug}?team=${home.teamName}`}
      className="hover:scale-105 hover:brightness-90 rounded-md transition-transform m-auto"
    >
      <div className="flex-shrink-0 w-20 sm:w-50 flex items-center justify-end space-x-2 xl:space-x-5">
        <h1 className="italic hidden sm:block text-sm sm:text-md xl:text-xl text-end break-words">
          METEOR MARAUDERS
        </h1>

        <Image
          src={`${TEAM_LOGOS_URL}${home.teamLogo}`}
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
      href={`/franchise/${away.slug}?team=${away.teamName}`}
      className="hover:scale-105 hover:brightness-90 rounded-md transition-transform m-auto"
    >
      <div className="flex-shrink-0 w-20 sm:w-50 flex items-center  space-x-2 xl:space-x-5">
        <Image
          src={`${TEAM_LOGOS_URL}${away.teamLogo}`}
          alt={away.slug}
          width={250}
          height={250}
          className="w-12 h-auto sm:w-15 xl:w-16 drop-shadow-md ml-0"
        />
        <h1 className="italic hidden sm:block text-sm sm:text-md xl:text-xl break-words">
          EXECUTIONERS
        </h1>
      </div>
    </Link>
  );
}

function MatchScore({ home, away }: { home?: number; away?: number }) {
  const [revealed, setRevealed] = useState(false);
  const pastGame = home != null && away != null;
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
          className="m-auto rounded-sm px-5 py-1 sm:px-6 sm:py-2 xl:px-10 xl:py-3 text-sm font-semibold shadow-xs bg-vdcGrey dark:bg-vdcBlack hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vdcGrey hover:cursor-pointer transition-all duration-75 "
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
        <h1 className="italic">2</h1>
        <h1 className="italic text-2xl lg:text-4xl text-vdcRed">VS</h1>
        <h1 className="italic">0</h1>
      </div>
    </div>
  );
}
// function HomeBadge({ home }: { home: Team }) {
//   return (
//     <Link
//       onClick={(e) => {
//         e.stopPropagation();
//       }}
//       href={`/franchise/${home.slug}?team=${home.teamName}`}
//       className="max-w-1/3 ml-0 sm:max-w-2/5 flex flex-row mx-auto text-end hover:scale-105 hover:brightness-90 rounded-md transition-transform sm:px-2 py-1"
//     >
//       <div className="flex flex-row gap-2 sm:gap-4 items-center text-sm sm:text-xl xl:text-3xl">
//         <h1 className="italic hidden sm:block">{home.teamName}</h1>
//         <Image
//           src={`${TEAM_LOGOS_URL}${home.teamLogo}`}
//           alt={home.slug}
//           width={250}
//           height={250}
//           className="w-12 h-12 drop-shadow-md"
//         />
//       </div>
//     </Link>
//   );
// }

// function AwayBadge({ away }: { away: Team }) {
//   return (
//     <Link
//       onClick={(e) => {
//         e.stopPropagation();
//       }}
//       href={`/franchise/${away.slug}?team=${away.teamName}`}
//       className="max-w-1/3 mr-0 sm:max-w-2/5 flex flex-row mx-auto text-start hover:scale-105 hover:brightness-90 rounded-md transition-transform"
//     >
//       <div className="flex flex-row gap-2 sm:gap-4 items-center text-sm sm:text-xl xl:text-3xl">
//         <Image
//           src={`${TEAM_LOGOS_URL}${away.teamLogo}`}
//           alt={away.slug}
//           width={250}
//           height={250}
//           className="w-12 h-12 drop-shadow-md"
//         />
//         <h1 className="italic hidden sm:block">{away.teamName}</h1>
//       </div>
//     </Link>
//   );
// }

// function MatchScore({ home, away }: { home?: number; away?: number }) {
//   const [revealed, setRevealed] = useState(false);
//   const pastGame = home != null && away != null;
//   if (!pastGame) {
//     return (
//       <div className="max-w-1/3 sm:w-1/5 m-auto flex flex-row italic px-6 text-3xl sm:text-3xl xl:text-5xl items-center">
//         <h1 className="text-vdcRed m-auto">VS</h1>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-1/3 sm:w-1/5 sm:m-auto flex flex-row italic gap-5 items-center">
//       {!revealed && (
//         <button
//           onClick={(e) => {
//             e.stopPropagation();
//             setRevealed(true);
//           }}
//           className="m-auto rounded-sm bg-vdcGrey dark:bg-vdcBlack hover:opacity-80 px-5 py-1 sm:px-6 sm:py-2 xl:px-10 xl:py-3 text-sm font-semibold shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vdcGrey hover:cursor-pointer transition-all duration-75"
//         >
//           <EyeSlashIcon className="w-5 sm:w-7 text-vdcWhite" />
//         </button>
//       )}
//       <div
//         className={
//           revealed
//             ? "flex flex-row italic gap-3 m-auto text-lg sm:text-2xl xl:text-3xl sm:gap-5 my-auto items-center"
//             : "hidden"
//         }
//       >
//         <h1>{home}</h1>
//         <h1 className="text-vdcRed text-3xl xl:text-5xl">VS</h1>
//         <h1>{away}</h1>
//       </div>
//     </div>
//   );
// }
