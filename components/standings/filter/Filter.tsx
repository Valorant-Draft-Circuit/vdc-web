import { getAllTeamsByTierCached } from "@/lib/common/cache";
import { Field, Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { FunnelIcon } from "@heroicons/react/24/outline";
import { Tier } from "@prisma/client";
import FilterContent from "./FilterContent";

export default async function Filter(props: { tier: Tier }) {
  const allTeamsByTier = await getAllTeamsByTierCached(props.tier);
  const teamNames = allTeamsByTier.map((team) => team.name)

  return (
    <div className="flex">
      <div className="flex gap-8 xl:hidden">
        <Popover>
          <PopoverButton className="flex flex-row focus:outline-none bg-gray-200 dark:bg-vdcGrey px-5 py-2 rounded-md hover:cursor-pointer hover:scale-105 transition duration-200 ease-in-out">
            <FunnelIcon className="text-vdcBlack dark:text-vdcWhite h-5 w-5 my-auto" />
            <h1 className="italic">Filter</h1>
          </PopoverButton>
          <PopoverPanel
            transition
            anchor="bottom"
            className="rounded-xl ml-5 bg-gray-200 transition duration-200 ease-in-out [--anchor-gap:--spacing(5)] data-closed:-translate-y-1 data-closed:opacity-0"
          >
            <div className="p-3">
              <Field>
                {teamNames.map((teamName, index) => (
                  <FilterContent filterBy={teamName} index={index} key={index} />
                ))}
              </Field>
            </div>
          </PopoverPanel>
        </Popover>
      </div>
    </div>
  );
}
