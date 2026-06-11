"use client";

import { useState } from "react";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid";
import {
  MAP_LIST_URL,
  TIER_HEX_COLOR_MAP,
  TIERS_LIST,
} from "@/lib/common/constants";
import {
  RecapMapCount,
  RecapMapGame,
  RecapMapReport,
} from "@/lib/common/matchNight/types";
import { Maps } from "@/lib/common/valorant-api";
import MatchupLink from "./MatchupLink";

type Props = {
  mapReport: RecapMapReport;
  mapUuidsByName: Maps;
  showTierDots: boolean;
};

export default function MapReportCard({
  mapReport,
  mapUuidsByName,
  showTierDots,
}: Props) {
  const tiles = [
    { label: "Most Played", entry: mapReport.mostPlayed, hover: "Played" },
    { label: "Most Banned", entry: mapReport.mostBanned, hover: "Banned" },
  ].filter(
    (tile): tile is { label: string; entry: RecapMapCount; hover: string } =>
      tile.entry !== null,
  );

  return (
    <div className="flex min-h-96 flex-col gap-2 rounded-md bg-vdcWhite/40 dark:bg-vdcBlack/40 backdrop-blur-sm p-4">
      <h2 className="text-md tracking-wider uppercase text-vdcRed font-semibold">
        Map Report
      </h2>
      {tiles.length === 0 ? (
        <h1 className="text-sm text-gray-600 dark:text-gray-300">
          No map data recorded.
        </h1>
      ) : (
        <div className="flex flex-1 flex-col gap-2">
          {tiles.map((tile) => (
            <MapTile
              key={tile.label}
              label={tile.label}
              hover={tile.hover}
              entry={tile.entry}
              mapUuidsByName={mapUuidsByName}
              showTierDots={showTierDots}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MapTile({
  label,
  entry,
  hover,
  mapUuidsByName,
  showTierDots,
}: {
  label: string;
  entry: RecapMapCount;
  hover: string;
  mapUuidsByName: Maps;
  showTierDots: boolean;
}) {
  const [showTeams, setShowTeams] = useState(false);
  const mapUuid = mapUuidsByName[entry.map.toUpperCase()];
  const games = sortGamesByTier(entry.games);

  return (
    <div className="relative flex-1" onMouseLeave={() => setShowTeams(false)}>
      <div className="relative h-full min-h-20 overflow-hidden rounded-md">
        {mapUuid && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={MAP_LIST_URL(mapUuid)}
            alt={entry.map}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover brightness-75"
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-vdcWhite/95 via-vdcWhite/60 to-transparent dark:from-vdcBlack/95 dark:via-vdcBlack/60" />
        {games.length > 0 && (
          <button
            onClick={() => setShowTeams((open) => !open)}
            aria-label={`Show teams that ${hover.toLowerCase()} ${entry.map}`}
            aria-expanded={showTeams}
            className="absolute right-2 top-2 z-20 rounded bg-slate-100/60 dark:bg-vdcBlack/60 backdrop-blur-[1px] p-0.5 text-vdcBlack dark:text-vdcWhite hover:cursor-pointer hover:text-vdcRed"
          >
            <EllipsisHorizontalIcon className="size-5" />
          </button>
        )}
        <div className="relative z-10 flex h-full items-end justify-between p-3">
          <h1 className="text-lg font-bold text-vdcBlack dark:text-vdcWhite">
            {entry.map}
          </h1>
          <h1 className="rounded-lg bg-slate-100/60 dark:bg-vdcBlack/60 backdrop-blur-[1px] px-2 py-1 text-sm tracking-wider uppercase text-vdcRed font-semibold">
            {label} · {entry.count} ({Math.round(entry.share * 100)}%)
          </h1>
        </div>
      </div>
      {showTeams && games.length > 0 && (
        <div className="absolute right-2 top-8 z-40 flex w-max max-w-72 flex-col gap-1.5 rounded-md bg-vdcWhite p-3 dark:bg-vdcBlack">
          <h2 className="text-xs tracking-wider uppercase text-vdcRed font-semibold">
            {hover} in
          </h2>
          {games.map((game) => (
            <MatchupLink key={`${game.matchID}-${game.gameID}`} matchup={game}>
              {showTierDots && (
                <span
                  className="size-2.5 flex-none rounded-full"
                  style={{ backgroundColor: TIER_HEX_COLOR_MAP[game.tier] }}
                />
              )}
            </MatchupLink>
          ))}
        </div>
      )}
    </div>
  );
}

function sortGamesByTier(games: RecapMapGame[]): RecapMapGame[] {
  const tierRank = (game: RecapMapGame) =>
    TIERS_LIST.findIndex((tier) => tier === game.tier);

  return [...games].sort((left, right) => tierRank(left) - tierRank(right));
}
