import LeagueDashboard from "@/components/staff/admin/PlayerDashboard";
import { ControlPanel } from "@/prisma";

export default async function Page() {
  const currentSeason = await ControlPanel.getSeason();
  const leagueState = await ControlPanel.getLeagueState();

  return (
    <div className="min-h-full">
      <div className="flex flex-col gap-5 py-10">
        <header>
          <div className="flex flex-row mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 justify-between">
            <h1 className="text-3xl italic text-vdcRed">
              VDC Admin Dashboard / SEASON {currentSeason}
            </h1>
            <LeagueState leagueState={leagueState} />
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-white dark:bg-vdcGrey rounded-lg">
            <div>
              <LeagueDashboard />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function LeagueState({ leagueState }) {
  let statusColor;
  switch (leagueState) {
    case "OFFSEASON":
      statusColor = "fill-gray-500";
      break;
    case "COMBINES":
      statusColor = "fill-yellow-500";
      break;
    case "PRESEASON":
      statusColor = "fill-blue-500";
      break;
    case "REGULAR_SEASON":
      statusColor = "fill-green-500";
      break;
    case "PLAYOFFS":
      statusColor = "fill-red-500";
      break;
  }
  leagueState = leagueState.replace("_", " ");

  return (
    <span className="inline-flex items-center gap-x-1.5 rounded-lg px-2 py-1 text-xs font-medium ring-1 ring-gray-200 dark:ring-vdcGrey ring-inset">
      <svg
        viewBox="0 0 6 6"
        aria-hidden="true"
        className={`size-1.5 ${statusColor} animate-pulse`}
      >
        <circle r={3} cx={3} cy={3} />
      </svg>
      <h2>{leagueState}</h2>
    </span>
  );
}
