import Image from "next/image";
import { TeamMapRow } from "./TeamMapTable";

export default function MapTileStrip({
  title,
  rows,
}: {
  title: string;
  rows: TeamMapRow[];
}) {
  return (
    <div className="rounded-md bg-slate-100 dark:bg-vdcGrey p-4 sm:p-5">
      <h2 className="text-sm tracking-wider uppercase font-semibold text-vdcRed mb-2">
        {title}
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
        {rows.map((row) => (
          <div
            key={row.map}
            className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 rounded-md bg-vdcWhite/40 dark:bg-vdcBlack/40 backdrop-blur-sm p-2 sm:pr-4"
          >
            {row.splashUrl ? (
              <div className="relative w-full h-20 sm:w-40 sm:h-16 flex-none rounded overflow-hidden">
                <Image
                  src={row.splashUrl}
                  alt={row.map}
                  fill
                  className="object-cover brightness-50 grayscale"
                />
              </div>
            ) : (
              <div className="w-full h-20 sm:w-40 sm:h-16 flex-none rounded bg-gray-300 dark:bg-vdcBlack/40" />
            )}
            <div className="flex flex-col">
              <h2 className="text-sm">{row.map}</h2>
              {row.banCount > 0 && (
                <h2 className="text-xs text-gray-500 dark:text-gray-400">
                  Banned {row.banCount}x
                </h2>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
