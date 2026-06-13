import Image from "next/image";
import Link from "next/link";
import { MatchType } from "@prisma/client";
import { TEAM_LOGOS_URL } from "@/lib/common/constants";
import { Slot, SeriesSide } from "@/lib/common/bracket";

function TeamLogo({ logo, alt }: { logo: string | null; alt: string }) {
  if (!logo) {
    return (
      <div className="w-5 h-5 rounded bg-gray-300 dark:bg-gray-700 flex-none" />
    );
  }
  return (
    <Image
      src={`${TEAM_LOGOS_URL}${logo}`}
      alt={alt}
      width={40}
      height={40}
      className="w-5 h-5 flex-none object-contain"
    />
  );
}

function TeamRow({
  side,
  tier,
  showWinner,
}: {
  side: SeriesSide;
  tier: string;
  showWinner: boolean;
}) {
  const dim = showWinner && !side.isWinner;
  const highlight = showWinner && side.isWinner;
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 ${
        highlight ? "bg-vdcRed/10" : ""
      }`}
    >
      <span
        className={`w-4 text-xs text-center flex-none ${
          dim ? "text-gray-400" : "text-gray-500"
        }`}
      >
        {side.team.seed}
      </span>
      <TeamLogo logo={side.team.logo} alt={side.team.franchiseSlug} />
      <Link
        href={`/franchises/${side.team.franchiseSlug}?team=${tier}`}
        className={`flex-1 truncate text-sm hover:underline pointer-events-auto ${
          highlight ? "font-bold" : ""
        } ${dim ? "text-gray-400" : ""}`}
      >
        {side.team.name}
      </Link>
      <span
        className={`w-4 text-center text-sm font-bold flex-none ${
          highlight ? "text-vdcRed" : dim ? "text-gray-400" : ""
        }`}
      >
        {side.score}
      </span>
    </div>
  );
}

function EmptyRow({ team }: { team?: SeriesSide["team"] }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <span className="w-4 text-xs text-center flex-none text-gray-400">
        {team?.seed ?? "-"}
      </span>
      <div className="w-5 h-5 rounded bg-gray-200 dark:bg-gray-800 flex-none" />
      <span className="flex-1 truncate text-sm italic text-gray-400">
        {team?.name ?? "TBD"}
      </span>
      <span className="w-4 text-center text-sm flex-none text-gray-400">·</span>
    </div>
  );
}

export default function MatchupCard({
  slot,
  tier,
}: {
  slot: Slot;
  tier: string;
}) {
  if (slot.kind === "tbd") {
    return (
      <div className="bracket-match rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
        <EmptyRow />
        <div className="border-t border-gray-200 dark:border-gray-700" />
        <EmptyRow />
      </div>
    );
  }

  if (slot.kind === "bye") {
    return (
      <div className="bracket-match rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 px-3 py-2">
          <span className="w-4 text-xs text-center flex-none text-gray-500">
            {slot.team.seed}
          </span>
          <TeamLogo logo={slot.team.logo} alt={slot.team.franchiseSlug} />
          <Link
            href={`/franchises/${slot.team.franchiseSlug}?team=${tier}`}
            className="flex-1 truncate text-sm hover:underline"
          >
            {slot.team.name}
          </Link>
          <span className="text-[10px] uppercase tracking-wide text-gray-400 flex-none">
            Bye
          </span>
        </div>
      </div>
    );
  }

  const isFinal = slot.matchType === MatchType.BO5;
  const showWinner = slot.status === "complete";

  return (
    <div
      className={`bracket-match relative rounded-lg border ${
        isFinal
          ? "border-vdcYellow"
          : "border-gray-200 dark:border-gray-700"
      }`}
    >
      {slot.matchId != null && (
        <Link
          href={`/match/${slot.matchId}`}
          aria-label="Open match details"
          className="absolute inset-0"
        />
      )}
      {(isFinal || slot.status === "live") && (
        <span
          className={`absolute -top-2 left-3 z-10 text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded ${
            slot.status === "live"
              ? "bg-green-600 text-white"
              : "bg-vdcYellow text-black"
          }`}
        >
          {slot.status === "live"
            ? `Live ${slot.home.score}-${slot.away.score}`
            : "Best of 5"}
        </span>
      )}
      <div className="relative pointer-events-none">
        <TeamRow side={slot.home} tier={tier} showWinner={showWinner} />
        <div className="border-t border-gray-200 dark:border-gray-700" />
        <TeamRow side={slot.away} tier={tier} showWinner={showWinner} />
      </div>
    </div>
  );
}
