import { notFound } from "next/navigation";
import VetoBoard from "@/components/match/veto/VetoBoard";
import { getMapsCached } from "@/lib/common/cache";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { deriveVetoState } from "@/lib/common/mapbansFlow";
import { getVetoTeamsByIds } from "@/lib/queries/match/match";
import { MatchVeto } from "@/lib/queries/match/getVetoState";
import { getLobby } from "@/lib/server/mapbanLobbies";
import {
  previewMapbanSelection,
  submitMapbanPick,
  submitMapbanSide,
} from "./actions";
import CopyInviteButton from "./CopyInviteButton";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ lobbyId: string }>;
}) {
  const { lobbyId } = await params;
  const lobby = getLobby(lobbyId);
  if (!lobby) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-10">
        <h2 className="rounded-lg border border-vdcRed/40 bg-vdcRed/10 px-4 py-3 text-center">
          This lobby has expired or was not found.
        </h2>
      </div>
    );
  }

  const [session, teams, maps] = await Promise.all([
    auth(),
    getVetoTeamsByIds(lobby.homeTeamId, lobby.awayTeamId),
    getMapsCached(),
  ]);
  if (!teams) notFound();

  const userId = session?.user?.id ?? null;
  const viewer = userId
    ? await prisma.user.findFirst({
        where: {
          id: userId,
          team: { in: [lobby.homeTeamId, lobby.awayTeamId] },
        },
        select: { team: true },
      })
    : null;

  const state = deriveVetoState(lobby.rows, lobby.mapPool);
  const veto: MatchVeto = {
    state,
    ownership: "web",
    vetoUrl: null,
    banOrder: lobby.banOrder,
    mapPool: lobby.mapPool,
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <VetoBoard
        veto={veto}
        teams={teams}
        maps={maps}
        viewerTeamId={viewer?.team ?? null}
        viewerActsForAnyTeam={false}
        actions={{
          preview: previewMapbanSelection.bind(null, lobbyId),
          submitMap: submitMapbanPick.bind(null, lobbyId),
          submitSide: submitMapbanSide.bind(null, lobbyId),
        }}
        wsPath={`/ws/mapbans?lobbyId=${lobbyId}`}
        headerControls={<CopyInviteButton />}
      />
    </div>
  );
}
