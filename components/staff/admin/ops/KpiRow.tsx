import { AdminSummary } from "@/lib/queries/staff/admin";

export default function KpiRow({ summary }: { summary: AdminSummary }) {
  const activePlayers = summary.signedPlayerCount + summary.freeAgentCount;

  const tiles = [
    { label: "Active Players", value: activePlayers },
    { label: "Signed", value: summary.signedPlayerCount },
    { label: "Free Agents", value: summary.freeAgentCount },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {tiles.map((tile) => (
        <div key={tile.label} className="rounded-xl bg-white p-5 shadow-xs dark:bg-vdcGrey">
          <h2 className="text-sm text-gray-500 dark:text-gray-300">{tile.label}</h2>
          <h1 className="mt-1 text-3xl font-semibold text-vdcBlack dark:text-white">{tile.value}</h1>
        </div>
      ))}
    </div>
  );
}
