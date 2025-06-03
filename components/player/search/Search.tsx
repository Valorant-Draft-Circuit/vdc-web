"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@headlessui/react";
import { useDebouncedCallback } from "use-debounce";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import { SearchType } from "@/app/player/page";

export default function PlayerSearch() {
  const [searchType, setSearchType] = useState<SearchType>(SearchType.RIOT_IGN);
  const [ign, setIgn] = useState("");
  const [tag, setTag] = useState("");
  const [discordId, setDiscordId] = useState("");

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setIgn("");
    setTag("");
    setDiscordId("");

    const params = new URLSearchParams(searchParams);
    params.delete("user");
    router.replace(`${pathname}?${params.toString()}`);
  }, [searchType]);

  return (
    <div className="flex xl:flex-row flex-col-reverse gap-2 justify-end">
      <InputTypes
        searchType={searchType}
        ign={ign}
        setIgn={setIgn}
        tag={tag}
        setTag={setTag}
        discordId={discordId}
        setDiscordId={setDiscordId}
      />
      <div className="self-end xl:self-auto">
        <SelectSearch searchType={searchType} setSearchType={setSearchType} />
      </div>
    </div>
  );
}

function InputTypes({
  searchType,
  ign,
  setIgn,
  tag,
  setTag,
  discordId,
  setDiscordId,
}: {
  searchType: SearchType;
  ign: string;
  setIgn: (val: string) => void;
  tag: string;
  setTag: (val: string) => void;
  discordId: string;
  setDiscordId: (val: string) => void;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const params = new URLSearchParams(searchParams);

  useEffect(() => {
    if (searchType !== SearchType.RIOT_IGN) return;
    let riotIgn = ign;
    if (tag) riotIgn = `${ign}#${tag}`;

    if (riotIgn) {
      params.set("user", riotIgn);
    } else {
      params.delete("user");
    }

    replace(`${pathname}?${params.toString()}`);
  }, [ign, tag, searchType]);

  const updateUrl = useDebouncedCallback((id: string) => {
    const params = new URLSearchParams(searchParams);
    if (id.trim()) {
      params.set("user", id.trim());
    } else {
      params.delete("user");
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  if (searchType === SearchType.RIOT_IGN) {
    return (
      <div className="flex flex-row text-sm my-auto gap-1">
        <Input
          id="ign"
          placeholder={searchType}
          value={ign}
          onChange={(e) => setIgn(e.target.value)}
          className="block w-full rounded-md border px-3 py-2 text-vdcGrey outline-none focus:ring-2 focus:ring-vdcRed bg-white"
        />
        <div className="m-auto text-center">
          <h1 className="text-2xl">#</h1>
        </div>
        <Input
          id="tag"
          placeholder={"NA1"}
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className="block w-1/3 rounded-md border px-3 py-2 text-vdcGrey outline-none focus:ring-2 focus:ring-vdcRed bg-white"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-row text-sm my-auto gap-2">
      <Input
        id="discordId"
        placeholder={searchType}
        onChange={(e) => {
          const val = e.target.value;
          setDiscordId(val);
          updateUrl(val);
        }}
        value={discordId}
        className="block w-full rounded-md border px-3 py-2 text-vdcGrey outline-none focus:ring-2 focus:ring-vdcRed bg-white"
      />
    </div>
  );
}

function SelectSearch({
  searchType,
  setSearchType,
}: {
  searchType: SearchType | undefined;
  setSearchType: (value: SearchType) => void;
}) {
  const options = Object.entries(SearchType).map(([key, value]) => ({
    key: key,
    value: value,
  }));

  return (
    <Listbox value={searchType} onChange={setSearchType}>
      <div className="relative mr-auto">
        <div className="inline-flex divide-x divide-vdcRed rounded-md outline-hidden">
          <div className="inline-flex items-center gap-x-1.5 rounded-l-md bg-vdcRed px-3 py-2">
            <h1 className="text-xs text-vdcWhite">{searchType}</h1>
          </div>
          <ListboxButton className="inline-flex items-center hover:cursor-pointer rounded-l-none rounded-r-md bg-vdcRed p-2 outline-hidden hover:bg-vdcRed/90 focus-visible:outline-2 focus-visible:outline-vdcRed/40">
            <ChevronDownIcon
              aria-hidden="true"
              className="size-5 text-white forced-colors:text-[Highlight]"
            />
          </ListboxButton>
        </div>

        <ListboxOptions
          transition
          className="absolute right-0 z-10 mt-2 w-52 origin-top-right divide-y  divide-gray-200 overflow-hidden rounded-md bg-white dark:bg-vdcGrey dark:divide-vdcBlack shadow-lg ring-1 ring-black/5 focus:outline-hidden data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0"
        >
          {options.map((option, index) => (
            <ListboxOption
              key={index}
              value={option.value}
              className="group cursor-default p-4 text-sm hover:cursor-pointer select-none data-focus:bg-vdcRed/90 data-focus:text-white"
            >
              <div className="flex flex-col">
                <div className="flex justify-between">
                  <h2 className="font-normal group-data-selected:font-semibold">
                    {option.value}
                  </h2>
                  <span className="text-vdcRed group-not-data-selected:hidden group-data-focus:text-white">
                    <CheckIcon aria-hidden="true" className="size-5" />
                  </span>
                </div>
              </div>
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  );
}
