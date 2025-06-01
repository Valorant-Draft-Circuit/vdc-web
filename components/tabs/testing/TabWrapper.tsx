"use client";

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import MobileTabs from "./MobileTabs";

export type TTabElements = {
  current?: boolean;
  query: string;
  name: string;
  color: string;
  content: React.ReactNode;
};

export default function TabWrapper({
  tabElements,
  params,
  tabListOrientation = "horizontal",
}: {
  tabElements: TTabElements[];
  params: string;
  tabListOrientation?: "horizontal" | "vertical";
}) {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get(params)?.toLowerCase();
  const initialIndex = tabElements.findIndex(
    (t) => t.query.toLowerCase() === queryParam
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
  }, [initialIndex, selectedIndex]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleChange = (index: number) => {
    setSelectedIndex(index);
    updateParam(params, tabElements[index].query.toLowerCase());
  };

  return (
    <TabGroup
      selectedIndex={selectedIndex}
      onChange={handleChange}
      vertical={tabListOrientation === "vertical"}
      className={`flex ${
        tabListOrientation === "vertical" ? "flex-col xl:flex-row" : "flex-col"
      }`}
    >
      <div className="xl:hidden sticky top-0 z-10 bg-vdcWhite dark:bg-vdcBlack w-full pt-5 px-5 sm:px-12">
        <MobileTabs
          selected={selectedIndex}
          tabElements={tabElements}
          onSelect={handleChange}
        />
      </div>

      <div className="hidden xl:block">
        <div className="flex gap-2 sticky top-26 self-start">
          <div className="p-4 drop-shadow-lg bg-gray-100 dark:bg-vdcGrey rounded-2xl">
            <TabList
              className={`${
                tabListOrientation === "vertical"
                  ? "flex-col items-start"
                  : "flex-row items-center"
              } flex gap-1 rounded-2xl drop-shadow-2xl`}
            >
              {tabElements.map(({ name, color }) => (
                <Tab
                  key={name}
                  className={`rounded-lg text-xl text-vdcBlack dark:text-vdcWhite py-1 px-2 ${
                    tabListOrientation === "vertical"
                      ? "w-42 text-start"
                      : "text-center mx-auto"
                  } focus:not-data-focus:outline-none data-hover:cursor-pointer data-hover:text-${color} data-selected:text-${color}`}
                >
                  <h1 className="italic">{name}</h1>
                </Tab>
              ))}
            </TabList>
          </div>
        </div>
      </div>

      <TabPanels className="flex flex-col gap-2 p-3 xl:px-0 w-full">
        {tabElements.map(({ content, query }) => (
          <TabPanel key={query}>{content}</TabPanel>
        ))}
      </TabPanels>
    </TabGroup>
  );
}
