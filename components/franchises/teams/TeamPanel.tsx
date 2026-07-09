import { Suspense } from "react";
import HorizontalTab from "@/components/tabs/HorizontalTab";
import { TabElement } from "@/components/tabs/types";
import { getSeasonCached } from "@/lib/common/cache";
import { FranchiseTeam } from "@/lib/queries/franchises/franchises";
import TeamMapsLoader from "./maps/TeamMapsLoader";
import TeamMapsSkeleton from "./maps/TeamMapsSkeleton";
import TeamOverview from "./overview/TeamOverview";
import TeamOverviewSkeleton from "./overview/TeamOverviewSkeleton";
import TeamStatsPanel from "./TeamStats";
import TeamTransactionsLoader from "./transactions/TeamTransactionsLoader";
import TeamTransactionsSkeleton from "./transactions/TeamTransactionsSkeleton";

export const TEAM_VIEWS = ["overview", "stats", "maps", "transactions"] as const;
export type TeamView = (typeof TEAM_VIEWS)[number];

export default async function TeamPanel({
  team,
  view,
}: {
  team: FranchiseTeam;
  view: TeamView;
}) {
  const season = await getSeasonCached();

  const viewTabs: TabElement[] = [
    {
      query: "overview",
      name: "Overview",
      color: "vdcRed",
      content:
        view === "overview" ? (
          <Suspense fallback={<TeamOverviewSkeleton />}>
            <TeamOverview team={team} />
          </Suspense>
        ) : null,
    },
    {
      query: "stats",
      name: "Stats",
      color: "vdcRed",
      content:
        view === "stats" ? (
          <Suspense
            fallback={
              <div className="h-64 rounded-md bg-slate-100 dark:bg-vdcGrey animate-pulse" />
            }
          >
            <TeamStatsPanel teamId={team.id} season={season} tier={team.tier} />
          </Suspense>
        ) : null,
    },
    {
      query: "maps",
      name: "Maps",
      color: "vdcRed",
      content:
        view === "maps" ? (
          <Suspense fallback={<TeamMapsSkeleton />}>
            <TeamMapsLoader teamId={team.id} season={season} />
          </Suspense>
        ) : null,
    },
    {
      query: "transactions",
      name: "Transactions",
      color: "vdcRed",
      content:
        view === "transactions" ? (
          <Suspense fallback={<TeamTransactionsSkeleton />}>
            <TeamTransactionsLoader teamId={team.id} season={season} />
          </Suspense>
        ) : null,
    },
  ];

  return (
    <HorizontalTab tabElements={viewTabs} params="view" />
  );
}

export function TeamPanelSkeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      <div className="h-10 rounded-md bg-slate-100 dark:bg-vdcGrey" />
      <div className="h-14 rounded-md bg-slate-100 dark:bg-vdcGrey" />
      <div className="h-64 rounded-md bg-slate-100 dark:bg-vdcGrey" />
      <div className="h-40 rounded-md bg-slate-100 dark:bg-vdcGrey" />
    </div>
  );
}
