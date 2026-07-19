import Link from "next/link";
import { ScrollRevealList } from "@/components/theme/ScrollRevealList";
import { UnreportedMatches } from "@/lib/queries/staff/admin";

export default function UnreportedMatchesPanel({
  data,
}: {
  data: UnreportedMatches;
}) {
  const matchRows = data.matches.map((match) => (
    <li key={match.matchID}>
      <Link
        href={`/match/${match.matchID}`}
        className="block py-1.5 hover:bg-gray-50 dark:hover:bg-vdcBlack/40"
      >
        <div className="flex items-baseline justify-between gap-2 text-xs text-gray-400">
          <h2>
            {match.tier} · MD{match.matchDay ?? "?"}
          </h2>
          <h2>
            {match.reported}/{match.expected}
          </h2>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-1.5">
          <div className="flex items-baseline gap-x-1">
            <h2 className="text-vdcBlue">{match.homeName}</h2>
            {match.homeSlug && (
              <p className="text-gray-400">({match.homeSlug})</p>
            )}
          </div>
          <h2 className="text-gray-400">v</h2>
          <div className="flex items-baseline gap-x-1">
            <h2 className="text-vdcBlue">{match.awayName}</h2>
            {match.awaySlug && (
              <p className="text-gray-400">({match.awaySlug})</p>
            )}
          </div>
        </div>
      </Link>
    </li>
  ));

  return (
    <div className="rounded-xl bg-white p-5 shadow-xs dark:bg-vdcGrey">
      <h2 className="text-sm text-gray-500 dark:text-gray-300">
        Unreported Matches
      </h2>
      <h1 className="text-3xl font-semibold text-vdcRed">{data.count}</h1>
      <h2 className="text-xs text-gray-500">past schedule, below min games</h2>

      {data.count === 0 ? (
        <h2 className="mt-3 text-sm text-gray-400">All matches reported.</h2>
      ) : (
        <ScrollRevealList
          rows={matchRows}
          className="mt-3 max-h-72 divide-y divide-gray-100 border-t border-gray-100 text-sm dark:divide-gray-700 dark:border-gray-700"
        />
      )}
    </div>
  );
}
