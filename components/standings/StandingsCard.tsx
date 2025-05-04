import { TEAM_LOGOS_URL } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
export type StandingProps = {
  teamLogo: string | null;
  teamName: string;
  wins: number;
  losses: number;
  rwp: number;
  franchiseSlug: string;
};
export default function StandingsCard(props: {
  standing: StandingProps;
  rank: number;
  isFranchise: boolean;
}) {
  let highlight = 3;
  if (props.isFranchise) {
    highlight = 3;
  }
  return (
    <>
      <Link href={`/about/franchise/${props.standing.franchiseSlug}`}>
        <div className="hover:cursor-pointer hover:scale-102 transition-transform ease-in-out duration-150 flex flex-row gap-10 rounded-2xl w-full bg-vdcWhite dark:bg-vdcGrey py-2 px-24 drop-shadow-lg">
          <div className="my-auto">
            <h1
              className={`${
                props.rank <= highlight ? "text-vdcRed" : ""
              } italic text-6xl min-w-17`}
            >
              {props.rank}
            </h1>
          </div>
          <div className="flex my-auto drop-shadow-md">
            <Image
              src={`${TEAM_LOGOS_URL}${props.standing.teamLogo}`}
              alt={props.standing.teamName}
              width={50}
              height={50}
              className="w-full drop-shadow-md"
            />
          </div>
          <div className="flex flex-col my-auto">
            <h1 className="italic text-2xl">{props.standing.teamName}</h1>
            <h1 className="italic text-sm">
              {props.standing.wins}W {props.standing.losses}L
            </h1>
            <h1 className="italic text-sm">RWP: {props.standing.rwp}%</h1>
          </div>
        </div>
      </Link>
    </>
  );
}
