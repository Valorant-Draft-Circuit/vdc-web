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

export type TTabElements = {
  current?: boolean;
  query: string;
  name: string;
  color: string;
  content: React.ReactNode;
};

export default function VerticalTab({
  tabElements,
  params,
  defaultQuery,
}: {
  tabElements: TTabElements[];
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
      vertical
      className="flex flex-col xl:flex-row"
    >
      <div className="xl:hidden sticky top-0 z-40 bg-vdcWhite dark:bg-vdcBlack mx-auto w-screen pt-5 px-5 sm:px-12 ">
        <MobileTabs
          tabElements={tabElements}
          selected={selectedIndex}
          onSelect={handleChange}
        />
      </div>

      <div className="hidden xl:block">
        <div className="flex flex-row gap-2 sticky top-26 self-start">
          <div className="p-4 drop-shadow-lg bg-gray-100 dark:bg-vdcGrey rounded-2xl">
            <TabList className="flex flex-col items-start gap-1 rounded-2xl drop-shadow-2xl">
              {tabElements.map(({ name, color }) => (
                <Tab
                  key={name}
                  className={`rounded-lg text-xl text-vdcBlack dark:text-vdcWhite py-1 text-start w-42 px-2 data-hover:bg-gray-300 dark:data-hover:bg-vdcBlack focus:not-data-focus:outline-none data-hover:text-${color} data-hover:cursor-pointer data-selected:bg-gray-300 dark:data-selected:bg-vdcBlack data-selected:text-${color}`}
                >
                  <h1 className="italic">{name}</h1>
                </Tab>
              ))}
            </TabList>
          </div>
        </div>
      </div>

      <TabPanels className="w-auto sm:w-xl md:w-2xl xl:w-4xl flex flex-col gap-2 m-auto p-3 rounded-2xl">
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
  tabElements: TTabElements[];
  selected: number;
  onSelect: (index: number) => void;
}) {
  const selectedTab: TTabElements = tabElements[selected];

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
            className={`w-full italic rounded-md data-hover:cursor-pointer py-2 pl-3 pr-8 text-center text-xl  text-vdcBlack outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-${selectedTab.color} text-${selectedTab.color}`}
          >
            <h1 className="truncate">{selectedTab.name}</h1>
            <ChevronUpDownIcon
              aria-hidden="true"
              className="my-auto pointer-events-none absolute inset-y-0 right-3 h-5 w-5 fill-gray-500"
            />
          </ListboxButton>

          <ListboxOptions className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-md bg-vdcWhite dark:bg-vdcGrey shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
            {tabElements.map((tab) => (
              <ListboxOption
                key={tab.query}
                value={tab}
                className={({ selected }) =>
                  `relative cursor-pointer select-none py-2 pl-3 pr-9 sm:text-xl hover:text-${
                    tab.color
                  } hover:bg-slate-200 ${
                    selected ? `bg-slate-200 text-${tab.color}` : ""
                  }`
                }
              >
                {({ selected }) => (
                  <>
                    <h1
                      className={`block truncate italic text-center ${
                        selected ? "font-semibold" : "font-normal"
                      }`}
                    >
                      {tab.name}
                    </h1>
                    {selected && (
                      <span
                        className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                          selected ? `text-${tab.color}` : "text-vdcRed"
                        }`}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
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
