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
        <ul className="mt-3 border-t border-gray-100 pt-2 text-sm dark:border-gray-700">
          {data.matches.map((match) => (
            <li key={match.matchID}>
              <Link
                href={`/match/${match.matchID}`}
                className="text-vdcBlue hover:underline"
              >
                <h2>
                  {match.tier} MD{match.matchDay ?? "?"} · {match.homeName} vs{" "}
                  {match.awayName}{" "}
                  <span className="text-gray-400">
                    {format(match.dateScheduled, "MMM d")}
                  </span>{" "}
                </h2>
              </Link>
            </li>
          ))}
          {remaining > 0 && (
            <li className="text-gray-400">
              <h3>…and {remaining} more</h3>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
