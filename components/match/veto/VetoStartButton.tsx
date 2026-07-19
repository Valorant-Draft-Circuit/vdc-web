"use client";

import { startVeto } from "@/app/match/[matchId]/actions";
import { useState, useTransition } from "react";

export default function VetoStartButton({ matchID }: { matchID: number }) {
  const [error, setError] = useState<string | null>(null);
  const [existingVetoUrl, setExistingVetoUrl] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleStart = () => {
    startTransition(async () => {
      const result = await startVeto(matchID);
      if (!result.ok) {
        setError(result.error);
        setExistingVetoUrl(result.vetoUrl ?? null);
      }
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={handleStart}
        className="self-start rounded-md bg-vdcRed px-4 py-2 text-vdcWhite hover:brightness-90 disabled:opacity-50 hover:cursor-pointer"
      >
        <h1>Start map bans</h1>
      </button>
      {error && <h2 className="text-xs text-vdcRed">{error}</h2>}
      {existingVetoUrl && (
        <a
          href={existingVetoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-vdcBlue hover:underline"
        >
          <h1>Go to the active veto</h1>
        </a>
      )}
    </div>
  );
}
