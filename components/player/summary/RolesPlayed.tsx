import Image from "next/image";
import { getAgentCatalog } from "@/lib/queries/agents/getAgentCatalog";
import { normalizeAgentName } from "@/lib/common/agents";
import {
  ROLE_HEX_COLOR_MAP,
  ROLE_ORDER,
  type RoleName,
} from "@/lib/common/constants/roles";

type RoleTally = { games: number; iconUrl: string | null };

export default async function RolesPlayed({
  stats,
}: {
  stats: ReadonlyArray<{ agent: string }>;
}) {
  const catalog = await getAgentCatalog();
  const roleTally = countRoleGames(stats, catalog);
  const total = ROLE_ORDER.reduce(
    (sum, role) => sum + roleTally[role].games,
    0,
  );
  if (total === 0) return null;

  const rolesByUsage = ROLE_ORDER.filter(
    (role) => roleTally[role].games > 0,
  ).sort((a, b) => roleTally[b].games - roleTally[a].games);

  return (
    <div className="divide-y divide-gray-600 dark:divide-vdcBlack bg-slate-100 dark:bg-vdcGrey overflow-hidden rounded-sm shadow-sm">
      <div className="px-4 py-2 sm:px-6">
        <h1 className="text-sm">Roles</h1>
      </div>
      <div className="px-4 py-3 sm:p-6 flex flex-col gap-2">
        <div className="flex h-2 rounded overflow-hidden">
          {rolesByUsage.map((role) => {
            const pct = (roleTally[role].games / total) * 100;
            return (
              <div
                key={role}
                style={{
                  width: `${pct}%`,
                  background: ROLE_HEX_COLOR_MAP[role],
                }}
              />
            );
          })}
        </div>
        <div className="flex flex-row flex-wrap gap-x-3 gap-y-1 text-xs">
          {rolesByUsage.map((role) => {
            const pct = (roleTally[role].games / total) * 100;
            const iconUrl = roleTally[role].iconUrl;
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
    </div>
  );
}

function countRoleGames(
  stats: ReadonlyArray<{ agent: string }>,
  catalog: Awaited<ReturnType<typeof getAgentCatalog>>,
): Record<RoleName, RoleTally> {
  const roleTally: Record<RoleName, RoleTally> = {
    DUELIST: { games: 0, iconUrl: null },
    CONTROLLER: { games: 0, iconUrl: null },
    SENTINEL: { games: 0, iconUrl: null },
    INITIATOR: { games: 0, iconUrl: null },
  };
  for (const stat of stats) {
    const role = catalog[normalizeAgentName(stat.agent)]?.role;
    if (!role) continue;
    roleTally[role.name].games += 1;
    if (!roleTally[role.name].iconUrl) {
      roleTally[role.name].iconUrl = role.iconUrl;
    }
  }
  return roleTally;
}
