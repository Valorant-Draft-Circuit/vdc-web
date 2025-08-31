import MyTeamCard from "./MyTeamCard"
import StatsCard from "./StatsCard"
import UpcomingMatchCard from "./UpcomingMatchCard"
import Image from "next/image";

export default async function DashboardPanel() {
    return(
        <div className="bg-vdcRed py-8 mx-2 rounded-2xl flex flex-row space-y-2 shadow-2xl lg:px-0 lg:px lg:ml-0 lg:justify-between lg:my-auto lg:max-w-12/12">
            <div className="flex flex-col padding-20px"> 
                <div className="items-end space-x-4 mx-10">
                    <h1 className="italic text-3xl text-vdcBlack"> 
                        Dashboard 
                    </h1>
                    <p className="text-vdcWhite text-md italic px-10 text-start xl:w-96 lg:pr-8"> 
                        Everything you've ever wanted to know about yourself in VDC. 
                    </p>
                </div>
                    {/* <Image
                        src="/vdc-flame.svg"
                        alt="flame"
                        width={250}
                        height={500}
                        className="absolute inset-1 -z-10 size-full object-cover sm:object-top lg:object-[10%_10%] xl:scale-150 xl:absolute xl:left-20 xl:top-20 brightness-65 "
                    /> */}
            </div>
            <div className="px-auto sm:p-6 flex flex-col gap-2 bg-vdcGreen">
                <div>
                    <h1> My Stats </h1>
                     <StatsCard /> 
                </div>
                <div> 
                    <h1> My Upcoming Matches </h1>
                    <UpcomingMatchCard /> 
                </div>
                <div> 
                    <h1> My Team </h1>
                    <MyTeamCard /> 
                </div>
            </div>
        </div>
    )
}