// components/MobileTabs.tsx
"use client";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/solid";
import { TabElement } from "../types";

export default function MobileTabs({
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
    <div className="grid grid-cols-1 w-full">
      <Listbox
        value={selectedTab}
        onChange={(tab) => {
          const idx = tabElements.findIndex((t) => t.query === tab.query);
          if (idx >= 0) onSelect(idx);
        }}
      >
        <div className="relative">
          <ListboxButton
            className={`w-full rounded-md py-2 pl-3 pr-8 text-center text-xl text-vdcBlack outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-${selectedTab.color} text-${selectedTab.color}`}
          >
            <h1 className="truncate">{selectedTab.name}</h1>
            <ChevronUpDownIcon
              aria-hidden="true"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 fill-gray-500"
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
                      className={`block truncate text-center ${
                        selected ? "font-semibold" : "font-normal"
                      }`}
                    >
                      {tab.name}
                    </h1>
                    {selected && (
                      <span
                        className={`absolute inset-y-0 right-0 flex items-center pr-4 text-${tab.color}`}
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
