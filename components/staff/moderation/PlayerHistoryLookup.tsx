import ModLogTypePill from "./ModLogTypePill";
import PlayerSearchBox from "./PlayerSearchBox";
import { PlayerModHistory } from "@/lib/queries/staff/moderation";

export default function PlayerHistoryLookup({
  selectedIgn,
  history,
}: {
  selectedIgn: string | null;
  history: PlayerModHistory | null;
}) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-xs dark:bg-vdcGrey">
      <h2 className="text-[10px] uppercase tracking-wider text-vdcRed">
        read-only
      </h2>
      <h1 className="text-xl font-semibold text-vdcBlack dark:text-white">
        Player History Lookup
      </h1>

      <div className="mt-3">
        <PlayerSearchBox />
      </div>

      {selectedIgn && !history && (
        <h2 className="mt-3 text-sm text-gray-400">
          Player &quot;{selectedIgn}&quot; not found.
        </h2>
      )}

      {history && (
        <>
          <h2 className="mt-4 text-sm text-gray-500 dark:text-gray-300">
            {history.playerIgn} · {history.entries.length} entries
          </h2>
          {history.entries.length === 0 ? (
            <h2 className="mt-2 text-sm text-gray-400">No mod history.</h2>
          ) : (
            <ul className="mt-2 divide-y divide-gray-100 text-sm dark:divide-gray-700">
              {history.entries.map((entry) => (
                <li key={entry.logId} className="py-2.5">
                  <div className="flex items-center gap-2">
                    <ModLogTypePill type={entry.type} />
                    <h2 className="truncate text-xs text-gray-400">
                      {entry.dateLabel} · by {entry.moderatorName}
                      {entry.expiresLabel ? ` · ${entry.expiresLabel}` : ""}
                    </h2>
                  </div>
                  <h3 className="mt-1 text-sm font-normal text-gray-600 dark:text-gray-300">
                    {entry.message}
                  </h3>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
