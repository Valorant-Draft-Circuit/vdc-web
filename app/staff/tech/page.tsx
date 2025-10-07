import PlayerRoleSearch from "@/components/staff/tech/roles/PlayerRoleSearch";

export default async function Page() {
  return (
    <div className="w-full">
      <h1 className="text-vdcRed py-2 text-left text-xl">Search / Edit User Roles</h1>

      <div className="py-4 rounded-lg">
        <PlayerRoleSearch />
      </div>
    </div>
  );
}
