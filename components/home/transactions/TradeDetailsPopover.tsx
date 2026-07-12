"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
import type { TradeAsset, TradeDetails } from "@/lib/common/transactions";

export default function TradeDetailsPopover({
  label,
  details,
}: {
  label: string;
  details: TradeDetails;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", closeOnOutsidePress);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="min-w-0">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex min-w-0 items-center gap-1 hover:cursor-pointer hover:text-vdcRed"
      >
        <h2 className="truncate">{label}</h2>
        <ChevronDownIcon className="size-3 flex-none text-vdcRed" />
      </button>
      <div
        className={`absolute inset-x-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-md border border-black/10 bg-vdcWhite/95 p-3 backdrop-blur-sm dark:border-white/10 dark:bg-vdcBlack/95 ${
          open ? "block" : "hidden"
        }`}
      >
        <div className="grid grid-cols-2 gap-3">
          {details.sides.map((side, sideIndex) => (
            <div key={`${side.franchiseName}-${sideIndex}`}>
              <h2 className="mb-1 truncate text-[10px] uppercase tracking-wider text-vdcRed">
                {side.franchiseName} send
              </h2>
              {side.assets.length === 0 ? (
                <h2 className="text-[11px] text-gray-500 dark:text-gray-400">
                  Nothing
                </h2>
              ) : (
                side.assets.map((asset, assetIndex) => (
                  <AssetLine key={assetIndex} asset={asset} />
                ))
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AssetLine({ asset }: { asset: TradeAsset }) {
  const tagClass =
    asset.kind === "player"
      ? "bg-vdcBlue/15 text-vdcBlue"
      : "bg-vdcOrange/15 text-vdcOrange";
  const tagText = asset.kind === "player" ? "PLAYER" : "PICK";
  return (
    <div className="flex items-center gap-1.5 py-0.5">
      <h2
        className={`flex-none rounded px-1 text-[8px] font-bold tracking-wider ${tagClass}`}
      >
        {tagText}
      </h2>
      {asset.playerIgn ? (
        <Link
          href={`/player/${encodeURIComponent(asset.playerIgn)}`}
          className="truncate text-[11px] hover:text-vdcRed"
        >
          <h2>{asset.label}</h2>
        </Link>
      ) : (
        <h2 className="truncate text-[11px]">{asset.label}</h2>
      )}
    </div>
  );
}
