"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { Slate } from "@/lib/queries/pickems/getSlate";
import type { StoredMatchPick } from "@/lib/queries/pickems/getUserPicks";
import type { Score } from "@/lib/pickems/picks";
import { submitMatchPicks } from "@/app/pickems/actions";
import CompactGrid from "./CompactGrid";

type Props = {
  slates: Slate[];
  initialPicks: StoredMatchPick[];
  accent: string;
  canSave: boolean;
};

function seedPicks(initial: StoredMatchPick[]): Map<number, Score> {
  const map = new Map<number, Score>();
  for (const pick of initial) {
    map.set(pick.matchId, { home: pick.homeScore, away: pick.awayScore });
  }
  return map;
}

export default function PickemHubClient({
  slates,
  initialPicks,
  accent,
  canSave,
}: Props) {
  const now = useMemo(() => new Date(), []);
  const [picks, setPicks] = useState<Map<number, Score>>(() =>
    seedPicks(initialPicks),
  );
  const [dirty, setDirty] = useState<Set<number>>(() => new Set());
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const upcomingSlates = slates.filter((slate) => slate.lockTime > now);
  const upcomingMatchCount = upcomingSlates.reduce(
    (sum, slate) => sum + slate.matches.length,
    0,
  );
  const upcomingPickedCount = upcomingSlates.reduce(
    (sum, slate) =>
      sum + slate.matches.filter((match) => picks.has(match.matchId)).length,
    0,
  );

  const handlePick = (matchId: number, score: Score) => {
    setPicks((prev) => {
      const next = new Map(prev);
      next.set(matchId, score);
      return next;
    });
    setDirty((prev) => new Set(prev).add(matchId));
    setMessage(null);
  };

  const handleSave = async () => {
    if (dirty.size === 0) {
      return;
    }
    setSaving(true);
    setMessage(null);
    const changed = [...dirty]
      .map((matchId) => {
        const score = picks.get(matchId);
        return score
          ? { matchId, homeScore: score.home, awayScore: score.away }
          : null;
      })
      .filter(
        (p): p is { matchId: number; homeScore: number; awayScore: number } =>
          p !== null,
      );

    const result = await submitMatchPicks({ picks: changed });
    setSaving(false);
    if (result.ok) {
      setDirty(new Set());
      setMessage("Picks saved.");
    } else {
      setMessage(result.error);
    }
  };

  const saveDisabled = saving || !canSave || dirty.size === 0;

  function saveButtonText(): string {
    if (!canSave) {
      return "Log in to save";
    }
    if (saving) {
      return "Saving...";
    }
    return "Save all";
  }

  const footerNote = `${upcomingPickedCount} / ${upcomingMatchCount} upcoming matches picked.`;

  let slateView: ReactNode;
  if (slates.length === 0) {
    slateView = (
      <p className="py-10 text-center text-sm text-vdcGrey dark:text-gray-400">
        No slates are scheduled for this tier yet.
      </p>
    );
  } else {
    slateView = (
      <CompactGrid
        slates={slates}
        picks={picks}
        accent={accent}
        now={now}
        onPick={handlePick}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {slateView}

      {slates.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <p className="max-w-[58%] text-[11px] text-vdcGrey dark:text-gray-400">
            {footerNote}
          </p>
          <div className="flex items-center gap-3">
            {message && (
              <p className="text-xs font-semibold text-vdcRed">{message}</p>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={saveDisabled}
              className="rounded-lg bg-vdcRed px-5 py-2 text-sm font-bold uppercase text-white disabled:opacity-50"
            >
              {saveButtonText()}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
