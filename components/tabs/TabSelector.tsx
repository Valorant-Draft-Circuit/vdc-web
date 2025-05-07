"use client";

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { useEffect, useState } from "react";
import MobileTabs from "./MobileTabs";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export type TabElements = {
  current?: boolean;
  tier: string;
  color: string;
  content: React.ReactNode;
};

export default function TabSelector(props: { tabElements: TabElements[] }) {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("by")?.toLowerCase();
  const initialIndex = props.tabElements.findIndex(
    (t) => t.tier.toLowerCase() === queryParam
  );
  const [selectedIndex, setSelectedIndex] = useState(
    initialIndex >= 0 ? initialIndex : 0
  );
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (initialIndex !== selectedIndex && initialIndex >= 0) {
      setSelectedIndex(initialIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialIndex]);
  return (
    <>
      <TabGroup
        selectedIndex={selectedIndex}
        onChange={(index) => {
          setSelectedIndex(index);
          const newTier = props.tabElements[index].tier.toLowerCase();
          const newUrl = `${pathname}?by=${newTier}`;
          router.push(newUrl);
        }}
        vertical
        className="flex flex-col xl:flex-row"
      >
        <div className="xl:hidden sticky top-0 z-10 bg-vdcWhite dark:bg-vdcBlack mx-auto w-sm">

            <MobileTabs
              setSelected={setSelectedIndex}
              selected={selectedIndex}
              tabElements={props.tabElements}
            />

        </div>

        <div className="hidden xl:block">
          <div className="flex flex-row gap-2  sticky top-26 self-start">
            <div className="p-4 drop-shadow-lg bg-gray-100 dark:bg-vdcGrey rounded-2xl">
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

        <TabPanels className="w-auto sm:w-xl md:w-2xl xl:w-4xl flex flex-col gap-2 m-auto p-3 rounded-2xl">
          {props.tabElements.map(({ content, tier }) => (
            <TabPanel key={tier}>{content}</TabPanel>
          ))}
        </TabPanels>
      </TabGroup>
    </>
  );
}
