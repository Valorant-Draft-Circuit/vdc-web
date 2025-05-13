import { DISCORD_USER_HOWTO_URL } from "@/lib/common/constants";
import Link from "next/link";

export default function PlayerNotFound({ player }: { player }) {
  return (
    <div className="flex min-h-screen justify-center items-center">
      <div className="py-10 max-w-7xl xl:py-12 flex flex-col gap-5 text-center">
        <h1 className="text-vdcRed italic text-3xl">
          Player <span className="normal-case">{player}</span> not found :(
        </h1>
        <div className="flex flex-col gap-1">
          <h2 className="text-xl">Please make sure you check your search!</h2>
          <h2 className="text-xl">Valid forms of search are:</h2>
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-xl">Player Discord IDs</h2>
          <h3>
            (Not sure how to get a player&apos;s Discord ID? click{" "}
            <Link
              href={DISCORD_USER_HOWTO_URL}
              className="text-vdcRed hover:underline"
            >
              here!
            </Link>
            )
          </h3>
        </div>
        <h1 className="text-vdcRed text-3xl">OR</h1>
        <div className="flex flex-col gap-1 text-xl">
          <h2>RiotIGN#Tag but replace the &quot;#&quot; with &quot;-&quot;</h2>
          <h3>
            ex) RiotIGN<span className="text-vdcRed font-bold">#</span>VDC =
            RiotIGN
            <span className="text-vdcRed font-bold">-</span>VDC
          </h3>
        </div>
      </div>
    </div>
  );
}
