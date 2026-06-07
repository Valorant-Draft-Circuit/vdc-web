"use client";

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type MenuElement = { query: string; name: string };

export default function ListBox({
  params,
  menuElements,
  defaultDropDownQuery,
}: {
  params: string;
  menuElements: MenuElement[];
  defaultDropDownQuery: string;
}) {
  const paramsKey = params.toLowerCase();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const queryValue =
    searchParams.get(paramsKey) ?? defaultDropDownQuery.toLowerCase();
  const selected =
    menuElements.find(
      (m) => m.query.toString().toLowerCase() === queryValue.toLowerCase(),
    ) ?? menuElements[0];

  const handleChange = (next: MenuElement) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set(paramsKey, next.query.toString().toLowerCase());
    router.push(`${pathname}?${nextParams.toString()}`, { scroll: false });
  };

  return (
    <div className="xl:px-0 sm:px-12 relative">
      <Listbox value={selected} onChange={handleChange}>
        <ListboxButton
          className="relative flex flex-row rounded-md py-2 pl-4 pr-8 w-full
          dark:bg-vdcBlack text-sm text-vdcGrey dark:text-vdcWhite outline-1 -outline-offset-1 outline-gray-300 data-hover:cursor-pointer"
        >
          <h2>{selected.name}</h2>
          <ChevronDownIcon className="size-4 fill-gray-500 m-auto absolute inset-y-0 right-3 h-5 w-5" />
        </ListboxButton>

        <ListboxOptions
          transition
          className="z-50 absolute bg-vdcWhite dark:bg-vdcBlack rounded-sm mt-1 w-full border border-gray-300 focus:outline-none transition duration-100 ease-in data-leave:data-closed:opacity-0"
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
