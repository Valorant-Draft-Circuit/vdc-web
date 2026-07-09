"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EyeSlashIcon } from "@heroicons/react/24/solid";
import TeamLogo from "@/components/home/recap/TeamLogo";
import { FranchiseTeam } from "@/lib/queries/franchises/franchises";
import { Tier } from "@prisma/client";

type TeamMatch = FranchiseTeam["pastGames"][number];

const INITIAL_VISIBLE_MATCHES = 5;
const SHOW_MORE_STEP = 5;

export default function TeamMatchList({
  title,
  matches,
  teamId,
  tier,
  variant,
  emptyText,
}: {
  title: string;
  matches: TeamMatch[];
  teamId: number;
  tier: Tier;
  variant: "upcoming" | "results";
  emptyText: string;
}) {
  const [visibleMatchCount, setVisibleMatchCount] = useState(
    INITIAL_VISIBLE_MATCHES,
  );
  const visibleMatches = matches.slice(0, visibleMatchCount);
  const hasMoreMatches = matches.length > visibleMatchCount;

  function revealMoreMatchesAtListBottom(
    event: React.UIEvent<HTMLUListElement>,
  ) {
    if (!hasMoreMatches) return;
    const list = event.currentTarget;
    const reachedBottom =
      list.scrollTop + list.clientHeight >= list.scrollHeight - 8;
    if (reachedBottom) {
      setVisibleMatchCount((count) => count + SHOW_MORE_STEP);
    }
  }

  return (
    <div className="flex-1 rounded-md bg-slate-100 dark:bg-vdcGrey p-4 sm:p-5">
      <h2 className="text-sm tracking-wider uppercase font-semibold text-vdcRed mb-1">
        {title}
      </h2>
      {matches.length === 0 ? (
        <h2 className="text-sm text-gray-500 dark:text-gray-400 py-1">
          {emptyText}
        </h2>
      ) : (
        <ul
          onScroll={revealMoreMatchesAtListBottom}
          className="flex flex-col max-h-52 overflow-y-auto"
        >
          {visibleMatches.map((match) => (
            <TeamMatchRow
              key={match.id}
              match={match}
              teamId={teamId}
              tier={tier}
              variant={variant}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function TeamMatchRow({
  match,
  teamId,
  tier,
  variant,
}: {
  match: TeamMatch;
  teamId: number;
  tier: Tier;
  variant: "upcoming" | "results";
}) {
  const router = useRouter();
  const [revealed, setRevealed] = useState(false);
  const isHome = match.Home.id === teamId;
  const opponent = isHome ? match.Away : match.Home;
  const teamWins = isHome ? match.homeWins : match.awayWins;
  const opponentWins = isHome ? match.awayWins : match.homeWins;

  return (
    <li
      onClick={() => router.push(`/match/${match.id}`)}
      className="flex items-center gap-2 py-2 border-b border-vdcBlack/5 dark:border-vdcWhite/5 last:border-b-0 hover:cursor-pointer hover:opacity-90"
    >
      <h2 className="text-xs text-gray-500 w-20 flex-none">{match.date}</h2>
      <Link
        href={`/franchises/${opponent.slug}?team=${tier.toLowerCase()}`}
        onClick={(event) => event.stopPropagation()}
        className="flex items-center gap-1.5 min-w-0 hover:text-vdcRed"
      >
        <TeamLogo logo={opponent.logo ?? null} teamName={opponent.name} />
        <h2 className="text-sm truncate">{opponent.name}</h2>
      </Link>
      {variant === "upcoming" ? (
        <h2 className="ml-auto flex-none rounded px-2 py-0.5 text-xs font-bold bg-vdcWhite/40 dark:bg-vdcBlack/40 text-gray-600 dark:text-gray-400">
          {match.matchType}
        </h2>
      ) : revealed ? (
        <h2
          className={`ml-auto flex-none rounded px-2 py-0.5 text-sm font-bold tabular-nums ${resultColorClass(teamWins, opponentWins)}`}
        >
          {teamWins} : {opponentWins}
        </h2>
      ) : (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setRevealed(true);
          }}
          className="ml-auto flex-none rounded px-2.5 py-1 bg-vdcWhite/40 dark:bg-vdcBlack/40 hover:cursor-pointer hover:brightness-90"
        >
          <EyeSlashIcon className="w-4 text-gray-500" />
        </button>
      )}
    </li>
  );
}

function resultColorClass(teamWins: number, opponentWins: number): string {
  if (teamWins > opponentWins) return "bg-vdcGreen/20 text-vdcGreen";
  if (teamWins < opponentWins) return "bg-vdcRed/20 text-vdcRed";
  return "bg-vdcWhite/40 dark:bg-vdcBlack/40 text-gray-600 dark:text-gray-400";
}
