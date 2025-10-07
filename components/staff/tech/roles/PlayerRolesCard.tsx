import { ImageWithFallback } from "@/components/player/search/PlayerCard";

export default function PlayerRolesCard({ user }) {
  console.log(user);

  return (
    <div className="flex items-center">
      <div className="flex flex-row bg-gradient-to-br from-slate-100 to-slate-300 dark:from-vdcGrey dark:to-vdcBlack gap-4 px-2 py-10 items-center rounded-xl h-32 w-96">
        <div className="ml-4">
          <ImageWithFallback
            src={user.image}
            fallbackSrc={"/vdc-flame.svg"}
            className="mx-auto size-24 rounded-full"
            alt={`${user.discordName} avatar`}
            width={50}
            height={50}
          />
        </div>
        <div className="flex flex-col mr-4">
          <h2 className="text-[#5865F2]">{user.discordName}</h2>
          {user.riotIGN && <h2 className="text-[#DB1515]">{user.riotIGN}</h2>}
        </div>
      </div>
    </div>
  );
}
