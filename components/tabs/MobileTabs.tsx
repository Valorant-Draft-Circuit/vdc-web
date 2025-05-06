import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/24/solid";

export default function MobileTabs(props: {
  tabElements;
  setSelected;
  selected;
}) {
  const selectedTab = props.tabElements[props.selected];

  return (
    <div className="grid grid-cols-1 xl:hidden mb-4">
      <Listbox
        value={selectedTab}
        onChange={(tab) => {
          const idx = props.tabElements.findIndex((t) => t.tier === tab.tier);
          if (idx >= 0) props.setSelected(idx);
        }}
      >
        <div className="relative col-start-1 row-start-1">
          <ListboxButton
            className={`w-full rounded-md  data-hover:cursor-pointer py-2 pl-3 pr-8 text-center text-xl italic text-vdcBlack outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-${selectedTab.color} text-${selectedTab.color}`}
          >
            <h1 className="truncate">{selectedTab.tier}</h1>
            <ChevronUpDownIcon
              aria-hidden="true"
              className="my-auto pointer-events-none absolute inset-y-0 right-3 h-5 w-5 fill-gray-500"
            />
          </ListboxButton>

          <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-vdcWhite dark:bg-vdcGrey shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
            {props.tabElements.map((tab) => (
              <ListboxOption
                key={tab.tier}
                value={tab}
                className={({ selected }) =>
                  `relative  cursor-pointer select-none py-2 pl-3 pr-9 hover:text-${
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
                      {tab.tier}
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
