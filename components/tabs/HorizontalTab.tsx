"use client";

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/24/solid";
import { TIER_COLOR_MAP } from "@/lib/common/constants/tiers";
import { TabElement } from "./types";

const TIER_COLOR_TOKENS = new Set(Object.values(TIER_COLOR_MAP));

export default function HorizontalTab({
  tabElements,
  params,
  defaultQuery,
}: {
  tabElements: TabElement[];
  params: string;
  defaultQuery?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const fallbackQuery =
    defaultQuery?.toLowerCase() ?? tabElements[0].query.toLowerCase();
  const activeQuery =
    searchParams.get(params)?.toLowerCase() ?? fallbackQuery;

  const derivedIndex = tabElements.findIndex(
    (t) => t.query.toLowerCase() === activeQuery,
  );
  const selectedIndex = derivedIndex >= 0 ? derivedIndex : 0;

  const handleChange = (index: number) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set(params, tabElements[index].query.toLowerCase());
    router.push(`${pathname}?${nextParams.toString()}`, { scroll: false });
  };

  return (
    <TabGroup
      selectedIndex={selectedIndex}
      onChange={handleChange}
      className="flex flex-col gap-3"
    >
      <div className="xl:hidden sticky top-0 z-40 has-data-open:z-50 bg-vdcWhite dark:bg-vdcBlack mx-auto w-full pt-5 px-10 sm:px-12 ">
        <MobileTabs
          tabElements={tabElements}
          selected={selectedIndex}
          onSelect={handleChange}
        />
      </div>

      <div className="hidden xl:block">
        <div className="sticky top-26 self-start z-30">
          <TabList className="flex flex-row flex-wrap items-center gap-1.5">
            {tabElements.map(({ name, color }) => (
              <Tab
                key={name}
                className={`group flex-1 rounded-full px-4 py-1.5 text-sm uppercase tracking-wider font-semibold transition bg-slate-100 dark:bg-vdcGrey focus:not-data-focus:outline-none data-hover:cursor-pointer data-hover:brightness-90 data-selected:bg-${color}`}
              >
                <h1
                  className={
                    TIER_COLOR_TOKENS.has(color)
                      ? `bg-linear-to-r from-${color} to-vdcBlack dark:to-vdcWhite bg-clip-text text-transparent group-data-selected:bg-none group-data-selected:text-vdcWhite`
                      : `text-${color} group-data-selected:text-vdcWhite`
                  }
                >
                  {name}
                </h1>
              </Tab>
            ))}
          </TabList>
        </div>
      </div>

      <TabPanels className="flex flex-col gap-2 px-3 xl:px-0">
        {tabElements.map(({ content, query }) => (
          <TabPanel key={query}>{content}</TabPanel>
        ))}
      </TabPanels>
    </TabGroup>
  );
}

function MobileTabs({
  tabElements,
  selected,
  onSelect,
}: {
  tabElements: TabElement[];
  selected: number;
  onSelect: (index: number) => void;
}) {
  const selectedTab = tabElements[selected];

  return (
    <div className="grid grid-cols-1 xl:hidden w-full">
      <Listbox
        value={selectedTab}
        onChange={(tab) => {
          const idx = tabElements.findIndex((t) => t.query === tab.query);
          if (idx >= 0) onSelect(idx);
        }}
      >
        <div className="relative col-start-1 row-start-1">
          <ListboxButton
            className={`relative w-full rounded-md bg-slate-100 dark:bg-vdcGrey py-2.5 pl-3 pr-9 text-center text-sm uppercase tracking-wider font-semibold data-hover:cursor-pointer data-hover:brightness-90 text-${selectedTab.color}`}
          >
            <h1 className="truncate">{selectedTab.name}</h1>
            <ChevronUpDownIcon
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-2 my-auto size-5 fill-gray-500"
            />
          </ListboxButton>

          <ListboxOptions className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-vdcWhite dark:bg-vdcGrey shadow-lg ring-1 ring-black/5 focus:outline-none">
            {tabElements.map((tab) => (
              <ListboxOption
                key={tab.query}
                value={tab}
                className={`relative cursor-pointer select-none py-2 pl-3 pr-9 text-sm uppercase tracking-wider font-semibold hover:bg-slate-200 dark:hover:bg-vdcBlack/40 data-selected:bg-slate-200 dark:data-selected:bg-vdcBlack/40 text-${tab.color}`}
              >
                {({ selected }) => (
                  <>
                    <h1 className="block truncate text-center">{tab.name}</h1>
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
  );
}
