"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
import type { TradeAsset, TradeDetails } from "@/lib/common/transactions";

export default function TradeDetailsPopover({
  label,
  details,
  dateLabel,
}: {
  label: string;
  details: TradeDetails;
  dateLabel: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-2 hover:cursor-pointer"
      >
        <div className="flex min-w-0 items-center gap-1 hover:text-vdcRed">
          <h2 className="truncate">{label}</h2>
          <ChevronDownIcon
            className={`size-3 flex-none text-vdcRed transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
        <h2 className="ml-auto w-10 flex-none text-right text-sm text-gray-500">
          {dateLabel}
        </h2>
      </button>
      {open && (
        <div className="mt-1.5 rounded-md border border-black/10 bg-vdcWhite/60 p-3 dark:border-white/10 dark:bg-vdcBlack/60">
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
      )}
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
