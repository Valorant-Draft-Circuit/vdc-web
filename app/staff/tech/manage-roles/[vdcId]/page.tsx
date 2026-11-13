import UnAuthorized from "@/components/auth/Unauthorized";
import { viewerHasAccess } from "@/lib/auth/guards";
import PlayerCard from "@/components/staff/tech/roles/PlayerCard";
import PlayerRoleSearch from "@/components/staff/tech/roles/PlayerRoleSearch";
import RoleSelector from "@/components/staff/tech/roles/RoleSelector";
import { ROLES, TECH_ACCESS_LIST } from "@/lib/common/constants/roles";
import { getUser } from "@/lib/queries/user/user";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ vdcId: string }>;
}) {
  if (!(await viewerHasAccess(TECH_ACCESS_LIST))) return <UnAuthorized />;
  const { vdcId } = await params;
  const user = await getUser(vdcId);
  if (!user) notFound();
  const userName = user.name;

  const userRoles = BigInt(user.roles);
  const assignedRoles = ROLES.filter((role) => (userRoles & role.value) !== 0n);

  const playerCardProps = {
    id: user?.id,
    image: user?.image,
    discordName: userName,
    riotIGN: user?.Accounts.find(
      (account) => account.providerAccountId === user.primaryRiotAccountID,
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
