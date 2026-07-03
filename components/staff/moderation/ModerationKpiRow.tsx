import { ModLogType } from "@prisma/client";

export type ModerationSummary = {
  bans: number;
  activeMutes: number;
  unactionedDeletions: number;
  escalations: number;
};

export type SanctionFilter = Extract<ModLogType, "BAN" | "MUTE"> | null;

export default function ModerationKpiRow({
  summary,
  filter,
  onToggleFilter,
}: {
  summary: ModerationSummary;
  filter: SanctionFilter;
  onToggleFilter: (type: Exclude<SanctionFilter, null>) => void;
}) {
  const filterTiles = [
    { label: "Bans", value: summary.bans, type: "BAN" as const },
    {
      label: "Active Mutes",
      value: summary.activeMutes,
      type: "MUTE" as const,
    },
  ];
  const staticTiles = [
    { label: "Unactioned Deletions", value: summary.unactionedDeletions },
    { label: "Escalation Watch", value: summary.escalations },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {filterTiles.map((tile) => (
        <button
          key={tile.label}
          onClick={() => onToggleFilter(tile.type)}
          className={`rounded-xl bg-white p-5 text-left shadow-xs hover:cursor-pointer dark:bg-vdcGrey ${
            filter === tile.type ? "ring-2 ring-vdcRed" : ""
          }`}
        >
          <h2 className="text-sm text-gray-500 dark:text-gray-300">
            {tile.label}
          </h2>
          <h1 className="mt-1 text-3xl font-semibold text-vdcBlack dark:text-white">
            {tile.value}
          </h1>
          <h2 className="mt-1 text-[10px] uppercase tracking-wider text-vdcRed">
            {filter === tile.type
              ? "filtering · click to clear"
              : "click to filter"}
          </h2>
        </button>
      ))}
      {staticTiles.map((tile) => (
        <div
          key={tile.label}
          className="rounded-xl bg-white p-5 shadow-xs dark:bg-vdcGrey"
        >
          <h2 className="text-sm text-gray-500 dark:text-gray-300">
            {tile.label}
          </h2>
          <h1 className="mt-1 text-3xl font-semibold text-vdcBlack dark:text-white">
            {tile.value}
          </h1>
        </div>
      ))}
    </div>
  );
}
