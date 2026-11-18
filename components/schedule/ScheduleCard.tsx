import LocalDate from "@/components/common/LocalDate";
import { MATCH_TIME_OPTIONS } from "@/lib/common/format";
import MatchCard from "./MatchCard";

export default function ScheduleCard({
  matchDay,
  season,
}: {
  matchDay;
  season;
}) {
  const [dayLabel, scheduledAt] = matchDay.split("|");
  const matchType =
    season[matchDay][0].knockoutType === "PLAYOFFS"
      ? `${season[matchDay][0].knockoutType} R${season[matchDay][0].playoffRound}`
      : season[matchDay][0].knockoutType === "GRAND FINALS"
        ? season[matchDay][0].knockoutType
        : season[matchDay][0].matchType;

  // Matches at the block's main time come first; any that start at another
  // time or date follow in their own section, in start order.
  const slotTime = new Date(scheduledAt).getTime();
  const startOf = (match) => new Date(match.dateScheduled).getTime();
  const onSlot = season[matchDay].filter((match) => startOf(match) === slotTime);
  const moved = season[matchDay]
    .filter((match) => startOf(match) !== slotTime)
    .sort((a, b) => startOf(a) - startOf(b));

  return (
    <div className="overflow-hidden rounded-lg shadow-sm bg-vdcRed p-3 px-auto">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 px-4 pb-2 sm:px-6 text-vdcWhite text-md xl:text-xl xl:pb-0">
        <h1>
          <LocalDate date={scheduledAt} /> - {dayLabel} - {matchType}
        </h1>
        <h2>
          <LocalDate date={scheduledAt} options={MATCH_TIME_OPTIONS} />
        </h2>
      </div>
      <div className="px-2 sm:p-6 flex flex-col gap-2">
        {onSlot.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
        {moved.length > 0 && (
          <div className="flex items-center gap-3 pt-3 pb-1 text-vdcWhite">
            <span className="h-px flex-1 bg-vdcWhite/50" />
            <h1 className="text-xs tracking-wider">Rescheduled</h1>
            <span className="h-px flex-1 bg-vdcWhite/50" />
          </div>
        )}
        {moved.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            offSlotDate={match.dateScheduled}
          />
        ))}
      </div>
    </div>
  );
}
