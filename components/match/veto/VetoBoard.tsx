import { MAP_LIST_URL } from "@/lib/common/constants/maps";
import { TEAM_LOGOS_URL } from "@/lib/common/constants/urls";
import { MatchTeam } from "@/lib/queries/match/match";
import { MatchVeto } from "@/lib/queries/match/getVetoState";
import { MapBanType } from "@prisma/client";
import Image from "next/image";
import VetoActionPanel from "./VetoActionPanel";
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
  canStart,
}: {
  matchID: number;
  veto: MatchVeto;
  teams: { home: MatchTeam; away: MatchTeam };
  maps: Record<string, string>;
  viewerTeamId: number | null;
  viewerIsStaff: boolean;
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
  const viewerIsActing = viewerTeamId !== null && viewerTeamId === actingTeamId;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-row items-center justify-between">
        <h1>MAP BANS / PICKS</h1>
        {viewerIsStaff && phase !== "not-started" && (
          <VetoResetButton matchID={matchID} />
        )}
      </div>

      {phase === "not-started" && (
        <div className={`${GLASSY_PANEL_CLASSES} flex flex-col gap-3`}>
          <h2>Map bans have not started for this match.</h2>
          {canStart && <VetoStartButton matchID={matchID} />}
        </div>
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
            return (
              <div
                key={row.id}
                className={`relative xl:w-72 rounded-lg bg-vdcWhite/40 dark:bg-vdcBlack/40 backdrop-blur-sm ${
                  isCurrentTurn ? "border-1 border-vdcRed" : ""
                }`}
              >
                {mapUuid && (
                  <Image
                    alt={row.map ?? ""}
                    src={MAP_LIST_URL(mapUuid)}
                    width={5000}
                    height={5000}
                    className={`absolute inset-0 -z-10 size-full object-cover rounded-lg ${
                      isDimmed
                        ? "grayscale brightness-35 dark:brightness-30"
                        : "brightness-55 dark:brightness-50"
                    }`}
                  />
                )}
                <div className="flex flex-row xl:flex-col gap-5 p-5 justify-between">
                  <div
                    className={`flex flex-row xl:flex-col gap-5 my-auto xl:m-auto xl:text-center ${
                      mapUuid ? "text-vdcWhite drop-shadow-lg" : ""
                    }`}
                  >
                    <h2 className="text-[10px] tracking-wider uppercase text-vdcRed my-auto xl:my-0">
                      {row.type}
                    </h2>
                    <h2>{row.map ?? "..."}</h2>
                    {row.side && <h2>{row.side}</h2>}
                  </div>
                  <div className="mt-auto xl:mt-10 self-end xl:self-center">
                    {tileTeam?.Franchise.Brand?.logo && (
                      <Image
                        alt={tileTeam.name ?? ""}
                        src={`${TEAM_LOGOS_URL}${tileTeam.Franchise.Brand.logo}`}
                        width={5000}
                        height={5000}
                        className="size-10 xl:size-20"
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
          <h2>{actingLine}</h2>
          {viewerIsActing && state.currentMapTurn && (
            <VetoActionPanel
              matchID={matchID}
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
