import Link from "next/link";
import { TIER_HEX_COLOR_MAP } from "@/lib/common/constants/tiers";
import {
  RecapPerformer,
  RecapPerformerGame,
  RecapStat,
} from "@/lib/common/matchNight/types";
import MatchupLink from "./MatchupLink";

const STAT_OPTIONS: Array<{ key: RecapStat; label: string }> = [
  { key: "rating", label: "Rating" },
  { key: "acs", label: "ACS" },
  { key: "kd", label: "KD" },
];

const TOP_PERFORMERS_SHOWN = 5;

type Props = {
  performers: RecapPerformer[];
  activeStat: RecapStat;
  onStatChange: (stat: RecapStat) => void;
  showTierDots: boolean;
};

export default function TopPerformersCard({
  performers,
  activeStat,
  onStatChange,
  showTierDots,
}: Props) {
  const topPerformers = sortByStat(performers, activeStat).slice(
    0,
    TOP_PERFORMERS_SHOWN,
  );

  return (
    <div className="flex min-h-96 flex-col gap-2 rounded-md bg-vdcWhite/40 dark:bg-vdcBlack/40 backdrop-blur-sm p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-md tracking-wider uppercase text-vdcRed font-semibold">
          Top Performers
        </h2>
        <div className="flex gap-1">
          {STAT_OPTIONS.map((option) => (
            <button
              key={option.key}
              onClick={() => onStatChange(option.key)}
              className={`rounded px-2.5 py-1 text-xs font-semibold hover:cursor-pointer ${
                option.key === activeStat
                  ? "bg-vdcRed text-vdcWhite"
                  : "bg-slate-100/40 dark:bg-vdcBlack/40 text-gray-600 dark:text-gray-300 hover:brightness-90"
              }`}
            >
              <h2>{option.label}</h2>
            </button>
          ))}
        </div>
      </div>

      {topPerformers.length === 0 ? (
        <h1 className="text-sm text-gray-600 dark:text-gray-300">
          No games recorded.
        </h1>
      ) : (
        <ol className="flex flex-col">
          {topPerformers.map((performer, index) => {
            const bestGame = bestGameForStat(performer, activeStat);
            return (
              <li
                key={performer.playerName}
                className="grid h-16 grid-cols-[auto_1fr_auto] items-center gap-2 border-b border-vdcBlack/10 dark:border-vdcWhite/10 text-base last:border-b-0"
              >
                <h1 className="w-5 text-sm text-gray-500 dark:text-gray-400">
                  {index + 1}
                </h1>
                <span className="flex min-w-0 flex-col">
                  <span className="flex min-w-0 items-center gap-2">
                    <Link
                      href={`/player/${encodeURIComponent(performer.playerName)}`}
                      className="truncate hover:text-vdcRed"
                    >
                      <h2 className="truncate">{performer.playerName}</h2>
                    </Link>
                    {showTierDots && (
                      <span
                        className="size-2.5 flex-none rounded-full"
                        style={{
                          backgroundColor: TIER_HEX_COLOR_MAP[performer.tier],
                        }}
                      />
                    )}
                  </span>
                  {bestGame !== null && (
                    <MatchupLink matchup={bestGame}>
                      {bestGame.map && (
                        <h2 className="flex-none text-gray-500 dark:text-gray-500">
                          · {bestGame.map}
                        </h2>
                      )}
                    </MatchupLink>
                  )}
                </span>
                <h1 className="tabular-nums font-semibold text-vdcBlack dark:text-vdcWhite">
                  {formatStatValue(performer, activeStat)}
                </h1>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function bestGameForStat(
  performer: RecapPerformer,
  stat: RecapStat,
): RecapPerformerGame | null {
  if (performer.games.length === 0) return null;

  const statValue = (game: RecapPerformerGame): number => {
    if (stat === "rating") return game.rating ?? -Infinity;
    if (stat === "acs") return game.acs;
    return game.kd;
  };

  return performer.games.reduce((best, game) =>
    statValue(game) > statValue(best) ? game : best,
  );
}

function sortByStat(
  performers: RecapPerformer[],
  stat: RecapStat,
): RecapPerformer[] {
  const sorted = [...performers];
  if (stat === "rating") {
    sorted.sort((a, b) => (b.rating ?? -Infinity) - (a.rating ?? -Infinity));
  } else if (stat === "acs") {
    sorted.sort((a, b) => b.acs - a.acs);
  } else {
    sorted.sort((a, b) => b.kd - a.kd);
  }
  return sorted;
}

function formatStatValue(performer: RecapPerformer, stat: RecapStat): string {
  if (stat === "rating") {
    return performer.rating === null ? "N/A" : performer.rating.toFixed(2);
  }
  if (stat === "acs") return performer.acs.toFixed(0);
  return performer.kd.toFixed(2);
}
