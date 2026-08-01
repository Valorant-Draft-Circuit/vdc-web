"use client";

import { MAP_LIST_URL } from "@/lib/common/constants/maps";
import { MapBansSide, MapBanType } from "@prisma/client";
import {
  BoltIcon,
  CheckCircleIcon,
  NoSymbolIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/solid";
import Image from "next/image";
import { useState, useTransition } from "react";
import { useVetoSelection } from "./VetoSelectionContext";
import VetoTurnHeader from "./VetoTurnHeader";

type MapTurn = { kind: "map"; turnType: string; remainingMaps: string[] };
type SideTurn = { kind: "side"; rowId: number; map: string };

export type VetoActionResult = { ok: boolean; error?: string };

export type VetoActions = {
  preview: (map: string | null) => Promise<VetoActionResult>;
  submitMap: (map: string) => Promise<VetoActionResult>;
  submitSide: (rowId: number, side: MapBansSide) => Promise<VetoActionResult>;
};

export default function VetoActionPanel({
  actions,
  headline,
  turn,
  maps,
}: {
  actions: VetoActions;
  headline: string;
  turn: MapTurn | SideTurn;
  maps: Record<string, string>;
}) {
  const { selectedMap: selection, setSelectedMap: setSelection } =
    useVetoSelection();
  const [animatedMap, setAnimatedMap] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const toggleSelection = (value: string) => {
    setError(null);
    const nextSelection = selection === value ? null : value;
    setSelection(nextSelection);
    if (turn.kind === "map") {
      void actions.preview(nextSelection);
    }
  };

  const confirmSelection = () => {
    if (!selection) return;
    startTransition(async () => {
      const result =
        turn.kind === "map"
          ? await actions.submitMap(selection)
          : await actions.submitSide(turn.rowId, selection as MapBansSide);
      if (!result.ok) {
        setError(result.error ?? null);
      }
      setSelection(null);
      setAnimatedMap(null);
    });
  };

  const sideChoices = [MapBansSide.ATTACK, MapBansSide.DEFENSE];
  const confirmLabel =
    turn.kind === "map"
      ? `Confirm ${turn.turnType}: ${selection}`
      : `Confirm ${selection} on ${turn.map}`;

  return (
    <div className="flex flex-col gap-3">
      <VetoTurnHeader headline={headline}>
        {selection && (
          <button
            type="button"
            disabled={isPending}
            onClick={confirmSelection}
            className="rounded-md bg-vdcRed px-4 py-1 text-vdcWhite hover:brightness-90 disabled:opacity-50 hover:cursor-pointer"
          >
            <h1>{confirmLabel}</h1>
          </button>
        )}
      </VetoTurnHeader>
      {turn.kind === "map" ? (
        <div className="flex flex-col gap-3">
          {turn.remainingMaps.map((map) => {
            const mapUuid = maps[map.toUpperCase()];
            const isSelected = selection === map;
            const isBanTurn = turn.turnType === MapBanType.BAN;
            const isAnimating = animatedMap === map;
            const showsTurnState = isAnimating || isSelected;
            const animatingClass = isBanTurn
              ? "veto-ban-animating"
              : "veto-pick-animating";
            const selectedClass = isBanTurn
              ? "veto-ban-selected"
              : "veto-pick-selected";
            return (
              <button
                key={map}
                type="button"
                disabled={isPending}
                onClick={() => toggleSelection(map)}
                onMouseEnter={() => {
                  if (animatedMap !== map) setAnimatedMap(map);
                }}
                onMouseLeave={() => {
                  if (selection && selection !== map && animatedMap === map) {
                    setAnimatedMap(null);
                  }
                }}
                className={`group relative flex w-full h-20 items-center justify-center overflow-hidden rounded-md hover:brightness-90 disabled:opacity-50 hover:cursor-pointer ${
                  isAnimating ? animatingClass : ""
                } ${isSelected ? selectedClass : ""}`}
              >
                {mapUuid && (
                  <Image
                    alt={map}
                    src={MAP_LIST_URL(mapUuid)}
                    fill
                    sizes="576px"
                    className="object-cover brightness-50"
                  />
                )}
                {isBanTurn ? (
                  <>
                    <div className="pointer-events-none veto-ban-line-up bg-vdcRed/80" />
                    <div className="pointer-events-none veto-ban-line-down bg-vdcRed/80" />
                    <div className="pointer-events-none veto-ban-outline" />
                  </>
                ) : (
                  <>
                    <div className="pointer-events-none veto-pick-bright" />
                    <div className="pointer-events-none veto-ban-line-up bg-vdcGreen/80" />
                    <div className="pointer-events-none veto-ban-line-down bg-vdcGreen/80" />
                    <div className="pointer-events-none veto-pick-outline" />
                  </>
                )}
                <div className="pointer-events-none relative flex w-full items-center">
                  <div
                    className={`veto-flank-left h-0.5 flex-1 ${
                      isBanTurn ? "bg-vdcRed/80" : "bg-vdcGreen/80"
                    }`}
                  />
                  <div className="flex items-center px-3">
                    <h1 className="text-vdcWhite">{map}</h1>
                    {isBanTurn ? (
                      <NoSymbolIcon
                        className={`ml-2 size-8 text-vdcRed drop-shadow-lg transition-all duration-500 ${
                          showsTurnState
                            ? "scale-100 rotate-180 opacity-100"
                            : "scale-50 opacity-0"
                        }`}
                      />
                    ) : (
                      <CheckCircleIcon
                        className={`ml-2 size-8 text-vdcGreen drop-shadow-lg transition-all duration-300 ${
                          showsTurnState
                            ? "scale-100 opacity-100"
                            : "scale-50 opacity-0"
                        }`}
                      />
                    )}
                  </div>
                  <div
                    className={`veto-flank-right h-0.5 flex-1 ${
                      isBanTurn ? "bg-vdcRed/80" : "bg-vdcGreen/80"
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="relative flex h-64 xl:h-100 w-full overflow-hidden rounded-md">
          {maps[turn.map.toUpperCase()] && (
            <Image
              alt={turn.map}
              src={MAP_LIST_URL(maps[turn.map.toUpperCase()])}
              fill
              sizes="1200px"
              className="object-cover brightness-50"
            />
          )}
          {sideChoices.map((side, index) => {
            const isSelected = selection === side;
            const isDimmed = selection !== null && !isSelected;
            const isAttack = side === MapBansSide.ATTACK;
            return (
              <button
                key={side}
                type="button"
                disabled={isPending}
                onClick={() => toggleSelection(side)}
                className={`relative flex flex-1 items-center justify-center gap-3 transition-all duration-300 hover:bg-vdcWhite/10 disabled:opacity-50 hover:cursor-pointer ${
                  index === 0 ? "border-r border-vdcWhite/30" : ""
                } ${isSelected ? (isAttack ? "bg-vdcRed/30" : "bg-vdcBlue/30") : ""} ${
                  isDimmed ? "opacity-40 grayscale" : ""
                }`}
              >
                {isAttack ? (
                  <BoltIcon
                    className={`size-8 text-vdcRed drop-shadow-lg transition-transform duration-300 ${
                      isSelected ? "scale-125" : ""
                    }`}
                  />
                ) : (
                  <ShieldCheckIcon
                    className={`size-8 text-vdcBlue drop-shadow-lg transition-transform duration-300 ${
                      isSelected ? "scale-125" : ""
                    }`}
                  />
                )}
                <h1 className="text-vdcWhite drop-shadow-lg">{side}</h1>
              </button>
            );
          })}
        </div>
      )}

      {error && <h2 className="text-xs text-vdcRed">{error}</h2>}
    </div>
  );
}
