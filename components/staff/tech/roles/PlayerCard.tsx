import { ImageWithFallback } from "@/components/player/search/PlayerCard";
import Link from "next/link";

type PlayerCardUser = {
  id: string | undefined;
  image: string | null | undefined;
  discordName: string | null | undefined;
  riotIGN: string | null | undefined;
};

export default function PlayerCard({ user }: { user: PlayerCardUser }) {
  return (
    <Link
      key={user.id}
      href={`/staff/tech/manage-roles/${user.id}`}
      className="hover:brightness-95 gap-2 p-1 text-sm"
    >
      <div className="flex flex-row bg-gradient-to-br from-slate-100 to-slate-300 dark:from-vdcGrey dark:to-vdcBlack gap-4 items-center rounded-xl h-32 w-88">
        <div className="ml-4">
          <ImageWithFallback
            src={user.image ?? "/vdc-flame.svg"}
            fallbackSrc={"/vdc-flame.svg"}
            className="mx-auto size-18 rounded-full"
            alt={`${user.discordName} avatar`}
            width={50}
            height={50}
          />
        </div>
        <div className="flex flex-col mr-4 text-vdcGrey dark:text-gray-300">
          <h2>{user.discordName}</h2>
          {user.riotIGN && <h2>{user.riotIGN}</h2>}
        </div>
      </div>
    </Link>
  );
}
