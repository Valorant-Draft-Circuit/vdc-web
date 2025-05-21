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

type MenuElement = { query: string; name: string };

export default function ListBox({
  params,
  menuElements,
}: {
  params;
  menuElements;
}) {
  const paramsKey = params.toString().toLowerCase();
  const searchParams = useSearchParams();
  const urlSeason = searchParams.get(paramsKey) ?? menuElements[0].query;
  const router = useRouter();
  const pathname = usePathname();
  const [selected, setSelected] = useState<MenuElement>(
    menuElements.find((m) => m.query === urlSeason) || menuElements[0]
  );
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set(paramsKey, selected.query);
    router.push(`${pathname}?${newParams.toString()}`);
  }, [selected, router, pathname, paramsKey, searchParams]);

  return (
    <div className="xl:px-0 px-10 sm:px-12">
      <Listbox value={selected} onChange={setSelected}>
        <ListboxButton
          className="relative flex flex-row rounded-md py-2 pl-4 pr-8 w-full xl:w-20
         dark:bg-vdcBlack text-sm text-vdcGrey dark:text-vdcWhite outline-1 -outline-offset-1 outline-gray-300 data-hover:cursor-pointer "
        >
          <h2>{`S${selected.name}`}</h2>
          <ChevronDownIcon className="size-4 fill-gray-500 m-auto absolute inset-y-0 right-3 h-5 w-5" />
        </ListboxButton>
        <ListboxOptions
          transition
          className="rounded-sm mt-1 w-full xl:w-20 border border-gray-300 focus:outline-none transition duration-100 ease-in data-leave:data-closed:opacity-0"
        >
          {menuElements.map((element) => (
            <ListboxOption
              key={element.name}
              value={element}
              className="relative rounded-sm group flex cursor-default items-center gap-2 px-3 py-1.5 hover:bg-slate-200 dark:hover:bg-vdcGrey"
            >
              <h1 className="text-sm/6 text-vdcGrey dark:text-vdcWhite italic">{`S${element.name}`}</h1>
              <div className="absolute right-0 pr-3">
                <CheckIcon
                  className={`${
                    element.query === urlSeason ? "visible" : "invisible"
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
