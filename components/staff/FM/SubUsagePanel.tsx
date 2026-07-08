import Link from "next/link";
import TeamLogo from "@/components/home/recap/TeamLogo";
import { TIER_HEX_COLOR_MAP } from "@/lib/common/constants/tiers";
import { getSeasonSubUsage, SubUsageRow, TierSubUsage } from "@/lib/queries/staff/FM";
import { Tier } from "@prisma/client";

export default async function SubUsagePanel() {
  const tierSubUsage = await getSeasonSubUsage();

  return (
    <section>
      <h1 className="text-lg lg:text-xl py-2">Sub Usage</h1>
      <div className="rounded-md bg-slate-100 dark:bg-vdcGrey p-4 sm:p-5">
        {tierSubUsage.length === 0 ? (
          <h2 className="text-sm text-gray-500 dark:text-gray-400">
            No sub appearances this season.
          </h2>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {tierSubUsage.map((group) => (
              <TierSubUsageCard key={group.tier} group={group} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function TierSubUsageCard({ group }: { group: TierSubUsage }) {
  return (
    <div
      className="rounded-md bg-vdcWhite/40 dark:bg-vdcBlack/40 backdrop-blur-sm p-3 border-t-2"
      style={{ borderTopColor: TIER_HEX_COLOR_MAP[group.tier] }}
    >
      <h2
        className="text-[10px] tracking-wider uppercase font-semibold mb-1"
        style={{ color: TIER_HEX_COLOR_MAP[group.tier] }}
      >
        {group.tier} ({group.subs.length})
      </h2>
      <ul className="flex flex-col max-h-72 overflow-y-auto">
        {group.subs.map((sub) => (
          <SubUsageRowItem key={sub.userID} sub={sub} tier={group.tier} />
        ))}
      </ul>
    </div>
  );
}

function SubUsageRowItem({ sub, tier }: { sub: SubUsageRow; tier: Tier }) {
  return (
    <li className="flex flex-col gap-1 py-2 text-xs border-b border-vdcBlack/5 dark:border-vdcWhite/5 last:border-b-0">
      <div className="flex items-center gap-2">
        <h3 className="truncate">
          {sub.playerIgn ? (
            <Link
              href={`/player/${encodeURIComponent(sub.playerIgn)}`}
              className="hover:text-vdcRed"
            >
              {sub.name}
            </Link>
          ) : (
            sub.name
          )}
        </h3>
        {sub.isCurrentlySubbed && (
          <h3 className="rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wider bg-vdcBlue/20 text-vdcBlue flex-none">
            SUBBED IN
          </h3>
        )}
        <h3 className="ml-auto flex-none text-[10px] text-gray-600 dark:text-gray-400">
          {sub.matchDayLabels.length}{" "}
          {sub.matchDayLabels.length === 1 ? "MD" : "MDs"}
        </h3>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 flex-none">
          {sub.teams.map((team) => (
            <Link
              key={team.franchiseSlug + team.name}
              href={`/franchises/${team.franchiseSlug}?team=${tier.toLowerCase()}`}
              className="hover:opacity-80"
            >
              <TeamLogo logo={team.logo} teamName={team.name} />
            </Link>
          ))}
        </div>
        <h3 className="ml-auto text-[10px] text-gray-500 truncate">
          {sub.matchDayLabels.join(" · ")}
        </h3>
      </div>
    </li>
  );
}
