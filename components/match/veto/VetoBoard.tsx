import { MAP_LIST_URL } from "@/lib/common/constants/maps";
import { TEAM_LOGOS_URL } from "@/lib/common/constants/urls";
import { MatchTeam } from "@/lib/queries/match/match";
import { MatchVeto } from "@/lib/queries/match/getVetoState";
import { MapBanType } from "@prisma/client";
import { sideChooserFor, VetoRow } from "@/lib/common/mapbansFlow";
import Image from "next/image";
import VetoActionPanel, { VetoActions } from "./VetoActionPanel";
import { BroadcastRevealProvider, RevealGate } from "./BroadcastReveal";
import { VetoSelectionProvider } from "./VetoSelectionContext";
import { TilePreviewArt, TilePreviewName } from "./VetoTilePreview";
import VetoTurnHeader from "./VetoTurnHeader";
import VetoLiveConnector from "./VetoLiveConnector";

const GLASSY_PANEL_CLASSES =
  "rounded-md bg-vdcWhite/40 dark:bg-vdcBlack/40 backdrop-blur-sm p-5";

const BROADCAST_REVEAL_CLASS = "veto-reveal-in";

function resolveTeam(
  teamId: number | null,
  teams: { home: MatchTeam; away: MatchTeam },
): MatchTeam | null {
  if (teamId === teams.home.id) return teams.home;
  if (teamId === teams.away.id) return teams.away;
  return null;
}

function resolveSideChooser(
  row: VetoRow,
  allRows: VetoRow[],
  teams: { home: MatchTeam; away: MatchTeam },
): MatchTeam | null {
  if (row.team !== null) {
    return row.team === teams.home.id ? teams.away : teams.home;
  }
  try {
    return resolveTeam(sideChooserFor(row, allRows), teams);
  } catch {
    return null;
  }
}

export default function VetoBoard({
  veto,
  teams,
  maps,
  viewerTeamId,
  viewerActsForAnyTeam,
  actions,
  wsPath,
  headerControls,
  variant = "page",
}: {
  veto: MatchVeto;
  teams: { home: MatchTeam; away: MatchTeam };
  maps: Record<string, string>;
  viewerTeamId: number | null;
  viewerActsForAnyTeam: boolean;
  actions: VetoActions;
  wsPath: string;
  headerControls?: React.ReactNode;
  variant?: "page" | "broadcast";
}) {
  const isBroadcast = variant === "broadcast";
  const { state, ownership, vetoUrl } = veto;
  const phase = state.phase;
  const isLive = phase === "map-turns" || phase === "side-turns";
  const currentTurnRowId =
    state.currentMapTurn?.rowId ?? state.currentSideTurn?.rowId ?? null;
  const actingTeamId =
    state.currentMapTurn?.actingTeamId ??
    state.currentSideTurn?.actingTeamId ??
    null;
  const actingTeam = resolveTeam(actingTeamId, teams);
  const actingLine = state.currentMapTurn
    ? `${actingTeam?.name} to ${state.currentMapTurn.type}`
    : state.currentSideTurn
      ? `${actingTeam?.name} picks a side on ${state.currentSideTurn.map}`
      : null;
  const viewerIsActing =
    viewerActsForAnyTeam ||
    (viewerTeamId !== null && viewerTeamId === actingTeamId);

  return (
    <VetoSelectionProvider turnKey={`${phase}-${currentTurnRowId ?? "none"}`}>
      <div className="flex flex-col gap-5">
        {!isBroadcast && (
          <div className="flex flex-row items-center justify-between">
            <h1>MAP BANS / PICKS</h1>
            <div className="flex flex-row items-center gap-3">
              {isLive && <VetoLiveConnector wsPath={wsPath} />}
              {headerControls}
            </div>
          </div>
        )}

        {!isBroadcast && phase === "not-started" && (
          <h2 className="rounded-lg border border-vdcRed/40 bg-vdcRed/10 px-4 py-3 text-center text-sm xl:text-lg">
            Map bans have not started for this match.
          </h2>
        )}

        {!isBroadcast && ownership === "bot" && isLive && (
          <div className={`${GLASSY_PANEL_CLASSES} flex flex-col gap-3`}>
            <h2>This veto is running in Discord.</h2>
            {vetoUrl && (
              <a
                href={vetoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-vdcBlue hover:underline"
              >
                <h2>Open the ban channel</h2>
              </a>
            )}
          </div>
        )}

        {phase !== "not-started" && (
          <BroadcastRevealProvider
            stepCount={isBroadcast ? state.rows.length : Number.POSITIVE_INFINITY}
          >
            <div className="flex flex-col xl:flex-row gap-5">
              {state.rows.map((row, rowIndex) => {
                const mapUuid = maps[row.map?.toUpperCase() ?? ""];
                const tileTeam = resolveTeam(row.team, teams);
                const isDimmed =
                  row.type === MapBanType.BAN ||
                  row.type === MapBanType.DISCARD;
                const isCurrentTurn = row.id === currentTurnRowId;
                const isPendingMap = row.map === null;
                const isGreyedPending = isPendingMap && !isCurrentTurn;
                const gate = (
                  node: React.ReactNode,
                  fallback: React.ReactNode = null,
                ) =>
                  isBroadcast ? (
                    <RevealGate index={rowIndex} fallback={fallback}>
                      {node}
                    </RevealGate>
                  ) : (
                    node
                  );
                return (
                  <div
                    key={row.id}
                    className={`relative ${
                      isBroadcast
                        ? "xl:min-w-0 xl:flex-1 xl:min-h-[60vh]"
                        : "xl:w-72 xl:min-h-80"
                    }  bg-vdcWhite/40 dark:bg-vdcBlack/40 backdrop-blur-sm border ${
                      isCurrentTurn ? "border-vdcRed" : "border-gray-500/40"
                    } ${isBroadcast ? "rounded-none" : "rounded-lg"}`}
                  >
                    {mapUuid &&
                      gate(
                        <Image
                          alt={row.map ?? ""}
                          src={MAP_LIST_URL(mapUuid)}
                          width={5000}
                          height={5000}
                          className={`absolute inset-0 -z-10 size-full object-cover ${
                            isDimmed
                              ? "veto-tile-reveal-dead grayscale brightness-35 dark:brightness-30"
                              : "veto-tile-reveal brightness-55 dark:brightness-50"
                          } ${isBroadcast ? "rounded-none" : "rounded-lg"}`}
                        />,
                      )}
                    {isPendingMap && isCurrentTurn && (
                      <TilePreviewArt maps={maps} />
                    )}
                    <div className="flex h-full flex-row xl:flex-col gap-5 p-5 justify-between ">
                      <div
                        className={`flex flex-row xl:flex-col my-auto xl:my-0 xl:mx-auto xl:text-center ${
                          mapUuid ? "text-vdcWhite drop-shadow-lg" : ""
                        } ${isBroadcast ? "gap-10" : "gap-5"}`}
                      >
                        <h2
                          className={`text-md tracking-wider uppercase my-auto xl:my-0 ${
                            isGreyedPending
                              ? "text-gray-500"
                              : row.type === MapBanType.PICK
                                ? "text-vdcGreen"
                                : row.type === MapBanType.DECIDER
                                  ? "text-vdcBlue"
                                  : "text-vdcRed"
                          } ${isBroadcast ? "text-2xl" : "text-md"}`}
                        >
                          {row.type}
                        </h2>
                        {isPendingMap ? (
                          isCurrentTurn ? (
                            <TilePreviewName />
                          ) : (
                            <h2
                              className={`text-2xl ${
                                isGreyedPending ? "text-gray-500" : ""
                              }`}
                            >
                              ?
                            </h2>
                          )
                        ) : (
                          gate(
                            <h2
                              className={`${
                                isBroadcast
                                  ? `text-2xl ${BROADCAST_REVEAL_CLASS}`
                                  : ""
                              }`}
                            >
                              {row.map}
                            </h2>,
                            <h2 className="text-2xl">?</h2>,
                          )
                        )}
                        {row.side &&
                          gate(
                            <SideChoiceLine
                              side={row.side}
                              chooser={resolveSideChooser(
                                row,
                                state.rows,
                                teams,
                              )}
                              isBroadcast={isBroadcast}
                            />,
                          )}
                      </div>
                      <div className="mt-auto self-end xl:self-center">
                        {tileTeam?.Franchise.Brand?.logo &&
                          gate(
                            <Image
                              alt={tileTeam.name ?? ""}
                              src={`${TEAM_LOGOS_URL}${tileTeam.Franchise.Brand.logo}`}
                              width={5000}
                              height={5000}
                              className={`size-10 xl:size-20 ${
                                isGreyedPending ? "grayscale opacity-60" : ""
                              } ${isBroadcast ? BROADCAST_REVEAL_CLASS : ""}`}
                            />,
                          )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </BroadcastRevealProvider>
        )}

        {ownership === "web" && isLive && actingLine && (
          <div className="flex flex-col gap-3">
            {!viewerIsActing && !isBroadcast && (
              <VetoTurnHeader headline={actingLine} />
            )}
            {viewerIsActing && state.currentMapTurn && (
              <VetoActionPanel
                key={`map-${state.currentMapTurn.rowId}`}
                actions={actions}
                headline={actingLine}
                turn={{
                  kind: "map",
                  turnType: state.currentMapTurn.type,
                  remainingMaps: state.remainingMaps,
                }}
                maps={maps}
              />
            )}
            {viewerIsActing && state.currentSideTurn && (
              <VetoActionPanel
                key={`side-${state.currentSideTurn.rowId}`}
                actions={actions}
                headline={actingLine}
                turn={{
                  kind: "side",
                  rowId: state.currentSideTurn.rowId,
                  map: state.currentSideTurn.map,
                }}
                maps={maps}
              />
            )}
          </div>
        )}

        {isBroadcast && isLive && <VetoLiveConnector wsPath={wsPath} hideStatus />}
      </div>
    </VetoSelectionProvider>
  );
}

function SideChoiceLine({
  side,
  chooser,
  isBroadcast,
}: {
  side: string;
  chooser: MatchTeam | null;
  isBroadcast: boolean;
}) {
  return (
    <div
      className={`flex flex-row items-center gap-1.5 xl:justify-center ${
        isBroadcast ? BROADCAST_REVEAL_CLASS : ""
      }`}
    >
      {chooser?.Franchise.Brand?.logo && (
        <Image
          alt={chooser.name ?? ""}
          src={`${TEAM_LOGOS_URL}${chooser.Franchise.Brand.logo}`}
          width={100}
          height={100}
          className={`${isBroadcast ? "size-10" : "size-5"}`}
        />
      )}
      <h2 className={`${isBroadcast ? "text-2xl" : ""}`}>{side}</h2>
    </div>
  );
}
