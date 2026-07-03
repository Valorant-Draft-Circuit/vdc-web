"use client";

import { useState } from "react";

import ActiveSanctionsPanel from "./ActiveSanctionsPanel";
import ModerationKpiRow, {
  ModerationSummary,
  SanctionFilter,
} from "./ModerationKpiRow";
import { SanctionEntry } from "@/lib/queries/staff/moderation";

export default function SanctionsSection({
  summary,
  sanctions,
  bans,
  children,
}: {
  summary: ModerationSummary;
  sanctions: SanctionEntry[];
  bans: SanctionEntry[];
  children: React.ReactNode;
}) {
  const [filter, setFilter] = useState<SanctionFilter>(null);

  function toggleFilter(type: Exclude<SanctionFilter, null>) {
    setFilter((prev) => (prev === type ? null : type));
  }

  const showingBans = filter === "BAN";
  const visibleSanctions = showingBans
    ? bans
    : filter
      ? sanctions.filter((sanction) => sanction.type === filter)
      : sanctions;

  return (
    <div className="flex flex-col gap-5">
      <ModerationKpiRow
        summary={summary}
        filter={filter}
        onToggleFilter={toggleFilter}
      />
      {children}
      <ActiveSanctionsPanel
        key={filter ?? "ALL"}
        sanctions={visibleSanctions}
        showingBans={showingBans}
      />
    </div>
  );
}
