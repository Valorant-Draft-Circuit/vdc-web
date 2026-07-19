"use client";

import { submitMapPick, submitSidePick } from "@/app/match/[matchId]/actions";
import { MAP_LIST_URL } from "@/lib/common/constants/maps";
import { MapBansSide } from "@prisma/client";
import Image from "next/image";
import { useState, useTransition } from "react";

type MapTurn = { kind: "map"; turnType: string; remainingMaps: string[] };
type SideTurn = { kind: "side"; rowId: number; map: string };

export default function VetoActionPanel({
  matchID,
  turn,
  maps,
}: {
  matchID: number;
  turn: MapTurn | SideTurn;
  maps: Record<string, string>;
}) {
  const [selection, setSelection] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const toggleSelection = (value: string) => {
    setError(null);
    setSelection((current) => (current === value ? null : value));
  };

  const confirmSelection = () => {
    if (!selection) return;
    startTransition(async () => {
      const result =
        turn.kind === "map"
          ? await submitMapPick(matchID, selection)
          : await submitSidePick(matchID, turn.rowId, selection as MapBansSide);
      if (!result.ok) {
        setError(result.error);
        setSelection(null);
      }
    });
  };

  const sideChoices = [MapBansSide.ATTACK, MapBansSide.DEFENSE];
  const confirmLabel =
    turn.kind === "map"
      ? `Confirm ${turn.turnType}: ${selection}`
      : `Confirm ${selection} on ${turn.map}`;

  return (
    <div className="flex flex-col gap-3">
      {turn.kind === "map" ? (
        <div className="flex flex-row flex-wrap gap-3">
          {turn.remainingMaps.map((map) => {
            const mapUuid = maps[map.toUpperCase()];
            const isSelected = selection === map;
            return (
              <button
                key={map}
                type="button"
                disabled={isPending}
                onClick={() => toggleSelection(map)}
                className={`relative flex w-32 h-16 items-center justify-center overflow-hidden rounded-md hover:brightness-90 disabled:opacity-50 hover:cursor-pointer ${
                  isSelected ? "ring-2 ring-vdcRed" : ""
                }`}
              >
                {mapUuid && (
                  <Image
                    alt={map}
                    src={MAP_LIST_URL(mapUuid)}
                    fill
                    sizes="140px"
                    className="object-cover brightness-50"
                  />
                )}
                <h3 className="relative text-vdcWhite">{map}</h3>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-row gap-3">
          {sideChoices.map((side) => {
            const isSelected = selection === side;
            return (
              <button
                key={side}
                type="button"
                disabled={isPending}
                onClick={() => toggleSelection(side)}
                className={`rounded-md px-4 py-2 hover:brightness-90 disabled:opacity-50 hover:cursor-pointer ${
                  isSelected
                    ? "bg-vdcRed text-vdcWhite ring-2 ring-vdcRed"
                    : "border border-vdcRed/50 text-vdcRed"
                }`}
              >
                {side}
              </button>
            );
          })}
        </div>
      )}

      {selection && (
        <button
          type="button"
          disabled={isPending}
          onClick={confirmSelection}
          className="self-start rounded-md bg-vdcRed px-4 py-2 text-vdcWhite hover:brightness-90 disabled:opacity-50 hover:cursor-pointer"
        >
          {confirmLabel}
        </button>
      )}

      {error && <h2 className="text-xs text-vdcRed">{error}</h2>}
    </div>
  );
}
