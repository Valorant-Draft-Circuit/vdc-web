import PlayerCard from "@/components/staff/tech/roles/PlayerCard";
import PlayerRoleSearch from "@/components/staff/tech/roles/PlayerRoleSearch";
import RoleSelector from "@/components/staff/tech/roles/RoleSelector";
import { ROLES } from "@/lib/common/constants";
import { getUser } from "@/lib/queries/user/user";

export default async function Page({
  params,
}: {
  params: Promise<{ vdcId: string }>;
}) {
  const { vdcId } = await params;
  const user = await getUser(vdcId);
  const userName = user?.name;

  const userRoles = BigInt(user!.roles);
  const assignedRoles = ROLES.filter((role) => (userRoles & role.value) !== 0n);

  const playerCardProps = {
    id: user?.id,
    image: user?.image,
    discordName: userName,
    riotIGN: user?.Accounts.find(
      (account) => account.providerAccountId === user.primaryRiotAccountID
    )?.riotIGN,
  };

  return (
    <div className="py-4">
      <div className="max-w-7xl w-full">
        <h1 className="text-vdcRed text-left">Edit {userName}&apos;s Roles</h1>
        <div>
          <PlayerCard user={playerCardProps} />
        </div>
      </div>
      <div className="mt-6 max-w-7xl w-full">
        <RoleSelector defaultRoles={assignedRoles} vdcId={user?.id} />
      </div>
      <div className="mt-10 max-w-7xl w-full">
        <h1 className="text-vdcRed pb-2 text-left">
          Search / Edit another Player&apos;s Roles
        </h1>
        <PlayerRoleSearch />
      </div>
    </div>
  );
}
