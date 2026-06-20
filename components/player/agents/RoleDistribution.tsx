import Image from "next/image";
import {
  ROLE_HEX_COLOR_MAP,
  ROLE_ORDER,
  type RoleName,
} from "@/lib/common/constants";
import type { PlayerAgentBreakdown } from "@/lib/queries/stats/getPlayerAgentBreakdown";

type Props = { breakdown: PlayerAgentBreakdown[] };

export default function RoleDistribution({ breakdown }: Props) {
  const totals: Record<RoleName, number> = {
    DUELIST: 0,
    CONTROLLER: 0,
    SENTINEL: 0,
    INITIATOR: 0,
  };
  const iconUrls: Record<RoleName, string | null> = {
    DUELIST: null,
    CONTROLLER: null,
    SENTINEL: null,
    INITIATOR: null,
  };
  let known = 0;
  for (const entry of breakdown) {
    if (!entry.catalog?.role) continue;
    const role = entry.catalog.role.name;
    totals[role] += entry.gamesPlayed;
    known += entry.gamesPlayed;
    if (!iconUrls[role]) iconUrls[role] = entry.catalog.role.iconUrl;
  }
  if (known === 0) return null;

  return (
    <div className="bg-slate-100 dark:bg-vdcGrey rounded-md p-3 mx-2 xl:mx-0">
      <h2 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
        Roles played
      </h2>
      <div className="flex h-2 rounded overflow-hidden mb-2">
        {ROLE_ORDER.map((role) => {
          const pct = (totals[role] / known) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={role}
              style={{ width: `${pct}%`, background: ROLE_HEX_COLOR_MAP[role] }}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
        {ROLE_ORDER.map((role) => {
          const pct = (totals[role] / known) * 100;
          if (pct === 0) return null;
          const iconUrl = iconUrls[role];
          return (
            <span key={role} className="flex items-center gap-1">
              {iconUrl ? (
                <Image
                  src={iconUrl}
                  alt={role}
                  width={16}
                  height={16}
                  className="w-4 h-4 invert dark:invert-0"
                />
              ) : (
                <span
                  className="inline-block w-2 h-2 rounded-sm"
                  style={{ background: ROLE_HEX_COLOR_MAP[role] }}
                />
              )}
              <h1 className="text-vdcBlack dark:text-vdcWhite">
                {pct.toFixed(0)}%
              </h1>
            </span>
          );
        })}
      </div>
    </div>
  );
}
