import Link from "next/link";
import { ImageWithFallback } from "@/components/theme/ImageWithFallback";
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
          {queue.manualReviewPlayers.map((player) => {
            const label = player.name ?? player.id;
            const avatar = (
              <ImageWithFallback
                src={player.image ?? "/vdc-flame.svg"}
                fallbackSrc="/vdc-flame.svg"
                alt={`${label} avatar`}
                width={24}
                height={24}
                className="size-6 shrink-0 rounded-full"
              />
            );

            if (!player.discordId) {
              return (
                <li key={player.id} className="flex items-center gap-2 py-0.5">
                  {avatar}
                  <h2 className="truncate text-gray-600 dark:text-gray-300">
                    {label}
                  </h2>
                </li>
              );
            }

            return (
              <li key={player.id}>
                <Link
                  href={`https://discord.com/users/${player.discordId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 py-0.5 text-vdcBlue hover:underline"
                >
                  {avatar}
                  <h2 className="truncate">{label}</h2>
                </Link>
              </li>
            );
          })}
          {remaining > 0 && (
            <li className="text-gray-400">
              <p>…and {remaining} more</p>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
