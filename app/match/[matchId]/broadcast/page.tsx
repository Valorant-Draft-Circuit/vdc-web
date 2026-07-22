import BroadcastViewport from "@/components/match/veto/BroadcastViewport";
import VetoBoard from "@/components/match/veto/VetoBoard";
import { getMapsCached } from "@/lib/common/cache";
import { getWebMapbansFlags } from "@/lib/queries/control/control";
import { getMatch } from "@/lib/queries/match/match";
import { getVetoState } from "@/lib/queries/match/getVetoState";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "VDC | Map Bans Broadcast",
};

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;
  const [matchInfo, maps, mapbansFlags] = await Promise.all([
    getMatch(matchId),
    getMapsCached(),
    getWebMapbansFlags(),
  ]);
  if (!matchInfo?.Home || !matchInfo?.Away) notFound();

  const veto = mapbansFlags.enabled
    ? await getVetoState(matchInfo.matchID, matchInfo.matchType)
    : null;
  const showBoard = veto !== null && veto.state.phase !== "not-started";

  return (
    <div className="dark fixed inset-0 z-60 flex flex-col justify-center overflow-hidden bg-black p-6 text-vdcWhite">
      <BroadcastViewport />
      {showBoard ? (
        <VetoBoard
          matchID={matchInfo.matchID}
          veto={veto}
          teams={{ home: matchInfo.Home, away: matchInfo.Away }}
          maps={maps}
          viewerTeamId={null}
          viewerIsStaff={false}
          viewerActsForAnyTeam={false}
          canStart={false}
          variant="broadcast"
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <h1 className="text-2xl">
            {matchInfo.Home.name} vs {matchInfo.Away.name} - waiting for map
            bans
          </h1>
        </div>
      )}
    </div>
  );
}
