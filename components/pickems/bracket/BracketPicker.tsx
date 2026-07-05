"use client";

import { Fragment, useMemo, useState } from "react";
import { MatchType, Tier } from "@prisma/client";
import type { Bracket, BracketTeam } from "@/lib/common/bracket";
import {
  BRACKET_WINNER_POINTS,
  maxLoserGames,
  pickableSlotCount,
  realBracketResults,
  scoreBracketPicks,
  slotCandidates,
  type BracketPick,
} from "@/lib/pickems/bracket";
import BracketConnectors from "@/components/playoffs/BracketConnectors";
import BracketCard, { ByeCard, type CardSide } from "./BracketCard";
import { submitBracketPicks } from "@/app/pickems/actions";

type CardInput = { top: string; bottom: string };

type Props = {
  bracket: Bracket;
  initial: BracketPick[];
  tier: Tier;
  locked: boolean;
  accent: string;
  canSave: boolean;
};

function clinch(matchType: MatchType): number {
  return matchType === MatchType.BO5 ? 3 : 2;
}

function legalScorelinesMessage(matchType: MatchType): string {
  const winScore = clinch(matchType);
  const scorelines = Array.from(
    { length: maxLoserGames(matchType) + 1 },
    (_, loserGames) => `${winScore}-${loserGames}`,
  );
  return `Score must be ${scorelines.join(" or ")}`;
}

function deriveInitialInputs(
  bracket: Bracket,
  initial: BracketPick[],
): Map<string, CardInput> {
  const totalRounds = bracket.rounds.length;
  const inputs = new Map<string, CardInput>();
  const pickByKey = new Map<string, BracketPick>();
  for (const pick of initial) {
    pickByKey.set(`${totalRounds - 1 - pick.round}:${pick.slot}`, pick);
  }
  const pickedWinner = (roundIndex: number, slotIndex: number) =>
    pickByKey.get(`${roundIndex}:${slotIndex}`)?.teamId;

  for (let roundIndex = 0; roundIndex < totalRounds; roundIndex++) {
    const round = bracket.rounds[roundIndex];
    const winScore = clinch(round.matchType);
    for (let slotIndex = 0; slotIndex < round.slots.length; slotIndex++) {
      const key = `${roundIndex}:${slotIndex}`;
      const pick = pickByKey.get(key);
      if (!pick || round.slots[slotIndex].kind === "bye") {
        continue;
      }
      const ids = slotCandidates(bracket, roundIndex, slotIndex, pickedWinner);
      const winnerIsTop = ids[0] === pick.teamId;
      inputs.set(key, {
        top: winnerIsTop ? String(winScore) : String(pick.loserGames),
        bottom: winnerIsTop ? String(pick.loserGames) : String(winScore),
      });
    }
  }
  return inputs;
}

export default function BracketPicker({
  bracket,
  initial,
  tier,
  locked,
  accent,
  canSave,
}: Props) {
  const totalRounds = bracket.rounds.length;
  const fromEnd = (roundIndex: number) => totalRounds - 1 - roundIndex;

  const teamById = useMemo(() => {
    const map = new Map<number, BracketTeam>();
    for (const round of bracket.rounds) {
      for (const slot of round.slots) {
        if (slot.kind === "bye" && slot.team) {
          map.set(slot.team.id, slot.team);
        }
        if (slot.kind === "series") {
          map.set(slot.home.team.id, slot.home.team);
          map.set(slot.away.team.id, slot.away.team);
        }
      }
    }
    return map;
  }, [bracket]);

  const [inputs, setInputs] = useState<Map<string, CardInput>>(() =>
    deriveInitialInputs(bracket, initial),
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const { picks, candidatesByKey, errorsByKey } = useMemo(() => {
    const derived = new Map<string, BracketPick>();
    const candidates = new Map<string, (BracketTeam | null)[]>();
    const errors = new Map<string, string>();
    const pickedWinner = (roundIndex: number, slotIndex: number) =>
      derived.get(`${roundIndex}:${slotIndex}`)?.teamId;

    for (let roundIndex = 0; roundIndex < totalRounds; roundIndex++) {
      const round = bracket.rounds[roundIndex];
      const maxLoser = maxLoserGames(round.matchType);
      const winScore = clinch(round.matchType);
      for (let slotIndex = 0; slotIndex < round.slots.length; slotIndex++) {
        if (round.slots[slotIndex].kind === "bye") {
          continue;
        }
        const key = `${roundIndex}:${slotIndex}`;
        const ids = slotCandidates(bracket, roundIndex, slotIndex, pickedWinner);
        const sides: (BracketTeam | null)[] = [
          ids[0] !== undefined ? (teamById.get(ids[0]) ?? null) : null,
          ids[1] !== undefined ? (teamById.get(ids[1]) ?? null) : null,
        ];
        candidates.set(key, sides);

        const input = inputs.get(key);
        if (!input || sides[0] === null || sides[1] === null) {
          continue;
        }
        if (input.top === "" || input.bottom === "") {
          continue;
        }
        const top = Number(input.top);
        const bottom = Number(input.bottom);
        const winnerIsTop = top === winScore && bottom >= 0 && bottom <= maxLoser;
        const winnerIsBottom =
          bottom === winScore && top >= 0 && top <= maxLoser;
        if (winnerIsTop === winnerIsBottom) {
          errors.set(key, legalScorelinesMessage(round.matchType));
          continue;
        }
        const winner = winnerIsTop ? sides[0] : sides[1];
        const loserGames = winnerIsTop ? bottom : top;
        derived.set(key, {
          round: totalRounds - 1 - roundIndex,
          slot: slotIndex,
          teamId: winner.id,
          loserGames,
        });
      }
    }
    return { picks: derived, candidatesByKey: candidates, errorsByKey: errors };
  }, [bracket, inputs, teamById, totalRounds]);

  const results = useMemo(() => realBracketResults(bracket), [bracket]);
  const earned = useMemo(
    () => (locked ? scoreBracketPicks([...picks.values()], results) : null),
    [locked, picks, results],
  );

  const required = pickableSlotCount(bracket);
  const remaining = required - picks.size;

  const setScore = (key: string, side: "top" | "bottom", value: string) => {
    setInputs((previous) => {
      const next = new Map(previous);
      const current = next.get(key) ?? { top: "", bottom: "" };
      next.set(key, { ...current, [side]: value });
      return next;
    });
    setMessage(null);
  };

  const handleSave = async () => {
    if (remaining !== 0) {
      return;
    }
    setSaving(true);
    setMessage(null);
    const result = await submitBracketPicks({
      tier,
      picks: [...picks.values()],
    });
    setSaving(false);
    setMessage(result.ok ? "Bracket saved." : result.error);
  };

  const saveDisabled = locked || saving || !canSave || remaining !== 0;

  function saveLabel(): string {
    if (!canSave) {
      return "Log in to save";
    }
    if (saving) {
      return "SAVING...";
    }
    if (remaining > 0) {
      return `${remaining} PICKS LEFT`;
    }
    return "SAVE BRACKET";
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-2xl border border-black/5 bg-gray-100 p-6 dark:border-white/10 dark:bg-vdcGrey/30">
        <div className="flex w-full items-stretch min-w-[44rem]">
          {bracket.rounds.map((round, roundIndex) => {
            const winnerPoints = BRACKET_WINNER_POINTS[fromEnd(roundIndex)] ?? 0;
            return (
              <Fragment key={roundIndex}>
                <div className="flex w-60 shrink-0 flex-col">
                  <h1 className="flex h-8 items-center justify-center gap-2 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    {round.label}
                    <p style={{ color: accent }}>{winnerPoints} pts · x2 exact</p>
                  </h1>
                  <div className="flex flex-1 flex-col">
                    {round.slots.map((slot, slotIndex) => {
                      const key = `${roundIndex}:${slotIndex}`;
                      if (slot.kind === "bye") {
                        return (
                          <div
                            key={key}
                            className="flex flex-1 flex-col justify-center py-3"
                          >
                            {slot.team && <ByeCard team={slot.team} />}
                          </div>
                        );
                      }
                      const sides = candidatesByKey.get(key) ?? [null, null];
                      const input = inputs.get(key) ?? { top: "", bottom: "" };
                      const pick = picks.get(key);
                      const realLoserGames =
                        pick !== undefined
                          ? results[roundIndex].loserGamesByWinner.get(
                              pick.teamId,
                            )
                          : undefined;
                      const cardPoints =
                        locked && pick !== undefined && realLoserGames !== undefined
                          ? BRACKET_WINNER_POINTS[pick.round] *
                            (realLoserGames === pick.loserGames ? 2 : 1)
                          : locked
                            ? 0
                            : null;
                      const realScores =
                        slot.kind === "series" && slot.status !== "scheduled"
                          ? [slot.home.score, slot.away.score]
                          : [null, null];
                      const toSide = (index: 0 | 1): CardSide => ({
                        team: sides[index],
                        value: index === 0 ? input.top : input.bottom,
                        isWinner:
                          pick !== undefined && sides[index]?.id === pick.teamId,
                        realScore: realScores[index],
                      });
                      return (
                        <div
                          key={key}
                          className="flex flex-1 flex-col justify-center py-3"
                        >
                          <BracketCard
                            top={toSide(0)}
                            bottom={toSide(1)}
                            maxScore={clinch(round.matchType)}
                            editable={!locked}
                            accent={accent}
                            pointsEarned={cardPoints}
                            error={locked ? null : (errorsByKey.get(key) ?? null)}
                            onChange={(side, value) =>
                              setScore(key, side, value)
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
                {roundIndex < totalRounds - 1 && (
                  <BracketConnectors
                    prevRound={round}
                    nextRound={bracket.rounds[roundIndex + 1]}
                  />
                )}
              </Fragment>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-[60%] text-[11px] text-vdcGrey dark:text-gray-400">
          Type each series score; the winner advances automatically. Points per
          correct winner scale by round, and nailing the exact score doubles
          them. No submission scores zero. There is no random fill.
        </p>
        <div className="flex items-center gap-3">
          {earned !== null && (
            <h2 className="text-xs font-bold" style={{ color: accent }}>
              {earned.points} pts earned
            </h2>
          )}
          {message && (
            <p className="text-xs font-semibold text-vdcRed">{message}</p>
          )}
          {!locked && (
            <button
              type="button"
              onClick={handleSave}
              disabled={saveDisabled}
              className="rounded-lg bg-vdcRed px-5 py-2.5 text-sm font-bold text-white transition-colors enabled:hover:cursor-pointer enabled:hover:bg-red-700 disabled:opacity-40"
            >
              <h1>{saveLabel()}</h1>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
