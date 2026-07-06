import Link from "next/link";
import TeamLogo from "@/components/home/recap/TeamLogo";
import {
  TIER_HEX_COLOR_MAP,
  TIERS_LIST,
} from "@/lib/common/constants/tiers";
import { ActiveSub, getActiveSubs } from "@/lib/queries/staff/FM";

export default async function ActiveSubsPanel() {
  const activeSubs = await getActiveSubs();

  const subsByTier = TIERS_LIST.map((tier) => ({
    tier,
    subs: activeSubs.filter((sub) => sub.tier === tier),
  })).filter((group) => group.subs.length > 0);

  return (
    <section>
      <h1 className="text-lg lg:text-xl py-2">Currently Subbed In</h1>
      <div className="rounded-md bg-slate-100 dark:bg-vdcGrey p-4 sm:p-5">
        {subsByTier.length === 0 ? (
          <h3 className="text-sm text-gray-500 dark:text-gray-400">
            No players currently subbed in.
          </h3>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {subsByTier.map((group) => (
              <div
                key={group.tier}
                className="rounded-md bg-vdcWhite/40 dark:bg-vdcBlack/40 backdrop-blur-sm p-3 border-t-2"
                style={{ borderTopColor: TIER_HEX_COLOR_MAP[group.tier] }}
              >
                <h2
                  className="text-[10px] tracking-wider uppercase font-semibold mb-1"
                  style={{ color: TIER_HEX_COLOR_MAP[group.tier] }}
                >
                  {group.tier} ({group.subs.length})
                </h2>
                <ul className="flex flex-col">
                  {group.subs.map((sub) => (
                    <ActiveSubRow key={sub.userID} sub={sub} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ActiveSubRow({ sub }: { sub: ActiveSub }) {
  return (
    <li className="flex items-center gap-2 py-2 text-xs border-b border-vdcBlack/5 dark:border-vdcWhite/5 last:border-b-0">
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
      <div className="ml-auto flex-none">
        {sub.franchiseSlug ? (
          <Link
            href={`/franchises/${sub.franchiseSlug}?team=${sub.tier.toLowerCase()}`}
            className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-vdcRed"
          >
            <TeamLogo logo={sub.teamLogo} teamName={sub.teamName} />
            <h3 className="text-[10px]">{sub.teamName}</h3>
          </Link>
        ) : (
          <div className="flex items-center gap-1">
            <TeamLogo logo={sub.teamLogo} teamName={sub.teamName} />
            <h3 className="text-[10px] text-gray-600 dark:text-gray-400">
              {sub.teamName}
            </h3>
          </div>
        )}
      </div>
      {sub.sinceLabel && (
        <h3 className="text-[9px] text-gray-500 flex-none">{sub.sinceLabel}</h3>
      )}
    </li>
  );
}
