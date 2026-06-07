import LeagueDashboard from "@/components/staff/admin/PlayerDashboard";
import { getAdminSummary } from "@/lib/queries/staff/getAdminSummary";
import { ControlPanel } from "@/prisma";
import Link from "next/link";


export default async function Page() {
  const [currentSeason, leagueState, summary] = await Promise.all([
    ControlPanel.getSeason(),
    ControlPanel.getLeagueState(),
    getAdminSummary(),
  ]);

  return (
    <div className="min-h-full">
      <div className="flex flex-col gap-5 py-10 px-5">
        <header>
          <div className="flex flex-row mx-auto max-w-7xl sm:px-6 justify-between">
            <h1 className="text-3xl italic text-vdcRed">
              Admin Dashboard / SEASON {currentSeason}
            </h1>
            <LeagueState leagueState={leagueState} />
          </div>
        </header>
        <main>
          <div className="flex mx-auto max-w-7xl md:justify-end md:px-5">
            <Link
              href={"/staff/admin/control"}
              className="inline-flex text-sm items-center rounded-md bg-vdcRed px-3 py-2.5 font-semibold text-white shadow-xs hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 hover:cursor-pointer"
            >
              <h1>Control Panel</h1>
            </Link>
          </div>
          <h1 className="text-vdcRed py-2 mx-auto max-w-7xl">
            League Dashboard
          </h1>

          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-white dark:bg-vdcGrey rounded-lg">
            <div>
              <LeagueDashboard summary={summary} />
            </div>
          </div>
          <h1 className="text-vdcRed py-2 mx-auto max-w-7xl">
            Pending Signups
          </h1>
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-white dark:bg-vdcGrey rounded-lg">
            <h1 className="text-center">WIP</h1>
          </div>
        </main>
      </div>
    </div>
  );
}

function LeagueState({ leagueState }: { leagueState: string }) {
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
    <span className="inline-flex items-center gap-x-1.5 rounded-lg px-2 my-5 md:my-1 text-xs font-medium ring-1 ring-gray-200 dark:ring-vdcGrey ring-inset">
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
