import Image from "next/image";
import Link from "next/link";
import { TEAM_LOGOS_URL } from "@/lib/common/constants/urls";
import { TIER_HEX_COLOR_MAP } from "@/lib/common/constants/tiers";
import { RecapMover } from "@/lib/common/matchNight/types";

type Props = {
  movers: RecapMover[];
  showTierDots: boolean;
};

export default function StandingsMoversCard({ movers, showTierDots }: Props) {
  return (
    <div className="flex min-h-96 flex-col gap-2 rounded-md bg-vdcWhite/40 dark:bg-vdcBlack/40 backdrop-blur-sm p-4">
      <h2 className="text-md tracking-wider uppercase text-vdcRed font-semibold">
        Standings Movers
      </h2>
      {movers.length === 0 ? (
        <p className="text-sm text-gray-600 dark:text-gray-300">
          No movement this match day.
        </p>
      ) : (
        <ul className="flex max-h-80 flex-col overflow-y-auto pr-1">
          {movers.map((mover) => (
            <li
              key={`${mover.tier}-${mover.teamName}`}
              className="grid h-16 grid-cols-[auto_1fr_auto] items-center gap-2 border-b border-vdcBlack/10 dark:border-vdcWhite/10 text-base last:border-b-0"
            >
              <span className="relative size-10 flex-none">
                {mover.teamLogo && (
                  <Image
                    src={`${TEAM_LOGOS_URL}${mover.teamLogo}`}
                    alt={mover.teamName}
                    fill
                    className="object-contain"
                  />
                )}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="flex min-w-0 items-center gap-2">
                  <Link
                    href={`/franchises/${mover.franchiseSlug}?team=${mover.tier.toLowerCase()}`}
                    className="text-wrap hover:text-vdcRed"
                  >
                    <h1>{mover.teamName}</h1>
                  </Link>
                  {showTierDots && (
                    <span
                      className="size-2.5 flex-none rounded-full"
                      style={{
                        backgroundColor: TIER_HEX_COLOR_MAP[mover.tier],
                      }}
                    />
                  )}
                </span>
                <h2 className="text-xs tabular-nums text-gray-600 dark:text-gray-400">
                  #{mover.previousRank} → #{mover.currentRank}
                </h2>
              </span>
              <h1
                className={`tabular-nums font-semibold ${
                  mover.delta > 0 ? "text-vdcGreen" : "text-vdcRed"
                }`}
              >
                {mover.delta > 0 ? "▲" : "▼"} {Math.abs(mover.delta)}
              </h1>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
