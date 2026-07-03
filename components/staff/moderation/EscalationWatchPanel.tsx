"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";

import ShowMoreButton from "./ShowMoreButton";
import { VDC_BLUE } from "@/lib/common/constants/colors";
import {
  MOD_LOG_TYPE_HEX_COLOR_MAP,
  MOD_LOG_TYPE_ORDER,
} from "@/lib/common/constants/modLogs";
import {
  ESCALATION_WARNING_THRESHOLD,
  EscalationEntry,
  EscalationFilter,
} from "@/lib/queries/staff/moderation";

const PILL_BASE =
  "rounded-full border-[1.5px] border-[var(--type-accent)] px-3 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors hover:cursor-pointer";
const PILL_ACTIVE = "bg-[var(--type-accent)] text-white";
const PILL_INACTIVE =
  "text-[var(--type-accent)] hover:bg-[var(--type-accent)] hover:text-white";

const ESCALATION_TYPES = MOD_LOG_TYPE_ORDER.filter((type) => type !== "NOTE");

const FILTER_ORDER: EscalationFilter[] = ["TOTAL", ...ESCALATION_TYPES];

const PAGE_SIZE = 5;

function filterAccent(filter: EscalationFilter): string {
  return filter === "TOTAL" ? VDC_BLUE : MOD_LOG_TYPE_HEX_COLOR_MAP[filter];
}

export default function EscalationWatchPanel({
  escalations,
}: {
  escalations: EscalationEntry[];
}) {
  const [activeFilter, setActiveFilter] = useState<EscalationFilter>("TOTAL");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  function selectFilter(filter: EscalationFilter) {
    setActiveFilter(filter);
    setVisibleCount(PAGE_SIZE);
  }

  const matchingEscalations = escalations.filter(
    (escalation) => escalation.type === activeFilter,
  );
  const visibleEscalations = matchingEscalations.slice(0, visibleCount);
  const remaining = matchingEscalations.length - visibleCount;
  const activeFilterLabel =
    activeFilter === "TOTAL"
      ? "total mod action"
      : activeFilter.replaceAll("_", " ").toLowerCase();

  return (
    <div className="rounded-xl bg-white p-5 shadow-xs dark:bg-vdcGrey">
      <h2 className="text-[10px] uppercase tracking-wider text-vdcRed">
        {ESCALATION_WARNING_THRESHOLD}+ mod actions all-time
      </h2>
      <h1 className="text-xl font-semibold text-vdcBlack dark:text-white">
        Escalation Watch
      </h1>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {FILTER_ORDER.map((filter) => {
          const accentVar = {
            "--type-accent": filterAccent(filter),
          } as CSSProperties;
          return (
            <button
              key={filter}
              onClick={() => selectFilter(filter)}
              style={accentVar}
              className={`${PILL_BASE} ${
                activeFilter === filter ? PILL_ACTIVE : PILL_INACTIVE
              }`}
            >
              <h2>{filter.replaceAll("_", " ")}</h2>
            </button>
          );
        })}
      </div>

      {visibleEscalations.length === 0 ? (
        <h2 className="mt-3 text-sm text-gray-400">
          No players with {ESCALATION_WARNING_THRESHOLD}+ {activeFilterLabel}{" "}
          logs.
        </h2>
      ) : (
        <ul className="mt-3 divide-y divide-gray-100 text-sm dark:divide-gray-700">
          {visibleEscalations.map((escalation) => (
            <li
              key={escalation.discordID}
              className="flex items-center justify-between gap-3 py-2"
            >
              {escalation.playerIgn ? (
                <Link
                  href={`/player/${encodeURIComponent(escalation.playerIgn)}`}
                  className="truncate text-vdcBlue hover:opacity-80"
                >
                  <h2>{escalation.playerName}</h2>
                </Link>
              ) : (
                <h2 className="truncate">{escalation.playerName}</h2>
              )}
              <h2 className="shrink-0 text-xs text-gray-400">
                {escalation.logCount}
                {activeFilter === "TOTAL"
                  ? " mod actions"
                  : `x ${activeFilter.replaceAll("_", " ")}`}
              </h2>
            </li>
          ))}
        </ul>
      )}

      <ShowMoreButton
        remaining={remaining}
        pageSize={PAGE_SIZE}
        onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
      />
    </div>
  );
}
