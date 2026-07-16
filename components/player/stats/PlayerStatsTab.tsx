"use client";

import { useMemo, useState } from "react";
import { Tier } from "@prisma/client";
import type { RoleName } from "@/lib/common/constants/roles";
import {
  aggregateStats,
  averageTrendMetrics,
  buildInsights,
  derivePrimaryRole,
  filterPeers,
  type ComparableStat,
  type PeerRow,
  type RoleFilter,
  type StatRow,
  type TierFilter,
} from "@/lib/common/indepth";
import ScopeToggle, { type Scope } from "./ScopeToggle";
import ScoutInsights from "./ScoutInsights";
import ProfileRadar from "./ProfileRadar";
import PeerComparison from "./PeerComparison";
import StatsAggregates from "./StatsAggregates";
import StatsTrends from "./StatsTrends";

export default function PlayerStatsTab({
  careerRows,
  selectedSeason,
  seasonPool,
  careerPool,
  selfTier,
}: {
  careerRows: StatRow[];
  selectedSeason: number;
  seasonPool: PeerRow[];
  careerPool: PeerRow[];
  selfTier: Tier | null;
}) {
  const [scope, setScope] = useState<Scope>("season");
  const [stat, setStat] = useState<ComparableStat>("acs");
  const [role, setRole] = useState<RoleFilter | null>(null);
  const [tier, setTier] = useState<TierFilter | null>(null);

  const rows = useMemo(
    () =>
      scope === "season"
        ? careerRows.filter((row) => row.season === selectedSeason)
        : careerRows,
    [scope, careerRows, selectedSeason],
  );

  const pool = scope === "season" ? seasonPool : careerPool;
  const agg = useMemo(() => aggregateStats(rows), [rows]);
  const primaryRole: RoleName | null = useMemo(
    () => derivePrimaryRole(rows),
    [rows],
  );

  const effectiveRole: RoleFilter = role ?? primaryRole ?? "ANY";
  const effectiveTier: TierFilter = tier ?? selfTier ?? "ANY";

  const filteredPeers = useMemo(
    () => filterPeers(pool, { role: effectiveRole, tier: effectiveTier }),
    [pool, effectiveRole, effectiveTier],
  );

  const insights = useMemo(
    () =>
      buildInsights({
        rows,
        agg,
        primaryRole,
        selfTier,
        peers: filteredPeers,
        scope,
      }),
    [rows, agg, primaryRole, selfTier, filteredPeers, scope],
  );

  const tierAverages = useMemo(() => {
    if (!selfTier) return null;
    const tierPeers = filterPeers(pool, { role: "ANY", tier: selfTier });
    return averageTrendMetrics(tierPeers);
  }, [pool, selfTier]);

  if (careerRows.length === 0) {
    return (
      <div className="m-auto text-center py-10">
        <h1 className="text-vdcRed">Player has no available stats!</h1>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col gap-3 px-2 xl:px-0">
        <div className="flex justify-end">
          <ScopeToggle scope={scope} onChange={setScope} />
        </div>
        <h2 className="text-center text-vdcRed py-10">
          No games for this season. Switch to Career.
        </h2>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-md mx-2 xl:mx-0">
      <div className="relative flex flex-col gap-3 p-2 xl:p-4">
        <div className="flex justify-end">
          <ScopeToggle scope={scope} onChange={setScope} />
        </div>

        <ScoutInsights insights={insights} />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
          <ProfileRadar agg={agg} peers={filteredPeers} />
          <PeerComparison
            agg={agg}
            pool={pool}
            primaryRole={primaryRole}
            selfTier={selfTier}
            stat={stat}
            role={effectiveRole}
            tier={effectiveTier}
            onStat={setStat}
            onRole={setRole}
            onTier={setTier}
          />
        </div>

        <StatsAggregates agg={agg} />

        <StatsTrends
          rows={rows}
          showSeasonDividers={scope === "career"}
          tierAverages={tierAverages}
        />
      </div>
    </div>
  );
}

