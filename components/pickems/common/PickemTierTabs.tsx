import Link from "next/link";
import { type CSSProperties } from "react";
import { Tier } from "@prisma/client";
import { TIER_HEX_COLOR_MAP, TIERS_LIST } from "@/lib/common/constants/tiers";
import { VDC_RED } from "@/lib/common/constants/colors";
import ListBox from "@/components/tabs/DropDown";

type Props = {
  activeTier: Tier | null;
  season: number;
  basePath: string;
  section?: string;
  includeOverview?: boolean;
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

const OVERVIEW_MENU_ENTRY = { query: "overview", name: "OVERVIEW" };

function TabPill({
  label,
  href,
  isActive,
  accent,
}: {
  label: string;
  href: string;
  isActive: boolean;
  accent: string;
}) {
  const accentVar = { "--tier-accent": accent } as CSSProperties;
  return (
    <Link
      href={href}
      className={`${TAB_BASE} ${isActive ? TAB_ACTIVE : TAB_INACTIVE}`}
      style={accentVar}
    >
      <h1>{label}</h1>
    </Link>
  );
}

export default function PickemTierTabs({
  activeTier,
  season,
  basePath,
  section,
  includeOverview,
}: Props) {
  const sectionQuery = section ? `&section=${section}` : "";
  const menuElements = includeOverview
    ? [OVERVIEW_MENU_ENTRY, ...TIER_MENU]
    : TIER_MENU;
  return (
    <>
      <div className="sm:hidden">
        <ListBox
          params="tier"
          menuElements={menuElements}
          defaultDropDownQuery={activeTier?.toLowerCase() ?? "overview"}
        />
      </div>

      <div className="hidden flex-wrap gap-1.5 sm:flex">
        {includeOverview && (
          <TabPill
            label="Overview"
            href={`${basePath}?tier=overview&season=${season}${sectionQuery}`}
            isActive={activeTier === null}
            accent={VDC_RED}
          />
        )}
        {TIERS_LIST.map((tier) => (
          <TabPill
            key={tier}
            label={tier}
            href={`${basePath}?tier=${tier.toLowerCase()}&season=${season}${sectionQuery}`}
            isActive={tier === activeTier}
            accent={TIER_HEX_COLOR_MAP[tier]}
          />
        ))}
      </div>
    </>
  );
}
