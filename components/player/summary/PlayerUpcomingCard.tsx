import Image from "next/image";
import Link from "next/link";
import { getUpcomingMatchesForTeam } from "@/lib/queries/schedule/schedule";
import { TEAM_LOGOS_URL } from "@/lib/common/constants";
import { correctMatchDate } from "@/lib/common/format";

const MAX_ROWS = 3;

type Props = {
  teamId: number;
};

export default async function PlayerUpcomingCard({ teamId }: Props) {
  const teamMatches = await getUpcomingMatchesForTeam(teamId, MAX_ROWS);

  if (teamMatches.length === 0) return null;

  return (
    <div className="divide-y divide-gray-600 dark:divide-vdcBlack bg-slate-100 dark:bg-vdcGrey overflow-hidden rounded-sm shadow-sm">
      <div className="px-4 py-2 xl:px-6">
        <h1 className="text-sm">Upcoming</h1>
      </div>
      <ul role="list">
        {teamMatches.map((match) => {
          const isHome = match.Home?.id === teamId;
          const opponent = isHome ? match.Away : match.Home;
          if (!opponent) return null;
          return (
            <UpcomingRow
              key={match.matchID}
              matchID={match.matchID}
              dateScheduled={match.dateScheduled}
              matchDay={match.matchDay}
              opponentName={opponent.name}
              opponentId={opponent.id}
              opponentLogo={opponent.Franchise?.Brand?.logo ?? null}
            />
          );
        })}
      </ul>
    </div>
  );
}

function UpcomingRow({
  matchID,
  dateScheduled,
  matchDay,
  opponentName,
  opponentId,
  opponentLogo,
}: {
  matchID: number;
  dateScheduled: Date;
  matchDay: number | null;
  opponentName: string;
  opponentId: number;
  opponentLogo: string | null;
}) {
  const matchDate = correctMatchDate(dateScheduled);
  const dayOfWeek = matchDate.toLocaleString("en-US", {
    weekday: "short",
  });
  const dateLabel = matchDate.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
  });
  const logoSrc = opponentLogo
    ? `${TEAM_LOGOS_URL}${opponentLogo}`
    : "/vdc-flame.svg";

  return (
    <li className="flex flex-row items-center gap-3 px-4 py-2 xl:px-6 hover:bg-vdcBlack/30">
      <Link href={`/match/${matchID}`} className="contents">
        <div className="flex flex-col w-14">
          <span className="text-[10px] text-gray-500 dark:text-gray-400">
            {dayOfWeek}
          </span>
          <h1 className="text-xs">{dateLabel}</h1>
        </div>
        <span className="hidden xl:inline text-[10px] text-gray-500 dark:text-gray-400">
          vs
        </span>
        <Image
          src={logoSrc}
          alt={String(opponentId)}
          width={500}
          height={500}
          className="size-6 rounded-sm"
        />
        <h1 className="text-sm">{opponentName}</h1>
        {matchDay !== null && (
          <h2 className="ml-auto text-[10px] text-gray-500 dark:text-gray-400">
            MD{matchDay}
          </h2>
        )}
      </Link>
    </li>
  );
}
