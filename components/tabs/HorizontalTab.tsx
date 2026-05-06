"use client";

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { useEffect, useState } from "react";
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
  color: string;
  name: string;
  content: React.ReactNode;
};

export default function HorizontalTab({
  tabElements,
  params,
  defaultQuery,
}: {
  tabElements: TTabElements[];
  params: string;
  defaultQuery?: string;
}) {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get(params)?.toLowerCase();

  const fallbackQuery =
    defaultQuery?.toLowerCase() || tabElements[0].query.toLowerCase();
  const effectiveQuery = queryParam || fallbackQuery;

  useEffect(() => {
    if (!queryParam) {
      replaceParam(params, fallbackQuery);
    }
  }, [queryParam]);

  const initialIndex = tabElements.findIndex(
    (t) => t.query.toLowerCase() === effectiveQuery,
  );

  const [selectedIndex, setSelectedIndex] = useState(
    initialIndex >= 0 ? initialIndex : 0,
  );
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (initialIndex !== selectedIndex && initialIndex >= 0) {
      setSelectedIndex(initialIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialIndex]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const replaceParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      <TabGroup
        selectedIndex={selectedIndex}
        onChange={(index) => {
          setSelectedIndex(index);
          const newQuery = tabElements[index].query.toLowerCase();
          updateParam(params, newQuery);
        }}
        className="flex flex-col xl:flex"
      >
        <div className="xl:hidden sticky top-0 z-40 bg-vdcWhite dark:bg-vdcBlack mx-auto w-full pt-5 px-10 sm:px-12 ">
          <MobileTabs
            setSelected={(idx: number) => {
              setSelectedIndex(idx);
              updateParam(params, tabElements[idx].query.toLowerCase());
            }}
            selected={selectedIndex}
            tabElements={tabElements}
          />
        </div>

        <div className="hidden xl:block">
          <div className="flex flex-row gap-2 sticky top-26 self-start">
            <div className="p-2 drop-shadow-lg bg-gray-100 dark:bg-vdcGrey rounded-md w-full">
              <TabList className="flex flex-row items-start gap-5 rounded-2xl drop-shadow-2xl">
                {tabElements.map(({ name, color }) => (
                  <Tab
                    key={name}
                    className={`text-xl border-b-2 text-vdcBlack dark:text-vdcWhite py-1 text-center mx-auto px-5 focus:not-data-focus:outline-none data-hover:text-${color} data-hover:border-${color} data-hover:cursor-pointer data-selected:text-${color}`}
                  >
                    <h1 className="italic">{name}</h1>
                  </Tab>
                ))}
              </TabList>
            </div>
          </div>
        </div>

        <TabPanels className="flex flex-col gap-2 p-3 xl:px-0 ">
          {tabElements.map(({ content, query: query }) => (
            <TabPanel key={query}>{content}</TabPanel>
          ))}
        </TabPanels>
      </TabGroup>
    </>
  );
}

export function MobileTabs({
  tabElements,
  setSelected,
  selected,
}: {
  tabElements;
  setSelected;
  selected;
}) {
  const selectedTab = tabElements[selected];

  return (
    <div className="grid grid-cols-1 xl:hidden w-full">
      <Listbox
        value={selectedTab}
        onChange={(tab) => {
          const idx = tabElements.findIndex((t) => t.query === tab.query);
          if (idx >= 0) setSelected(idx);
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

          <ListboxOptions className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-vdcWhite dark:bg-vdcGrey shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
            {tabElements.map((tab) => (
              <ListboxOption
                key={tab.query}
                value={tab}
                className={({ selected }) =>
                  `relative  cursor-pointer select-none py-2 pl-3 pr-9 sm:text-xl hover:text-${
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
