import Link from "next/link";
import { SignupQueue } from "@/lib/queries/staff/admin";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  MANUAL_REVIEW: "Manual Review",
  APPROVED: "Approved",
  DRAFT_ELIGIBLE: "Draft-Eligible",
};

export default function SignupQueuePanel({ queue }: { queue: SignupQueue }) {
  const remaining = queue.manualReviewCount - queue.manualReviewPlayers.length;

  return (
    <div className="rounded-xl bg-white p-5 shadow-xs dark:bg-vdcGrey">
      <h2 className="text-sm text-gray-500 dark:text-gray-300">
        Signup Review Queue
      </h2>

      <div className="mt-2 flex flex-wrap gap-2 text-xs">
        {queue.funnel.map((entry) => {
          const isReview = entry.status === "MANUAL_REVIEW";
          return (
            <h2
              key={entry.status}
              className={`rounded px-2 py-0.5 ${isReview ? "bg-amber-200 font-semibold text-black" : "text-gray-600 dark:text-gray-300"}`}
            >
              {STATUS_LABEL[entry.status]} {entry.count}
            </h2>
          );
        })}
      </div>

      <h1 className="mt-3 border-t border-gray-100 pt-2 text-xs text-gray-500 dark:border-gray-700">
        Needs review:
      </h1>
      {queue.manualReviewPlayers.length === 0 ? (
        <h2 className="text-sm text-gray-400">Nothing to review.</h2>
      ) : (
        <ul className="text-sm">
          {queue.manualReviewPlayers.map((player) => (
            <li key={player.id}>
              <Link
                href={`/player/${encodeURIComponent(player.name ?? player.id)}`}
                className="text-vdcBlue hover:underline"
              >
                <h2>{player.name ?? player.id}</h2>
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
