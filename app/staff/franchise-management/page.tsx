import Contracts from "@/components/staff/FM/Contracts";
import SubUsagePanel from "@/components/staff/FM/SubUsagePanel";

export default async function Page() {
  return (
    <div className="flex flex-col gap-2 px-4 py-2 sm:px-6">
      <section>
        <h1 className="text-lg lg:text-xl py-2">Contracts</h1>
        <Contracts />
      </section>
      <SubUsagePanel />
    </div>
  );
}
