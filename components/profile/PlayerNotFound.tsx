import { DISCORD_USER_HOWTO_URL } from "@/lib/common/constants";
import Link from "next/link";

export default function PlayerNotFound({ player }: { player }) {
  return (
    <div className="flex min-h-screen justify-center items-center">
      <div className="py-10 max-w-7xl xl:py-12 flex flex-col gap-10 text-center">
        <h1 className="text-vdcRed italic text-3xl">
          Player {player} not found :(
        </h1>
        <h2>
          Please make sure you search by either their Discord ID's or
          RiotIGN#Discriminator!
        </h2>
        <h2>
          Not sure how to get a user's Discord ID? click{" "}
          <Link
            href={DISCORD_USER_HOWTO_URL}
            className="text-vdcRed hover:underline"
          >
            here!
          </Link>{" "}
        </h2>
      </div>
    </div>
  );
}
