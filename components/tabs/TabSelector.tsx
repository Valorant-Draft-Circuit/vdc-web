import { StandingsTab } from "@/app/standings/page";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";

export default async function TabSelector(props: {
  tabElements: StandingsTab[];
}) {
  return (
    <>
      <TabGroup vertical className="">
        <div className="flex flex-row gap-2">
          <div className="hidden xl:block sticky top-24 self-start p-4 drop-shadow-lg bg-gray-100 dark:bg-vdcGrey rounded-2xl ">
            <TabList className="flex flex-col items-start gap-1 rounded-2xl drop-shadow-2xl">
              {props.tabElements.map(({ tier, color }) => (
                <Tab
                  key={tier}
                  className={`rounded-lg text-xl text-vdcBlack dark:text-vdcWhite py-1 text-start w-42 px-2 data-hover:bg-gray-300 dark:data-hover:bg-vdcBlack focus:not-data-focus:outline-none data-hover:${color} data-hover:cursor-pointer data-selected:bg-gray-300 dark:data-selected:bg-vdcBlack data-selected:text-vdcRed`}
                >
                  <h1 className="italic">{tier}</h1>
                </Tab>
              ))}
            </TabList>
          </div>
          <TabPanels className="w-4xl flex flex-col gap-2 m-auto p-3 rounded-2xl bg-vdcRed">
            {props.tabElements.map(({ content, tier }) => (
              <TabPanel key={tier}>{content}</TabPanel>
            ))}
          </TabPanels>
        </div>
      </TabGroup>
    </>
  );
}
