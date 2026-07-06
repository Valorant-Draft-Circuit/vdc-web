"use client";

import { useState } from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/solid";
import {
  transactionGroupHexColor,
  transactionGroupLabel,
} from "@/lib/common/transactions";
import {
  TransactionGroup,
  TransactionGroupKey,
} from "@/lib/queries/home/transactions";
import TransactionGroupCard from "./TransactionGroupCard";

type Props = {
  groups: TransactionGroup[];
};

export default function RecentTransactions({ groups }: Props) {
  const [activeGroupKey, setActiveGroupKey] = useState<TransactionGroupKey>(
    groups[0]?.key ?? "LEAGUE",
  );
  const activeGroup =
    groups.find((group) => group.key === activeGroupKey) ?? groups[0];

  return (
    <section className="relative z-20">
      <div className="px-4 py-2 mt-5 sm:px-6 text-lg lg:text-xl">
        <h1>Recent Transactions</h1>
      </div>
      <div className="px-4 py-2 sm:px-6">
        <div className="flex flex-col gap-4 rounded-md bg-slate-100 dark:bg-vdcGrey p-4 sm:p-5">
          <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-3 gap-3">
            {groups.map((group) => (
              <TransactionGroupCard key={group.key} group={group} />
            ))}
          </div>
          <div className="md:hidden flex flex-col gap-3">
            <Listbox value={activeGroupKey} onChange={setActiveGroupKey}>
              <div className="relative">
                <ListboxButton className="relative w-full rounded-md bg-vdcWhite/40 dark:bg-vdcBlack/40 backdrop-blur-sm py-2 pl-3 pr-9 text-left text-sm uppercase tracking-wider font-semibold hover:cursor-pointer">
                  <h2
                    className="truncate"
                    style={{ color: transactionGroupHexColor(activeGroupKey) }}
                  >
                    {transactionGroupLabel(activeGroupKey)}
                  </h2>
                  <ChevronUpDownIcon
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 right-2 my-auto size-5 fill-gray-500"
                  />
                </ListboxButton>
                <ListboxOptions className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-vdcWhite dark:bg-vdcGrey shadow-lg ring-1 ring-black/5 focus:outline-none">
                  {groups.map((group) => (
                    <ListboxOption
                      key={group.key}
                      value={group.key}
                      className="relative cursor-pointer select-none py-2 pl-3 pr-9 text-sm uppercase tracking-wider font-semibold hover:bg-slate-200 dark:hover:bg-vdcBlack/40 data-selected:bg-slate-200 dark:data-selected:bg-vdcBlack/40"
                      style={{ color: transactionGroupHexColor(group.key) }}
                    >
                      {({ selected }) => (
                        <>
                          <h2 className="block truncate">
                            {transactionGroupLabel(group.key)}
                          </h2>
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
            {activeGroup && (
              <TransactionGroupCard key={activeGroup.key} group={activeGroup} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
