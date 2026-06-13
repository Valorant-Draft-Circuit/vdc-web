import Link from "next/link";
import { format } from "date-fns";
import { UpcomingMissingVetos } from "@/lib/queries/staff/admin";

export default function UpcomingMissingVetosPanel({
  data,
}: {
  data: UpcomingMissingVetos;
}) {
  const remaining = data.count - data.matches.length;

  return (
    <div className="rounded-xl bg-white p-5 shadow-xs dark:bg-vdcGrey">
      <h2 className="text-sm text-gray-500 dark:text-gray-300">
        Missing Map Bans (next 7 days)
      </h2>
      <h1 className="text-3xl font-semibold text-vdcRed">{data.count}</h1>
      <h2 className="text-xs text-gray-500">upcoming, veto not started</h2>

      {data.count === 0 ? (
        <h2 className="mt-3 text-sm text-gray-400">All upcoming vetoes set.</h2>
      ) : (
        <ul className="mt-3 divide-y divide-gray-100 border-t border-gray-100 text-sm dark:divide-gray-700 dark:border-gray-700">
          {data.matches.map((match) => (
            <li key={match.matchID}>
              <Link
                href={`/match/${match.matchID}`}
                className="block py-1.5 hover:bg-gray-50 dark:hover:bg-vdcBlack/40"
              >
                <div className="flex items-baseline justify-between gap-2 text-xs text-gray-400">
                  <h2>
                    {match.tier} · MD{match.matchDay ?? "?"}
                  </h2>
                  <h2>{format(match.dateScheduled, "MMM d")}</h2>
                </div>
                <div className="flex flex-wrap items-baseline gap-x-1.5">
                  <div className="flex items-baseline gap-x-1">
                    <h2 className="text-vdcBlue">{match.homeName}</h2>
                    {match.homeSlug && (
                      <h3 className="text-gray-400">({match.homeSlug})</h3>
                    )}
                  </div>
                  <h2 className="text-gray-400">vs</h2>
                  <div className="flex items-baseline gap-x-1">
                    <h2 className="text-vdcBlue">{match.awayName}</h2>
                    {match.awaySlug && (
                      <h3 className="text-gray-400">({match.awaySlug})</h3>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
          {remaining > 0 && (
            <li className="py-1.5 text-gray-400">
              <h2>…and {remaining} more</h2>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
