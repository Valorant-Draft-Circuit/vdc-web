"use client";

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type TMenuElement = { query: string; name: string };

export default function ListBox({
  params,
  menuElements,
  defaultDropDownQuery,
}: {
  params: string;
  menuElements: TMenuElement[];
  defaultDropDownQuery: string;
}) {
  const paramsKey = params.toLowerCase();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlParam = searchParams.get(paramsKey) ?? menuElements[0].query;

  const [selected, setSelected] = useState<TMenuElement>(
    menuElements.find((m) => m.query === urlParam) || menuElements[0]
  );

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const current = params.get(paramsKey);

    if (!current) {
      params.set(paramsKey, defaultDropDownQuery.toLowerCase());
      router.replace(`${pathname}?${params.toString()}`);
      return;
    }

    if (current !== selected.query) {
      params.set(paramsKey, selected.query);
      router.push(`${pathname}?${params.toString()}`);
    }
  }, [selected, searchParams]);

  useEffect(() => {
    const newParam = searchParams.get(paramsKey) ?? menuElements[0].query;
    const matched = menuElements.find((m) => m.query === newParam);
    if (matched && matched.query !== selected.query) {
      setSelected(matched);
    }
  }, [searchParams]);

  return (
    <div className="xl:px-0 sm:px-12">
      <Listbox value={selected} onChange={setSelected}>
        <ListboxButton
          className="relative flex flex-row rounded-md py-2 pl-4 pr-8 w-full 
          dark:bg-vdcBlack text-sm text-vdcGrey dark:text-vdcWhite outline-1 -outline-offset-1 outline-gray-300 data-hover:cursor-pointer"
        >
          <h2>{selected.name}</h2>
          <ChevronDownIcon className="size-4 fill-gray-500 m-auto absolute inset-y-0 right-3 h-5 w-5" />
        </ListboxButton>

        <ListboxOptions
          transition
          className="rounded-sm mt-1 w-full border border-gray-300 focus:outline-none transition duration-100 ease-in data-leave:data-closed:opacity-0"
        >
          {menuElements.map((element) => (
            <ListboxOption
              key={element.name}
              value={element}
              className="relative rounded-sm group flex cursor-default items-center gap-2 px-3 py-1.5 hover:bg-slate-200 dark:hover:bg-vdcGrey"
            >
              <h1 className="text-sm/6 text-vdcGrey dark:text-vdcWhite italic">
                {element.name}
              </h1>
              <div className="absolute right-0 pr-3">
                <CheckIcon
                  className={`${
                    element.query === selected.query ? "visible" : "invisible"
                  } size-4 fill-vdcRed`}
                />
              </div>
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Listbox>
    </div>
  );
}
