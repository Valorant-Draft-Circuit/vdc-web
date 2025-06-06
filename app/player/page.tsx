import Search from "@/components/player/search/Search";
import { ControlPanel } from "@/prisma";

export default async function Page() {
  const mmrShow = await ControlPanel.getMMRDisplayState();
  return (
    <div className="mx-auto py-10 max-w-7xl xl:py-12 flex flex-col gap-10">
      <Search mmrShow={mmrShow} />
    </div>
  );
}
