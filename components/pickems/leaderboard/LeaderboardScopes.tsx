"use client";

import Link from "next/link";
import { type CSSProperties } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tier } from "@prisma/client";
import { TIER_HEX_COLOR_MAP, TIERS_LIST } from "@/lib/common/constants/tiers";
import type { GroupSummary } from "@/lib/queries/pickems/getGroups";
import ListBox from "@/components/tabs/DropDown";

type Props = {
  scope: string;
  view: string;
  groups: GroupSummary[];
};

const PILL_BASE =
  "rounded-full border-[1.5px] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors hover:cursor-pointer";

// Tier-agnostic pills (Global, groups, Overall) use the brand red accent.
const RED_ACTIVE = `${PILL_BASE} border-vdcRed bg-vdcRed text-white`;
const RED_INACTIVE = `${PILL_BASE} border-gray-300 text-vdcGrey hover:border-vdcRed hover:text-vdcRed dark:border-gray-600 dark:text-gray-400`;

// Tier pills mirror PickemTierTabs: accent border + hover fill via --tier-accent.
const TIER_BASE = `${PILL_BASE} border-[var(--tier-accent)]`;
const TIER_ACTIVE = "bg-[var(--tier-accent)] text-white";
const TIER_INACTIVE =
  "text-[var(--tier-accent)] hover:bg-[var(--tier-accent)] hover:text-white";

const VIEW_MENU = [
  { query: "overall", name: "Overall" },
  ...TIERS_LIST.map((tier) => ({ query: tier.toLowerCase(), name: tier })),
];

export default function LeaderboardScopes({ scope, view, groups }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const navigate = (key: "scope" | "view", value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const scopeMenu = [
    { query: "global", name: "Global" },
    { query: "groups", name: "Group Ranking" },
    ...groups.map((group) => ({
      query: `group:${group.id}`,
      name: group.name,
    })),
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:hidden">
        <ListBox
          params="scope"
          menuElements={scopeMenu}
          defaultDropDownQuery="global"
        />
        <ListBox
          params="view"
          menuElements={VIEW_MENU}
          defaultDropDownQuery="overall"
        />
        <Link
          href="/pickems/groups"
          className={`${RED_INACTIVE} self-start border-dashed`}
        >
          + Join / create group
        </Link>
      </div>

      <div className="hidden flex-col gap-3 sm:flex">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => navigate("scope", "global")}
            className={scope === "global" ? RED_ACTIVE : RED_INACTIVE}
          >
            <h1>Global</h1>
          </button>
          <button
            type="button"
            onClick={() => navigate("scope", "groups")}
            className={scope === "groups" ? RED_ACTIVE : RED_INACTIVE}
          >
            <h1>Group Ranking</h1>
          </button>
          {groups.map((group) => {
            const key = `group:${group.id}`;
            return (
              <button
                key={group.id}
                type="button"
                onClick={() => navigate("scope", key)}
                className={scope === key ? RED_ACTIVE : RED_INACTIVE}
              >
                {group.name}
              </button>
            );
          })}
          <Link
            href="/pickems/groups"
            className={`${RED_INACTIVE} border-dashed`}
          >
            <h1>+ Join / create group</h1>
          </Link>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => navigate("view", "overall")}
            className={view === "overall" ? RED_ACTIVE : RED_INACTIVE}
          >
            <h1>Overall</h1>
          </button>
          {TIERS_LIST.map((tier: Tier) => {
            const slug = tier.toLowerCase();
            const isActive = view === slug;
            const accentVar = {
              "--tier-accent": TIER_HEX_COLOR_MAP[tier],
            } as CSSProperties;
            return (
              <button
                key={tier}
                type="button"
                onClick={() => navigate("view", slug)}
                className={`${TIER_BASE} ${isActive ? TIER_ACTIVE : TIER_INACTIVE}`}
                style={accentVar}
              >
                {slug}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
