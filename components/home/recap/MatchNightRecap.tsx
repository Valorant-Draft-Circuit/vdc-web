"use client";

import { useState } from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/solid";
import { TIER_HEX_COLOR_MAP, TIERS_LIST } from "@/lib/common/constants";
import { formatDate } from "@/lib/common/format";
import { RecapStat, RecapView, RecapViewKey } from "@/lib/common/matchNight";
import { Maps } from "@/lib/common/valorant-api";
import { MatchNightRecap as MatchNightRecapData } from "@/lib/queries/home/matchNight";
import MapReportCard from "./MapReportCard";
import StandingsMoversCard from "./StandingsMoversCard";
import TopPerformersCard from "./TopPerformersCard";

type Props = {
  recap: MatchNightRecapData;
  mapUuidsByName: Maps;
};

export default function MatchNightRecap({ recap, mapUuidsByName }: Props) {
  const [activeViewKey, setActiveViewKey] = useState<RecapViewKey>("OVERALL");
  const [activeStat, setActiveStat] = useState<RecapStat>("rating");

  const viewByKey = new Map<RecapViewKey, RecapView>([
    ["OVERALL", recap.overall],
    ...recap.tierViews.map((view) => [view.key, view] as const),
  ]);
  const activeView = viewByKey.get(activeViewKey) ?? recap.overall;
  const isOverall = activeViewKey === "OVERALL";

  const pillKeys: RecapViewKey[] = ["OVERALL", ...TIERS_LIST];

  return (
    <section className="relative z-20">
      <div className="px-4 py-2 mt-5 sm:px-6 text-lg lg:text-xl">
        <h1>Match Date Summary</h1>
      </div>
      <div className="px-4 py-2 sm:px-6">
        <div className="flex flex-col gap-4 rounded-md bg-slate-100 dark:bg-vdcGrey p-4 sm:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <h2 className="text-md tracking-wider uppercase text-vdcRed font-semibold">
              {headerTitle(activeView)}
            </h2>
            <div className="hidden sm:flex flex-wrap gap-1.5 sm:ml-auto">
              {pillKeys.map((key) => {
                const view = viewByKey.get(key);
                const isDisabled = key !== "OVERALL" && view?.matchDay === null;
                const isActive = key === activeViewKey;
                return (
                  <button
                    key={key}
                    disabled={isDisabled}
                    onClick={() => setActiveViewKey(key)}
                    className={`rounded-full px-4 py-1.5 text-xs uppercase tracking-wider font-semibold transition hover:cursor-pointer ${
                      isActive
                        ? "bg-vdcRed text-vdcWhite"
                        : "bg-vdcWhite/40 dark:bg-vdcBlack/40 backdrop-blur-sm hover:brightness-90 disabled:opacity-40 disabled:hover:brightness-100"
                    }`}
                    style={
                      !isActive && key !== "OVERALL"
                        ? { color: TIER_HEX_COLOR_MAP[key] }
                        : undefined
                    }
                  >
                    <h2>{key === "OVERALL" ? "Overall" : key}</h2>
                  </button>
                );
              })}
            </div>
            <div className="sm:hidden">
              <Listbox value={activeViewKey} onChange={setActiveViewKey}>
                <div className="relative">
                  <ListboxButton className="relative w-full rounded-md bg-vdcWhite/40 dark:bg-vdcBlack/40 backdrop-blur-sm py-2 pl-3 pr-9 text-left text-sm uppercase tracking-wider font-semibold hover:cursor-pointer">
                    <h2
                      className="truncate"
                      style={
                        !isOverall
                          ? { color: TIER_HEX_COLOR_MAP[activeViewKey] }
                          : undefined
                      }
                    >
                      {viewKeyLabel(activeViewKey)}
                    </h2>
                    <ChevronUpDownIcon
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-y-0 right-2 my-auto size-5 fill-gray-500"
                    />
                  </ListboxButton>
                  <ListboxOptions className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-vdcWhite dark:bg-vdcGrey shadow-lg ring-1 ring-black/5 focus:outline-none">
                    {pillKeys.map((key) => {
                      const isDisabled =
                        key !== "OVERALL" &&
                        viewByKey.get(key)?.matchDay === null;
                      return (
                        <ListboxOption
                          key={key}
                          value={key}
                          disabled={isDisabled}
                          className="relative cursor-pointer select-none py-2 pl-3 pr-9 text-sm uppercase tracking-wider font-semibold hover:bg-slate-200 dark:hover:bg-vdcBlack/40 data-disabled:opacity-40 data-selected:bg-slate-200 dark:data-selected:bg-vdcBlack/40"
                          style={
                            key !== "OVERALL"
                              ? { color: TIER_HEX_COLOR_MAP[key] }
                              : undefined
                          }
                        >
                          {({ selected }) => (
                            <>
                              <h2 className="block truncate">
                                {viewKeyLabel(key)}
                              </h2>
                              {selected && (
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                                  <CheckIcon
                                    className="size-5"
                                    aria-hidden="true"
                                  />
                                </span>
                              )}
                            </>
                          )}
                        </ListboxOption>
                      );
                    })}
                  </ListboxOptions>
                </div>
              </Listbox>
            </div>
          </div>

          <div className="grid gap-3 xl:grid-cols-3">
            <TopPerformersCard
              performers={activeView.performers}
              activeStat={activeStat}
              onStatChange={setActiveStat}
              showTierDots={isOverall}
            />
            <MapReportCard
              mapReport={activeView.mapReport}
              mapUuidsByName={mapUuidsByName}
              showTierDots={isOverall}
            />
            <StandingsMoversCard
              movers={activeView.movers}
              showTierDots={isOverall}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function viewKeyLabel(key: RecapViewKey): string {
  return key === "OVERALL" ? "Overall" : key;
}

function headerTitle(view: RecapView): string {
  if (view.key === "OVERALL") return "All Tiers";
  if (view.matchDay === null || view.nightDate === null) return "No games yet";
  return `Match Day ${view.matchDay} · ${formatDate(view.nightDate)}`;
}
