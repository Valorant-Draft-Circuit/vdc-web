import { NoSymbolIcon } from "@heroicons/react/16/solid";
import { getMapBanNoticeByIgn } from "@/lib/queries/staff/mapBans";

export default async function MapBanBanner({ ign }: { ign: string }) {
  const notice = await getMapBanNoticeByIgn(ign);
  if (!notice) return null;

  const mapsWord = notice.totalRemaining === 1 ? "map" : "maps";
  return (
    <div className="mx-2 flex items-center gap-2 rounded-md border border-vdcRed/40 bg-vdcRed/10 px-4 py-2.5">
      <NoSymbolIcon className="size-4 flex-none text-vdcRed" />
      <h2 className="text-sm font-bold text-vdcRed">
        Map banned: {notice.totalRemaining} {mapsWord} remaining
        {notice.paused ? " (paused)" : ""}
      </h2>
    </div>
  );
}
