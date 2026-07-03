import LeagueStateBadge from "@/components/staff/LeagueStateBadge";
import EscalationWatchPanel from "@/components/staff/moderation/EscalationWatchPanel";
import ModeratorActivityPanel from "@/components/staff/moderation/ModeratorActivityPanel";
import PickemDeletionQueue from "@/components/staff/moderation/PickemDeletionQueue";
import PlayerHistoryLookup from "@/components/staff/moderation/PlayerHistoryLookup";
import SanctionsSection from "@/components/staff/moderation/SanctionsSection";
import {
  getActiveSanctions,
  getBans,
  getEscalationWatch,
  getModeratorActivity,
  getPickemDeletionQueue,
  getPlayerModHistory,
} from "@/lib/queries/staff/moderation";
import { ControlPanel } from "@/prisma";
import { ModLogType } from "@prisma/client";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ player?: string }>;
}) {
  const { player } = await searchParams;
  const selectedIgn = player ?? null;
  const currentSeason = await ControlPanel.getSeason();

  const [
    leagueState,
    sanctions,
    bans,
    deletionQueue,
    escalations,
    activity,
    history,
  ] = await Promise.all([
    ControlPanel.getLeagueState(),
    getActiveSanctions(),
    getBans(),
    getPickemDeletionQueue(),
    getEscalationWatch(),
    getModeratorActivity(),
    selectedIgn ? getPlayerModHistory(selectedIgn) : Promise.resolve(null),
  ]);

  const activeMutes = sanctions.filter(
    (sanction) => sanction.type === ModLogType.MUTE,
  ).length;
  const unactionedDeletions = deletionQueue.filter(
    (entry) => !entry.actioned,
  ).length;
  const escalatedPlayers = escalations.filter(
    (escalation) => escalation.type === "TOTAL",
  ).length;
  const summary = {
    bans: bans.length,
    activeMutes,
    unactionedDeletions,
    escalations: escalatedPlayers,
  };

  return (
    <div className="min-h-full">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-10">
        <header className="flex flex-row items-center justify-between">
          <h1 className="text-3xl text-vdcRed">
            Moderation / SEASON {currentSeason}
          </h1>
          <LeagueStateBadge leagueState={leagueState} />
        </header>

        <main className="flex flex-col gap-5">
          <SanctionsSection summary={summary} sanctions={sanctions} bans={bans}>
            <PickemDeletionQueue entries={deletionQueue} />
          </SanctionsSection>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <EscalationWatchPanel escalations={escalations} />
            <ModeratorActivityPanel activity={activity} />
          </div>

          <PlayerHistoryLookup selectedIgn={selectedIgn} history={history} />
        </main>
      </div>
    </div>
  );
}
