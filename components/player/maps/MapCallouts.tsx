import Image from "next/image";
import {
  overallRating,
  winPercent,
  type MapCallouts as MapCalloutsData,
  type MapRow,
} from "@/lib/common/maps";

type Props = {
  callouts: MapCalloutsData;
  isCombine: boolean;
};

function outcomeDetail(row: MapRow, isCombine: boolean): string {
  const rating = `${overallRating(row).toFixed(2)} rating`;
  const games = `${row.gamesPlayed} games`;
  if (isCombine) return `${rating} · ${games}`;
  return `${winPercent(row).toFixed(0)}% WR · ${rating} · ${games}`;
}

type CalloutCardProps = {
  label: string;
  accentClass: string;
  row: MapRow;
  detail: string;
};

function CalloutCard({ label, accentClass, row, detail }: CalloutCardProps) {
  return (
    <div className="relative flex-1 min-h-[140px] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600">
      {row.splashUrl && (
        <Image
          src={row.splashUrl}
          alt={row.map}
          fill
          sizes="(max-width: 640px) 100vw, 33vw"
          className="object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/55 to-black/20 dark:from-black/90 dark:to-black/50" />
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${accentClass}`} />
      <div className="relative flex h-full min-h-[140px] flex-col justify-between p-5">
        <h1 className="text-xs uppercase tracking-wide text-gray-300">
          {label}
        </h1>
        <div>
          <h2 className="text-3xl font-bold text-white">{row.map}</h2>
          <h2 className="mt-1 text-sm text-gray-200">{detail}</h2>
        </div>
      </div>
    </div>
  );
}

export default function MapCallouts({ callouts, isCombine }: Props) {
  const { best, worst, mostPlayed } = callouts;
  if (!best && !worst && !mostPlayed) return null;

  return (
    <div className="flex flex-col sm:flex-row gap-3 mx-2 xl:mx-0">
      {best && (
        <CalloutCard
          label="Best map"
          accentClass="bg-vdcGreen"
          row={best}
          detail={outcomeDetail(best, isCombine)}
        />
      )}
      {worst && (
        <CalloutCard
          label="Worst map"
          accentClass="bg-vdcRed"
          row={worst}
          detail={outcomeDetail(worst, isCombine)}
        />
      )}
      {mostPlayed && (
        <CalloutCard
          label="Most played"
          accentClass="bg-vdcBlue"
          row={mostPlayed}
          detail={`${mostPlayed.gamesPlayed} games · ${overallRating(mostPlayed).toFixed(2)} rating`}
        />
      )}
    </div>
  );
}
