import PlayerRoleSearch from "@/components/staff/tech/roles/PlayerRoleSearch";

export default async function Page() {
  return (
    <div className="min-h-full">
      <div className="flex flex-col gap-5 py-10 px-5">
        <header>
          <div className="flex flex-row mx-auto max-w-7xl px-6 justify-between">
            <h1 className="text-3xl italic text-vdcRed">Tech Lead Page</h1>
          </div>
        </header>
        <main>
          <h1 className="text-vdcRed py-2 mx-auto px-6 max-w-7xl">
            Search / Edit User Roles
          </h1>
          <div className="mx-auto max-w-7xl px-4 py-8  lg:px-8 rounded-lg">
            <PlayerRoleSearch />
          </div>
        </main>
      </div>
    </div>
  );
}
