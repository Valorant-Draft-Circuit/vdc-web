"use client";

import { useState, type ReactNode } from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/solid";
import { Tier } from "@prisma/client";
import { TIER_HEX_COLOR_MAP, TIERS_LIST } from "@/lib/common/constants/tiers";
import type { OverallHighlights as OverallHighlightsData } from "@/lib/queries/home/playoffResults";
import OverallHighlights from "./OverallHighlights";

type TabKey = "OVERALL" | Tier;
type BracketTab = { tier: Tier; node: ReactNode };

function tabLabel(key: TabKey): string {
  return key === "OVERALL" ? "Overall" : key;
}

export default function PlayoffResults({
  brackets,
  highlights,
}: {
  brackets: BracketTab[];
  highlights: OverallHighlightsData;
}) {
  const [activeTab, setActiveTab] = useState<TabKey>("OVERALL");

  const pillKeys: TabKey[] = ["OVERALL", ...TIERS_LIST];
  const bracketByTier = new Map(brackets.map((tab) => [tab.tier, tab.node]));
  const isOverall = activeTab === "OVERALL";
  const hasHighlights = highlights.upsetsByStage.length > 0;

  return (
    <section className="relative z-20">
      <div className="mt-5 px-4 py-2 text-lg sm:px-6 lg:text-xl">
        <h1>Playoffs</h1>
      </div>
      <div className="px-4 py-2 sm:px-6">
        <div className="flex flex-col gap-4 rounded-md bg-slate-100 p-4 dark:bg-vdcGrey sm:p-5">
          <div className="hidden flex-wrap gap-1.5 sm:flex">
            {pillKeys.map((key) => {
              const isActive = key === activeTab;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition hover:cursor-pointer ${
                    isActive
                      ? "bg-vdcRed text-vdcWhite"
                      : "bg-vdcWhite/40 backdrop-blur-sm hover:brightness-90 dark:bg-vdcBlack/40"
                  }`}
                  style={
                    !isActive && key !== "OVERALL"
                      ? { color: TIER_HEX_COLOR_MAP[key] }
                      : undefined
                  }
                >
                  <h2>{tabLabel(key)}</h2>
                </button>
              );
            })}
          </div>

          <div className="sm:hidden">
            <Listbox value={activeTab} onChange={setActiveTab}>
              <div className="relative">
                <ListboxButton className="relative w-full rounded-md bg-vdcWhite/40 py-2 pl-3 pr-9 text-left text-sm font-semibold uppercase tracking-wider backdrop-blur-sm hover:cursor-pointer dark:bg-vdcBlack/40">
                  <h2
                    className="truncate"
                    style={
                      !isOverall
                        ? { color: TIER_HEX_COLOR_MAP[activeTab as Tier] }
                        : undefined
                    }
                  >
                    {tabLabel(activeTab)}
                  </h2>
                  <ChevronUpDownIcon
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 right-2 my-auto size-5 fill-gray-500"
                  />
                </ListboxButton>
                <ListboxOptions className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-vdcWhite shadow-lg ring-1 ring-black/5 focus:outline-none dark:bg-vdcGrey">
                  {pillKeys.map((key) => (
                    <ListboxOption
                      key={key}
                      value={key}
                      className="relative cursor-pointer select-none py-2 pl-3 pr-9 text-sm font-semibold uppercase tracking-wider hover:bg-slate-200 data-selected:bg-slate-200 dark:hover:bg-vdcBlack/40 dark:data-selected:bg-vdcBlack/40"
                      style={
                        key !== "OVERALL"
                          ? { color: TIER_HEX_COLOR_MAP[key] }
                          : undefined
                      }
                    >
                      {({ selected }) => (
                        <>
                          <h2 className="block truncate">{tabLabel(key)}</h2>
                          {selected && (
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                              <CheckIcon className="size-5" aria-hidden="true" />
                            </span>
                          )}
                        </>
                      )}
                    </ListboxOption>
                  ))}
                </ListboxOptions>
              </div>
            </Listbox>
          </div>

          {isOverall ? (
            hasHighlights ? (
              <OverallHighlights highlights={highlights} />
            ) : (
              <h2 className="py-6 text-center text-sm text-gray-400">
                No standout results yet
              </h2>
            )
          ) : (
            bracketByTier.get(activeTab)
          )}
        </div>
      </div>
    </section>
  );
}
