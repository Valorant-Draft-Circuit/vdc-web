"use client";
import { StandingsTab } from "@/app/standings/page";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { useState } from "react";
import MobileTabs from "./MobileTabs";

export default function TabSelector(props: { tabElements: StandingsTab[] }) {
  const initial = props.tabElements.findIndex((t) => t.current);
  const [selectedIndex, setSelectedIndex] = useState(
    initial >= 0 ? initial : 0
  );
  return (
    <>
      <TabGroup
        as="div"
        selectedIndex={selectedIndex}
        onChange={setSelectedIndex}
        vertical
        className="flex flex-col xl:flex-row "
      >
        <MobileTabs
          setSelected={setSelectedIndex}
          selected={selectedIndex}
          tabElements={props.tabElements}
        />

        <div className="hidden xl:block">
          <div className="flex flex-row gap-2">
            <div className="sticky top-24 self-start p-4 drop-shadow-lg bg-gray-100 dark:bg-vdcGrey rounded-2xl ">
              <TabList className="flex flex-col items-start gap-1 rounded-2xl drop-shadow-2xl">
                {props.tabElements.map(({ tier, color }) => (
                  <Tab
                    key={tier}
                    className={`rounded-lg text-xl text-vdcBlack dark:text-vdcWhite py-1 text-start w-42 px-2 data-hover:bg-gray-300 dark:data-hover:bg-vdcBlack focus:not-data-focus:outline-none data-hover:text-${color} data-hover:cursor-pointer data-selected:bg-gray-300 dark:data-selected:bg-vdcBlack data-selected:text-${color}`}
                  >
                    <h1 className="italic">{tier}</h1>
                  </Tab>
                ))}
              </TabList>
            </div>
          </div>
        </div>

        <TabPanels className="w-auto xl:w-4xl flex flex-col gap-2 m-auto p-3 rounded-2xl">
          {props.tabElements.map(({ content, tier }) => (
            <TabPanel key={tier}>{content}</TabPanel>
          ))}
        </TabPanels>
      </TabGroup>
    </>
  );
}
