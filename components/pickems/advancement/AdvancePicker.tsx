"use client";

import { useMemo, useState, type CSSProperties } from "react";
import Image from "next/image";
import { XMarkIcon } from "@heroicons/react/16/solid";
import { Tier } from "@prisma/client";
import TeamLogo from "@/components/home/recap/TeamLogo";
import { TEAM_LOGOS_URL } from "@/lib/common/constants/urls";
import type {
  AdvanceBoard,
  AdvanceTeam,
} from "@/lib/queries/pickems/getAdvanceBoard";
import type { StoredAdvancePick } from "@/lib/queries/pickems/getUserPicks";
import { submitAdvancePick } from "@/app/pickems/actions";

type Props = {
  board: AdvanceBoard;
  initial?: StoredAdvancePick[];
  tier: Tier;
  locked: boolean;
  accent: string;
  canSave: boolean;
};

export default function AdvancePicker({
  board,
  initial,
  tier,
  locked,
  accent,
  canSave,
}: Props) {
  const teamById = useMemo(() => {
    const map = new Map<number, AdvanceTeam>();
    for (const team of board.teams) {
      map.set(team.id, team);
    }
    return map;
  }, [board.teams]);

  const sortedTeams = useMemo(
    () => [...board.teams].sort((a, b) => a.name.localeCompare(b.name)),
    [board.teams],
  );

  const [selected, setSelected] = useState<number[]>(() =>
    (initial ?? [])
      .slice()
      .sort((a, b) => a.seed - b.seed)
      .map((pick) => pick.teamId),
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const slots = Array.from(
    { length: board.n },
    (_, index) => selected[index] ?? null,
  );
  const filled = selected.length;
  const slotColumns = Math.ceil(board.n / 2);

  const addTeam = (teamId: number) => {
    if (locked || selected.includes(teamId) || selected.length >= board.n) {
      return;
    }
    setSelected((prev) => [...prev, teamId]);
    setMessage(null);
  };

  const clearSlot = (index: number) => {
    if (locked) {
      return;
    }
    setSelected((prev) => prev.filter((_, slotIndex) => slotIndex !== index));
    setMessage(null);
  };

  const handleSave = async () => {
    if (filled !== board.n) {
      return;
    }
    setSaving(true);
    setMessage(null);
    const teams = selected.map((teamId, index) => ({
      teamId,
      seed: index + 1,
    }));
    const result = await submitAdvancePick({ tier, teams });
    setSaving(false);
    setMessage(result.ok ? "Picks saved." : result.error);
  };

  const saveDisabled = locked || saving || !canSave || filled !== board.n;

  function saveLabel(): string {
    if (!canSave) {
      return "Log in to save";
    }
    if (saving) {
      return "SAVING...";
    }
    return "SAVE PICKS";
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-vdcGrey dark:text-gray-400">
        Fill the <b style={{ color: accent }}>{board.n}</b> playoff slots with
        the teams you think make playoffs.
      </p>

      <div
        className="rounded-2xl border p-3"
        style={{ borderColor: accent, backgroundColor: `${accent}1a` }}
      >
        <div
          className="mb-2 flex justify-between text-[11px] font-extrabold uppercase tracking-wide"
          style={{ color: accent }}
        >
          <h1>Playoff slots</h1>
          <h1>
            {filled} / {board.n} filled
          </h1>
        </div>
        <div
          className="grid justify-center gap-3"
          style={{
            gridTemplateColumns: `repeat(${slotColumns}, minmax(0, 12rem))`,
          }}
        >
          {slots.map((teamId, index) => {
            const team = teamId !== null ? teamById.get(teamId) : null;
            if (!team) {
              return (
                <div
                  key={index}
                  className="flex aspect-square flex-col items-center justify-center rounded-lg border-[1.5px] border-dashed border-black/20 text-[11px] text-vdcGrey dark:border-white/20 dark:text-gray-400"
                >
                  <h2>+ Slot {index + 1}</h2>
                </div>
              );
            }
            return (
              <div
                key={index}
                className="relative flex aspect-square flex-col items-center justify-center gap-1.5 rounded-lg border-[1.5px] p-3 text-center text-[11px] font-bold"
                style={{ borderColor: accent, backgroundColor: `${accent}2e` }}
              >
                <h1 className="absolute left-2 top-1 text-base font-extrabold leading-none text-vdcGrey dark:text-gray-400 p-1">
                  {index + 1}
                </h1>
                {!locked && (
                  <button
                    type="button"
                    onClick={() => clearSlot(index)}
                    className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full text-vdcGrey transition-colors hover:bg-black/10 hover:text-vdcRed dark:text-gray-400 dark:hover:bg-white/10"
                    aria-label={`Remove ${team.name}`}
                  >
                    <XMarkIcon className="size-4" />
                  </button>
                )}
                {team.logo && (
                  <div className="relative aspect-square w-1/2">
                    <Image
                      src={`${TEAM_LOGOS_URL}${team.logo}`}
                      alt={team.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
                <h2 className="line-clamp-2 leading-tight text-md">
                  {team.name}
                </h2>
              </div>
            );
          })}
        </div>
      </div>

      <div
        className="mt-1 flex flex-wrap gap-1.5"
        style={{ "--tier-accent": accent } as CSSProperties}
      >
        {sortedTeams.map((team) => {
          const used = selected.includes(team.id);
          const usedStyle = used ? { opacity: 0.3 } : undefined;
          return (
            <button
              key={team.id}
              type="button"
              disabled={locked || used}
              onClick={() => addTeam(team.id)}
              className="flex items-center gap-1.5 rounded-full border border-black/10 bg-gray-100 py-1.5 pl-1.5 pr-3 text-xs font-semibold transition-colors enabled:hover:cursor-pointer enabled:hover:border-[var(--tier-accent)] enabled:hover:text-[var(--tier-accent)] disabled:cursor-not-allowed dark:border-white/10 dark:bg-vdcGrey"
              style={usedStyle}
            >
              <TeamLogo logo={team.logo} teamName={team.name} />
              <h2>{team.name}</h2>
            </button>
          );
        })}
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-[60%] text-[11px] text-vdcGrey dark:text-gray-400">
          Slot order = your predicted seed (1 = top seed). +2 per team in the
          cutoff, +1 more if the seed is exact. No submission means a random
          ordered set is filled for you.
        </p>
        <div className="flex items-center gap-3">
          {message && (
            <p className="text-xs font-semibold text-vdcRed">{message}</p>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saveDisabled}
            className="rounded-lg bg-vdcRed px-5 py-2.5 text-sm font-bold text-white transition-colors enabled:hover:cursor-pointer enabled:hover:bg-red-700 disabled:opacity-40"
          >
            <h1>{saveLabel()}</h1>
          </button>
        </div>
      </div>
    </div>
  );
}
