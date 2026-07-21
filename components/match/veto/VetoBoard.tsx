import { MAP_LIST_URL } from "@/lib/common/constants/maps";
import { TEAM_LOGOS_URL } from "@/lib/common/constants/urls";
import { MatchTeam } from "@/lib/queries/match/match";
import { MatchVeto } from "@/lib/queries/match/getVetoState";
import { MapBanType } from "@prisma/client";
import Image from "next/image";
import VetoActionPanel from "./VetoActionPanel";
import VetoTurnHeader from "./VetoTurnHeader";
import VetoLiveConnector from "./VetoLiveConnector";
import VetoResetButton from "./VetoResetButton";
import VetoStartButton from "./VetoStartButton";

const GLASSY_PANEL_CLASSES =
  "rounded-md bg-vdcWhite/40 dark:bg-vdcBlack/40 backdrop-blur-sm p-5";

function resolveTeam(
  teamId: number | null,
  teams: { home: MatchTeam; away: MatchTeam },
): MatchTeam | null {
  if (teamId === teams.home.id) return teams.home;
  if (teamId === teams.away.id) return teams.away;
  return null;
}

export default function VetoBoard({
  matchID,
  veto,
  teams,
  maps,
  viewerTeamId,
  viewerIsStaff,
  viewerActsForAnyTeam,
  canStart,
}: {
  matchID: number;
  veto: MatchVeto;
  teams: { home: MatchTeam; away: MatchTeam };
  maps: Record<string, string>;
  viewerTeamId: number | null;
  viewerIsStaff: boolean;
  viewerActsForAnyTeam: boolean;
  canStart: boolean;
}) {
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
    <div className="flex flex-col gap-5">
      <div className="flex flex-row items-center justify-between">
        <h1>MAP BANS / PICKS</h1>
        {phase === "not-started"
          ? canStart && <VetoStartButton matchID={matchID} />
          : viewerIsStaff && <VetoResetButton matchID={matchID} />}
      </div>

      {phase === "not-started" && (
        <h2 className="rounded-lg border border-vdcRed/40 bg-vdcRed/10 px-4 py-3 text-center text-sm xl:text-lg">
          Map bans have not started for this match.
        </h2>
      )}

      {ownership === "bot" && isLive && (
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
        <div className="flex flex-col xl:flex-row gap-5">
          {state.rows.map((row) => {
            const mapUuid = maps[row.map?.toUpperCase() ?? ""];
            const tileTeam = resolveTeam(row.team, teams);
            const isDimmed =
              row.type === MapBanType.BAN || row.type === MapBanType.DISCARD;
            const isCurrentTurn = row.id === currentTurnRowId;
            const isPendingMap = row.map === null;
            const isGreyedPending = isPendingMap && !isCurrentTurn;
            return (
              <div
                key={row.id}
                className={`relative xl:w-72 xl:min-h-80 rounded-lg bg-vdcWhite/40 dark:bg-vdcBlack/40 backdrop-blur-sm border ${
                  isCurrentTurn ? "border-vdcRed" : "border-gray-500/40"
                }`}
              >
                {mapUuid && (
                  <Image
                    alt={row.map ?? ""}
                    src={MAP_LIST_URL(mapUuid)}
                    width={5000}
                    height={5000}
                    className={`veto-tile-reveal absolute inset-0 -z-10 size-full object-cover rounded-lg ${
                      isDimmed
                        ? "grayscale brightness-35 dark:brightness-30"
                        : "brightness-55 dark:brightness-50"
                    }`}
                  />
                )}
                <div className="flex h-full flex-row xl:flex-col gap-5 p-5 justify-between">
                  <div
                    className={`flex flex-row xl:flex-col gap-5 my-auto xl:my-0 xl:mx-auto xl:text-center ${
                      mapUuid ? "text-vdcWhite drop-shadow-lg" : ""
                    }`}
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
                      }`}
                    >
                      {row.type}
                    </h2>
                    {isPendingMap ? (
                      <h2
                        className={`text-2xl ${
                          isGreyedPending ? "text-gray-500" : ""
                        }`}
                      >
                        ?
                      </h2>
                    ) : (
                      <h2>{row.map}</h2>
                    )}
                    {row.side && <h2>{row.side}</h2>}
                  </div>
                  <div className="mt-auto self-end xl:self-center">
                    {tileTeam?.Franchise.Brand?.logo && (
                      <Image
                        alt={tileTeam.name ?? ""}
                        src={`${TEAM_LOGOS_URL}${tileTeam.Franchise.Brand.logo}`}
                        width={5000}
                        height={5000}
                        className={`size-10 xl:size-20 ${
                          isGreyedPending ? "grayscale opacity-60" : ""
                        }`}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {ownership === "web" && isLive && actingLine && (
        <div className="flex flex-col gap-3">
          {!viewerIsActing && <VetoTurnHeader headline={actingLine} />}
          {viewerIsActing && state.currentMapTurn && (
            <VetoActionPanel
              matchID={matchID}
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
              matchID={matchID}
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

      {isLive && <VetoLiveConnector matchID={matchID} />}
    </div>
  );
}
