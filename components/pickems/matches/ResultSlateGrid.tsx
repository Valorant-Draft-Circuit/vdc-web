import TeamMark from "@/components/pickems/common/TeamMark";
import { formatPoints } from "@/lib/pickems/format";
import { legalScores } from "@/lib/pickems/picks";
import type {
  ReadonlyMatch,
  ReadonlySlate,
} from "@/lib/queries/pickems/getReadonlyPicks";

function resultText(match: ReadonlyMatch): string {
  if (!match.result.resolved) {
    return "Awaiting Results";
  }
  const actual = `Actual ${match.result.homeScore}-${match.result.awayScore}`;
  if (match.pick === null) {
    return `${actual} · No pick`;
  }
  if (match.points > 0) {
    return `${actual} · Correct +${formatPoints(match.points)}`;
  }
  return `${actual} · Missed +0`;
}

function pickPillClass(
  isPick: boolean,
  status: ReadonlyMatch["pickStatus"],
): string {
  if (!isPick) {
    return "opacity-50 border-gray-300 text-vdcGrey dark:border-gray-600 dark:text-gray-400";
  }
  if (status === "right") {
    return "bg-vdcGreen border-vdcGreen text-white";
  }
  if (status === "wrong") {
    return "bg-transparent border-vdcRed text-vdcRed";
  }
  return "text-white";
}

function ResultMatchRow({
  match,
  accent,
}: {
  match: ReadonlyMatch;
  accent: string;
}) {
  const scores = legalScores(match.matchType);
  const homeLabel = match.home?.name ?? "TBD";
  const awayLabel = match.away?.name ?? "TBD";
  return (
    <div className="flex flex-col gap-1">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2.5">
        <div className="flex justify-end">
          <TeamMark
            logo={match.home?.logo ?? null}
            slug={match.home?.slug ?? homeLabel}
            name={homeLabel}
            size="size-9"
          />
        </div>
        <div className="flex gap-1">
          {scores.map((score) => {
            const isPick =
              match.pick !== null &&
              score.home === match.pick.home &&
              score.away === match.pick.away;
            const isPending = isPick && match.pickStatus === "pending";
            const pendingStyle = isPending
              ? { backgroundColor: accent, borderColor: accent }
              : undefined;
            return (
              <h2
                key={`${score.home}-${score.away}`}
                className={`w-[46px] rounded-md border py-1.5 text-center text-sm font-bold ${pickPillClass(isPick, match.pickStatus)}`}
                style={pendingStyle}
              >
                {score.home}-{score.away}
              </h2>
            );
          })}
        </div>
        <div className="flex justify-start">
          <TeamMark
            logo={match.away?.logo ?? null}
            slug={match.away?.slug ?? awayLabel}
            name={awayLabel}
            size="size-9"
          />
        </div>
      </div>
      <h2 className="text-center text-[11px] font-normal text-vdcGrey dark:text-gray-400">
        {resultText(match)}
        {match.isRandom && " (random fill)"}
      </h2>
    </div>
  );
}

export default function ResultSlateGrid({
  slates,
  accent,
}: {
  slates: ReadonlySlate[];
  accent: string;
}) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3">
      {slates.map((slate) => (
        <div
          key={slate.matchDay}
          className="flex flex-col rounded-2xl border border-black/10 bg-gray-100 p-4 dark:border-white/10 dark:bg-vdcGrey"
        >
          <div className="mb-2.5 flex items-start justify-between gap-2">
            <div>
              <h2 className="text-sm font-extrabold">
                Match Day {slate.matchDay}
              </h2>
              <p className="text-[11px] font-normal text-vdcGrey dark:text-gray-400">
                {slate.dateLabel}
              </p>
            </div>
            <h2 className="text-right text-[10px] font-normal text-vdcGrey dark:text-gray-400">
              {formatPoints(slate.slatePoints)} pts &middot; {slate.correct}/
              {slate.total}
            </h2>
          </div>
          <div className="flex flex-col gap-2.5">
            {slate.matches.map((match) => (
              <ResultMatchRow
                key={match.matchId}
                match={match}
                accent={accent}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
