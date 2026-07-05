import Image from "next/image";
import Link from "next/link";
import { MatchType } from "@prisma/client";
import { TEAM_LOGOS_URL } from "@/lib/common/constants/urls";
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
      <h1
        className={`w-4 text-xs text-center flex-none ${
          dim ? "text-gray-400" : "text-gray-500"
        }`}
      >
        {side.team.seed}
      </h1>
      <TeamLogo logo={side.team.logo} alt={side.team.franchiseSlug} />
      <Link
        href={`/franchises/${side.team.franchiseSlug}?team=${tier}`}
        className={`flex-1 truncate text-sm hover:underline pointer-events-auto ${
          highlight ? "font-bold" : ""
        } ${dim ? "text-gray-400" : ""}`}
      >
        <h2>{side.team.name}</h2>
      </Link>
      <h1
        className={`w-4 text-center text-sm font-bold flex-none ${
          highlight ? "text-vdcRed" : dim ? "text-gray-400" : ""
        }`}
      >
        {side.score}
      </h1>
    </div>
  );
}

function EmptyRow({ team }: { team?: SeriesSide["team"] }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <h2 className="w-4 text-xs text-center flex-none text-gray-400">
        {team?.seed ?? "-"}
      </h2>
      {team ? (
        <TeamLogo logo={team.logo} alt={team.franchiseSlug} />
      ) : (
        <div className="w-5 h-5 rounded bg-gray-200 dark:bg-gray-800 flex-none" />
      )}
      <h2 className="flex-1 truncate text-sm italic text-gray-400">
        {team?.name ?? "TBD"}
      </h2>
      <h2 className="w-4 text-center text-sm flex-none text-gray-400">·</h2>
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
      <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
        <EmptyRow team={slot.home} />
        <div className="border-t border-gray-200 dark:border-gray-700" />
        <EmptyRow team={slot.away} />
      </div>
    );
  }

  if (slot.kind === "bye") {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 px-3 py-2">
          <p className="w-4 text-xs text-center flex-none text-gray-500">
            {slot.team?.seed ?? "-"}
          </p>
          {slot.team ? (
            <>
              <TeamLogo logo={slot.team.logo} alt={slot.team.franchiseSlug} />
              <Link
                href={`/franchises/${slot.team.franchiseSlug}?team=${tier}`}
                className="flex-1 truncate"
              >
                <h2 className="truncate text-sm hover:underline">
                  {slot.team.name}
                </h2>
              </Link>
            </>
          ) : (
            <>
              <div className="w-5 h-5 rounded bg-gray-200 dark:bg-gray-800 flex-none" />
              <h2 className="flex-1 truncate text-sm italic text-gray-400">
                TBD
              </h2>
            </>
          )}
          <h1 className="text-[10px] uppercase tracking-wide text-gray-400 flex-none">
            Bye
          </h1>
        </div>
      </div>
    );
  }

  const isFinal = slot.matchType === MatchType.BO5;
  const showWinner = slot.status === "complete";

  return (
    <div
      className={`relative rounded-lg border ${
        isFinal ? "border-vdcYellow" : "border-gray-200 dark:border-gray-700"
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
        <h2
          className={`absolute -top-2 left-3 z-10 text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded ${
            slot.status === "live"
              ? "bg-green-600 text-white"
              : "bg-vdcYellow text-black"
          }`}
        >
          {slot.status === "live"
            ? `In Progress ${slot.home.score}-${slot.away.score}`
            : "Best of 5"}
        </h2>
      )}
      <div className="relative pointer-events-none">
        <TeamRow side={slot.home} tier={tier} showWinner={showWinner} />
        <div className="border-t border-gray-200 dark:border-gray-700" />
        <TeamRow side={slot.away} tier={tier} showWinner={showWinner} />
      </div>
    </div>
  );
}
