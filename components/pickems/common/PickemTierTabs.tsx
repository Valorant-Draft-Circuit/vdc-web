import Link from "next/link";
import { type CSSProperties } from "react";
import { Tier } from "@prisma/client";
import { TIER_HEX_COLOR_MAP, TIERS_LIST } from "@/lib/common/constants/tiers";
import ListBox from "@/components/tabs/DropDown";

type Props = {
  activeTier: Tier;
  season: number;
  basePath: string;
};

const TAB_BASE =
  "rounded-full border-[1.5px] border-[var(--tier-accent)] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors";
const TAB_ACTIVE = "bg-[var(--tier-accent)] text-white";
const TAB_INACTIVE =
  "text-[var(--tier-accent)] hover:bg-[var(--tier-accent)] hover:text-white";

const TIER_MENU = TIERS_LIST.map((tier) => ({
  query: tier.toLowerCase(),
  name: tier,
}));

export default function PickemTierTabs({
  activeTier,
  season,
  basePath,
}: Props) {
  return (
    <>
      <div className="sm:hidden">
        <ListBox
          params="tier"
          menuElements={TIER_MENU}
          defaultDropDownQuery={activeTier.toLowerCase()}
        />
      </div>

      <div className="hidden flex-wrap gap-1.5 sm:flex">
        {TIERS_LIST.map((tier) => {
          const isActive = tier === activeTier;
          const accentVar = {
            "--tier-accent": TIER_HEX_COLOR_MAP[tier],
          } as CSSProperties;
          return (
            <Link
              key={tier}
              href={`${basePath}?tier=${tier.toLowerCase()}&season=${season}`}
              className={`${TAB_BASE} ${isActive ? TAB_ACTIVE : TAB_INACTIVE}`}
              style={accentVar}
            >
              <h1>{tier}</h1>
            </Link>
          );
        })}
      </div>
    </>
  );
}
