import ListBox from "@/components/tabs/DropDown"

export default async function Settings() {
    const homepageOptions = [
        {query: "home", name: "HOME"},
        {query: "stats", name: "STATS"},
        {query: "schedule", name: "SCHEDULE"},
        {query: "standings", name: "STANDINGS"},
        {query: "team", name: "TEAM"},
        {query: "player", name: "PLAYER"},];
    // const navbarOptions = [
    //     {query: "", name: "Placeholder"},
    // ];
    const timedistOptions = [
        {query: "12-hour", name: "12-HOUR"},
        {query: "24-hour", name: "24-HOUR"},
    ];
    const timezoneOptions = [
        {query: "eastern", name: "EST"},
        {query: "central", name: "CST"},
        {query: "mountain", name: "MST"},
        {query: "pacific", name: "PST"}];

    return(
    <div className="bg-gradient-to-b xl:bg-gradient-to-r from-vdcRed from-50% to-vdcWhite dark:to-vdcGrey to-50% py-8 mx-2 rounded-2xl flex flex-col xl:flex-row space-y-2 shadow-2xl lg:px-0 lg:px lg:ml-0 lg:justify-between lg:my-auto lg:max-w-12/12">
            <div className="flex flex-col w-full"> 
                <div className="xl:items-end mx-10 xl:text-start">
                    <h1 className="italic text-3xl text-vdcBlack"> 
                        Settings 
                    </h1>
                    <h1 className="text-vdcWhite text-md italic text-wrap"> 
                        CUSTOMIZE YOUR VDC WEBSITE EXPERIENCE
                    </h1>
                </div>
                <div className="mx-10">
                    {/* <Image
                        src="/vdc-flame.svg"
                        alt="flame"
                        width={250}
                        height={500}
                        className="absolute inset-1 -z-10 size-full object-cover sm:object-top lg:object-[10%_10%] xl:scale-150 xl:absolute xl:left-20 xl:top-20 brightness-65 "
                    /> */}
                </div>
            
            </div>
            <div className="px-auto sm:p-6 flex flex-col gap-2 w-full italic text-3xl m-auto text-vdcRed transition-all">
                <div>
                    <h1> HOMEPAGE </h1> 
                      { <ListBox params={"homepage"} menuElements={homepageOptions} /> }
                </div>
                {/* <div> 
                    <h1> NAVBAR STYLE </h1>
                    {<ListBox params={"navbar"} menuElements={navbarOptions} /> }
                </div> */}
                <div> 
                    <h1> TIME DISPLAY </h1>
                    {<ListBox params={"timeDisplay"} menuElements={timedistOptions} />}
                </div>
                <div> 
                    <h1> TIME ZONE </h1>
                    { <ListBox params={"timeZone"} menuElements={timezoneOptions} /> }
                </div>
            </div>
        </div>
    )
}