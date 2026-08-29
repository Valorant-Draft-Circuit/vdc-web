import Link from "next/link";
import type { RankedTier } from "@/lib/common/constants/tiers";
import { TIER_HEX_COLOR_MAP } from "@/lib/common/constants/tiers";
import type { LeaderRow } from "@/lib/queries/pickems/getLeaderboard";
import { formatPoints } from "@/lib/pickems/format";
import PlayerAvatar from "@/components/theme/PlayerAvatar";

export type TierLeader = {
  tier: RankedTier;
  leader: LeaderRow | null;
};

type Props = {
  leaders: TierLeader[];
  season: number;
};

const CARD_CLASS =
  "flex flex-col gap-2 rounded-md border border-black/5 border-t-2 bg-vdcWhite/40 p-3 backdrop-blur-sm dark:border-white/10 dark:bg-vdcBlack/40";

export default function TierLeadersStrip({ leaders, season }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-md font-bold uppercase tracking-wider text-vdcRed">
        Tier Leaders
      </h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {leaders.map(({ tier, leader }) => {
          const accent = TIER_HEX_COLOR_MAP[tier];
          if (leader === null) {
            return (
              <div
                key={tier}
                className={CARD_CLASS}
                style={{ borderTopColor: accent }}
              >
                <h2
                  className="text-[10px] font-extrabold uppercase tracking-wide"
                  style={{ color: accent }}
                >
                  {tier}
                </h2>
                <h3 className="py-1 text-sm text-vdcGrey dark:text-gray-400">
                  No picks yet
                </h3>
              </div>
            );
          }
          return (
            <Link
              key={tier}
              href={`/pickems/picks/${leader.userId}?tier=${tier.toLowerCase()}&season=${season}`}
              className={`${CARD_CLASS} transition-colors hover:bg-black/5 dark:hover:bg-white/5`}
              style={{ borderTopColor: accent }}
            >
              <h2
                className="text-[10px] font-extrabold uppercase tracking-wide"
                style={{ color: accent }}
              >
                {tier}
              </h2>
              <div className="flex items-center gap-2">
                <PlayerAvatar
                  name={leader.name}
                  image={leader.image}
                  fallbackColor={accent}
                  sizeClass="size-6"
                  pixels={24}
                  textClass="text-[10px]"
                  userId={leader.userId}
                />
                <h3 className="truncate text-sm font-semibold">
                  {leader.name}
                </h3>
              </div>
              <h3 className="text-xs font-bold tabular-nums text-vdcGrey dark:text-gray-400">
                {formatPoints(leader.points)} pts
              </h3>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
