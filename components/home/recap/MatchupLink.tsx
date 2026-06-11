import Link from "next/link";
import { ReactNode } from "react";
import TeamLogo from "./TeamLogo";

export type Matchup = {
  matchID: number | null;
  gameID: string | null;
  homeTeamName: string | null;
  homeTeamLogo: string | null;
  awayTeamName: string | null;
  awayTeamLogo: string | null;
};

export default function MatchupLink({
  matchup,
  children,
}: {
  matchup: Matchup;
  children?: ReactNode;
}) {
  const rowClassName =
    "flex min-w-0 items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400";

  const content = (
    <>
      <TeamLogo logo={matchup.homeTeamLogo} teamName={matchup.homeTeamName} />
      <h2 className="truncate">{matchup.homeTeamName ?? "TBD"}</h2>
      <h1 className="flex-none">vs</h1>
      <TeamLogo logo={matchup.awayTeamLogo} teamName={matchup.awayTeamName} />
      <h2 className="truncate">{matchup.awayTeamName ?? "TBD"}</h2>
      {children}
    </>
  );

  if (matchup.matchID === null) {
    return <span className={rowClassName}>{content}</span>;
  }

  const href =
    matchup.gameID !== null
      ? `/match/${matchup.matchID}?game=${matchup.gameID}`
      : `/match/${matchup.matchID}`;

  return (
    <Link href={href} className={`${rowClassName} hover:text-vdcRed`}>
      {content}
    </Link>
  );
}
