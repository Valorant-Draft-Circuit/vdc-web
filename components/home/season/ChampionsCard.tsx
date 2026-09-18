import Link from "next/link";
import { TIER_HEX_COLOR_MAP } from "@/lib/common/constants/tiers";
import { ChampionSummary } from "@/lib/queries/home/seasonSummary";
import TeamLogo from "../recap/TeamLogo";

type Props = {
  champions: ChampionSummary[];
  showTierDots: boolean;
};

export default function ChampionsCard({ champions, showTierDots }: Props) {
  return (
    <div className="flex min-h-96 flex-col gap-2 rounded-md bg-vdcWhite/40 dark:bg-vdcBlack/40 backdrop-blur-sm p-4">
      <h2 className="text-md tracking-wider uppercase text-vdcRed font-semibold">
        {champions.length > 1 ? "Champions" : "Champion"}
      </h2>
      {champions.length === 0 ? (
        <h1 className="text-sm text-gray-600 dark:text-gray-300">
          No champion crowned yet.
        </h1>
      ) : (
        <div className="flex flex-1 flex-col gap-2">
          {champions.map((champion) => (
            <ChampionRow
              key={champion.tier}
              champion={champion}
              showTierDots={showTierDots}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ChampionRow({
  champion,
  showTierDots,
}: {
  champion: ChampionSummary;
  showTierDots: boolean;
}) {
  const tierColor = TIER_HEX_COLOR_MAP[champion.tier];

  return (
    <Link
      href={`/franchises/${champion.franchiseSlug}`}
      className="flex flex-1 items-center gap-3 rounded-md bg-slate-100/60 dark:bg-vdcBlack/60 backdrop-blur-[1px] px-3 py-2 hover:cursor-pointer hover:brightness-95"
    >
      {showTierDots && (
        <span
          className="size-2.5 flex-none rounded-full"
          style={{ backgroundColor: tierColor }}
        />
      )}
      <TeamLogo logo={champion.teamLogo} teamName={champion.teamName} />
      <div className="flex flex-col">
        <h1 className="font-bold text-vdcBlack dark:text-vdcWhite">
          {champion.teamName}
        </h1>
        <h2
          className="text-xs uppercase tracking-wider font-semibold"
          style={{ color: tierColor }}
        >
          {champion.tier} · Seed {champion.seed}
        </h2>
      </div>
    </Link>
  );
}
