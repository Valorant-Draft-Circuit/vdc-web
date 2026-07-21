import { OpsInsights as OpsInsightsData } from "@/lib/queries/staff/admin";
import SignupQueuePanel from "./SignupQueuePanel";
import UnreportedMatchesPanel from "./UnreportedMatchesPanel";
import UpcomingMissingVetosPanel from "./UpcomingMissingVetosPanel";
import UnderreportedGamesPanel from "./UnderreportedGamesPanel";
import SignupTrendChart from "./SignupTrendChart";

export default function OpsInsights({ insights }: { insights: OpsInsightsData }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <SignupQueuePanel queue={insights.signupQueue} />
        <UnreportedMatchesPanel data={insights.unreportedMatches} />
        <UpcomingMissingVetosPanel data={insights.upcomingMissingVetos} />
        <UnderreportedGamesPanel data={insights.underreportedGames} />
      </div>
      <SignupTrendChart trend={insights.signupTrend} />
    </div>
  );
}
