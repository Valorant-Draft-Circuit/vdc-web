"use client";

import { resetVeto } from "@/app/match/[matchId]/actions";
import { useState, useTransition } from "react";

export default function VetoResetButton({ matchID }: { matchID: number }) {
  const [isArmed, setIsArmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (!isArmed) {
      setIsArmed(true);
      return;
    }
    startTransition(async () => {
      const result = await resetVeto(matchID);
      if (!result.ok) setError(result.error);
      setIsArmed(false);
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={isPending}
        onClick={handleClick}
        className="rounded-md border border-vdcRed/50 px-2 py-1 text-xs text-vdcRed hover:brightness-90 disabled:opacity-50 hover:cursor-pointer"
      >
        <h1>{isArmed ? "Confirm reset" : "Reset veto"}</h1>
      </button>
      {error && <h2 className="text-xs text-vdcRed">{error}</h2>}
    </div>
  );
}
