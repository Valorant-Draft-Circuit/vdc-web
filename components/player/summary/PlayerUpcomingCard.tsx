import Image from "next/image";
import Link from "next/link";
import { getEveryUpcomingMatch } from "@/lib/queries/schedule/schedule";
import { TEAM_LOGOS_URL } from "@/lib/common/constants";

const MAX_ROWS = 3;

type Props = {
  teamId: number;
};

export default async function PlayerUpcomingCard({ teamId }: Props) {
  const allUpcoming = await getEveryUpcomingMatch();

  const teamMatches = allUpcoming
    .filter((match) => match.Home?.id === teamId || match.Away?.id === teamId)
    .sort(
      (a, b) =>
        new Date(a.dateScheduled).getTime() -
        new Date(b.dateScheduled).getTime(),
    )
    .slice(0, MAX_ROWS);

  if (teamMatches.length === 0) return null;

  return (
    <div className="divide-y divide-gray-600 dark:divide-vdcBlack bg-slate-100 dark:bg-vdcGrey overflow-hidden rounded-sm shadow-sm">
      <div className="px-4 py-2 xl:px-6">
        <h1 className="text-sm italic">Upcoming</h1>
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
  const dayOfWeek = new Date(dateScheduled).toLocaleString("en-US", {
    weekday: "short",
  });
  const dateLabel = new Date(dateScheduled).toLocaleString("en-US", {
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
          <span className="text-[10px] italic text-gray-500 dark:text-gray-400">
            {dayOfWeek}
          </span>
          <h1 className="text-xs">{dateLabel}</h1>
        </div>
        <Image
          src={logoSrc}
          alt={String(opponentId)}
          width={500}
          height={500}
          className="size-6 rounded-sm"
        />
        <span className="hidden xl:inline text-[10px] italic text-gray-500 dark:text-gray-400">
          vs
        </span>
        <h1 className="text-sm">{opponentName}</h1>
        {matchDay !== null && (
          <h2 className="ml-auto text-[10px] italic text-gray-500 dark:text-gray-400">
            MD{matchDay}
          </h2>
        )}
      </Link>
    </li>
  );
}
