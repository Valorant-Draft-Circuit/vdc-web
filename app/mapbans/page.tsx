import { getActiveTeamsForPicker } from "@/lib/queries/teams/teams";
import MapbanCreateForm from "./MapbanCreateForm";

export default async function Page() {
  const teams = await getActiveTeamsForPicker();
  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <h1 className="mb-6 text-2xl">START A MAP BAN</h1>
      <MapbanCreateForm teams={teams} />
    </div>
  );
}
