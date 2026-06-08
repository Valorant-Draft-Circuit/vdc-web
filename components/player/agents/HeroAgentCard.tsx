import Image from "next/image";
import { GameType } from "@prisma/client";
import type { PlayerAgentBreakdown } from "@/lib/queries/stats/getPlayerAgentBreakdown";
import type { TeamLogoMap } from "@/lib/queries/teams/teams";
import BestGameCard from "./BestGameCard";
import PerSidePanel from "./PerSidePanel";

type Props = {
  entry: PlayerAgentBreakdown;
  teamMap: TeamLogoMap;
  gameType: GameType;
};

export default function HeroAgentCard({ entry, teamMap, gameType }: Props) {
  const { catalog, averages, totals, gamesPlayed, wins, rounds } = entry;
  const rating = (averages.ratingAttack + averages.ratingDefense) / 2;
  const winPct = gamesPlayed === 0 ? 0 : (wins / gamesPlayed) * 100;
  const kd = totals.deaths === 0 ? totals.kills : totals.kills / totals.deaths;
  const adr = rounds === 0 ? 0 : totals.damage / rounds;
  const fkPct = rounds === 0 ? 0 : (totals.firstKills / rounds) * 100;
  const fdPct = rounds === 0 ? 0 : (totals.firstDeaths / rounds) * 100;

  const stats: Array<[string, string]> = [
    ["ACS", averages.acs.toFixed(0)],
    ["ADR", adr.toFixed(0)],
    ["K/D", kd.toFixed(2)],
    ["KAST", `${averages.kast.toFixed(0)}%`],
    ["HS%", `${averages.hsPercent.toFixed(0)}%`],
    ["FK%", `${fkPct.toFixed(0)}%`],
    ["FD%", `${fdPct.toFixed(0)}%`],
    ["CLUT", String(totals.clutches)],
  ];

  const showBestGame = gameType !== GameType.COMBINE && entry.bestGame !== null;

  const gradientStops = (catalog?.backgroundGradientColors ?? []).map(
    (c) => `#${c.slice(0, 6)}`,
  );
  const gradientStyle =
    gradientStops.length >= 2
      ? { background: `linear-gradient(135deg, ${gradientStops.join(", ")})` }
      : undefined;

  return (
    <div
      className="relative overflow-hidden rounded-md bg-slate-100 dark:bg-vdcGrey min-h-[220px] mx-2 xl:mx-0"
      style={gradientStyle}
    >
      {catalog?.fullPortraitUrl && (
        <Image
          src={catalog.fullPortraitUrl}
          alt={catalog.displayName}
          fill
          sizes="(min-width: 1280px) 768px, 100vw"
          className="absolute pointer-events-none inset-0 object-cover object-[right_25%] brightness-50 dark:brightness-35 scale-110 origin-top-right translate-x-[30%]"
        />
      )}
      <div className="absolute inset-0 pointer-events-none bg-linear-to-r from-vdcWhite/95 via-vdcWhite/60 to-transparent dark:from-vdcBlack/95 dark:via-vdcBlack/60" />

      <div className="relative z-10 flex flex-col gap-3 p-4 xl:p-6">
        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_2.5fr] gap-4 items-center">
          <div className="flex items-center gap-3">
            {catalog?.displayIconUrl && (
              <Image
                src={catalog.displayIconUrl}
                alt={catalog.displayName}
                width={200}
                height={200}
                className="rounded-md size-16"
              />
            )}
            <div className="flex flex-col">
              <h1 className="text-[10px] tracking-wider text-vdcBlack dark:text-gray-400">
                Viewing
              </h1>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-vdcBlack dark:text-vdcWhite leading-tight">
                  {catalog?.displayName ?? entry.agent}
                </h2>
                {catalog?.role && (
                  <>
                    <Image
                      src={catalog.role.iconUrl}
                      alt={catalog.role.name}
                      width={18}
                      height={18}
                      className="w-[18px] h-[18px] invert dark:invert-0"
                    />
                  </>
                )}
              </div>
              <h2 className="text-[11px] font-normal text-gray-600 dark:text-gray-300 whitespace-nowrap">
                <span className="font-semibold text-vdcBlack dark:text-vdcWhite">
                  {rating.toFixed(2)}
                </span>{" "}
                Rating &middot; {gamesPlayed} Games &middot; {winPct.toFixed(0)}
                % WR
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
            {stats.map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between rounded bg-slate-100/40 dark:bg-vdcBlack/40 backdrop-blur-sm px-2 py-1 text-xs"
              >
                <h1 className="text-vdcRed font-semibold">{label}</h1>
                <h1 className="text-vdcBlack dark:text-vdcWhite">{value}</h1>
              </div>
            ))}
          </div>
        </div>

        <div
          className={`grid gap-3 ${showBestGame ? "xl:grid-cols-[1.4fr_1fr]" : "xl:grid-cols-1"}`}
        >
          <PerSidePanel entry={entry} />
          {showBestGame && entry.bestGame && (
            <BestGameCard ref_={entry.bestGame} teamMap={teamMap} />
          )}
        </div>
      </div>
    </div>
  );
}
