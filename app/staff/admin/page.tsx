import KpiRow from "@/components/staff/admin/ops/KpiRow";
import OpsInsights from "@/components/staff/admin/ops/OpsInsights";
import QuoteBanner from "@/components/staff/admin/ops/QuoteBanner";
import RosterCompositionPanel from "@/components/staff/admin/ops/RosterCompositionPanel";
import {
  getAdminSummary,
  getOpsInsights,
  getRosterComposition,
} from "@/lib/queries/staff/admin";
import { ControlPanel } from "@/prisma";
import Link from "next/link";

export default async function Page() {
  const currentSeason = await ControlPanel.getSeason();
  const [leagueState, summary, composition, insights] = await Promise.all([
    ControlPanel.getLeagueState(),
    getAdminSummary(),
    getRosterComposition(),
    getOpsInsights(currentSeason),
  ]);

  return (
    <div className="min-h-full">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-10">
        <header className="flex flex-col gap-3">
          <div className="flex flex-row items-center justify-between">
            <h1 className="text-3xl text-vdcRed">
              Admin Dashboard / SEASON {currentSeason}
            </h1>
            <LeagueState leagueState={leagueState} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <QuoteBanner />
            <Link
              href="/staff/admin/control"
              className="inline-flex items-center rounded-md bg-vdcRed px-3 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-red-500 hover:cursor-pointer"
            >
              <h1>Control Panel</h1>
            </Link>
          </div>
        </header>

        <main className="flex flex-col gap-5">
          <KpiRow summary={summary} />
          <RosterCompositionPanel composition={composition} />
          <OpsInsights insights={insights} />
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
