"use client";

import type { Slate } from "@/lib/queries/pickems/getSlate";
import type { Score } from "@/lib/pickems/picks";
import { LockClosedIcon } from "@heroicons/react/16/solid";
import { lockBadgeShort } from "@/lib/pickems/format";
import TeamMark from "@/components/pickems/common/TeamMark";
import MatchPills from "./MatchPills";

type Props = {
  slates: Slate[];
  picks: Map<number, Score>;
  accent: string;
  now: Date;
  onPick: (matchId: number, score: Score) => void;
};

export default function CompactGrid({
  slates,
  picks,
  accent,
  now,
  onPick,
}: Props) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3">
      {slates.map((slate) => {
        const locked = slate.lockTime <= now;
        const pickedCount = slate.matches.filter((match) =>
          picks.has(match.matchId),
        ).length;
        const isComplete =
          pickedCount === slate.matches.length && slate.matches.length > 0;
        const cardStyle = isComplete
          ? { borderColor: `${accent}66` }
          : undefined;
        const countStyle = isComplete
          ? { color: accent, fontWeight: 700 }
          : undefined;

        return (
          <div
            key={slate.matchDay}
            className="flex flex-col rounded-2xl border border-black/10 bg-gray-100 p-4 dark:border-white/10 dark:bg-vdcGrey"
            style={cardStyle}
          >
            <div className="mb-2.5 flex items-start justify-between">
              <div>
                <h2 className="text-sm font-extrabold">
                  Match Day {slate.matchDay}
                </h2>
                <p className="text-[11px] font-normal text-vdcGrey dark:text-gray-400">
                  {slate.dateLabel}
                </p>
              </div>
              <div className="flex flex-col items-end gap-[3px] text-[10px] text-vdcGrey dark:text-gray-400">
                <h2 className="inline-flex items-center gap-1 rounded-full bg-black/10 px-2 py-0.5 dark:bg-black/30">
                  <LockClosedIcon className="size-3" />
                  {lockBadgeShort(slate.lockTime, now)}
                </h2>
                <p style={countStyle}>
                  {pickedCount}/{slate.matches.length}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              {slate.matches.map((match) => {
                const homeLabel = match.home?.name ?? "TBD";
                const awayLabel = match.away?.name ?? "TBD";
                return (
                  <div
                    key={match.matchId}
                    className="grid grid-cols-[1fr_auto_1fr] items-center gap-2.5"
                  >
                    <div className="flex justify-end">
                      <TeamMark
                        logo={match.home?.logo ?? null}
                        slug={match.home?.slug ?? homeLabel}
                        name={homeLabel}
                        size="size-9"
                      />
                    </div>
                    <MatchPills
                      matchType={match.matchType}
                      value={picks.get(match.matchId)}
                      locked={locked}
                      accent={accent}
                      onPick={(score) => onPick(match.matchId, score)}
                    />
                    <div className="flex justify-start">
                      <TeamMark
                        logo={match.away?.logo ?? null}
                        slug={match.away?.slug ?? awayLabel}
                        name={awayLabel}
                        size="size-9"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
