import Image from "next/image";
import Link from "next/link";
import { TEAM_LOGOS_URL } from "@/lib/common/constants/urls";
import { MAPS, MAP_LIST_URL } from "@/lib/common/constants/maps";
import type { BestGameRef } from "@/lib/queries/stats/getPlayerAgentBreakdown";
import type { TeamLogoInfo, TeamLogoMap } from "@/lib/queries/teams/teams";

type Props = {
  ref_: BestGameRef;
  teamMap: TeamLogoMap;
  variant?: "hero" | "standalone";
  label?: string;
};

function teamSide(ref_: BestGameRef): "home" | "away" | null {
  if (ref_.playerTeamId === null) return null;
  if (ref_.playerTeamId === ref_.home) return "home";
  if (ref_.playerTeamId === ref_.away) return "away";
  return null;
}

function playerWon(ref_: BestGameRef): boolean | null {
  const side = teamSide(ref_);
  if (side === "home") return ref_.homeRoundsWon > ref_.awayRoundsWon;
  if (side === "away") return ref_.awayRoundsWon > ref_.homeRoundsWon;
  return null;
}

export default function BestGameCard({
  ref_,
  teamMap,
  variant = "hero",
  label = "Best game",
}: Props) {
  const mapKey = (ref_.map ?? "").toUpperCase();
  const mapUuid = (MAPS as Record<string, string>)[mapKey];
  const mapImageUrl = mapUuid ? MAP_LIST_URL(mapUuid) : null;
  const home = ref_.home !== null ? teamMap[ref_.home] : undefined;
  const away = ref_.away !== null ? teamMap[ref_.away] : undefined;
  const wonGame = playerWon(ref_);
  const side = teamSide(ref_);

  const containerClasses =
    variant === "hero"
      ? "block rounded-md bg-slate-100/40 dark:bg-vdcBlack/40 backdrop-blur-sm border border-black/5 dark:border-white/5 p-3 hover:brightness-110"
      : "block rounded-md bg-slate-100 dark:bg-vdcGrey p-4 hover:brightness-110";

  return (
    <Link
      href={`/match/${ref_.matchID}?game=${ref_.gameID}`}
      className={containerClasses}
    >
      <h1 className="text-xs uppercase tracking-wider text-vdcBlack dark:text-gray-400 mb-3">
        {label}
      </h1>
      <div className="grid grid-cols-[88px_1fr] gap-4 items-center">
        {mapImageUrl ? (
          <Image
            src={mapImageUrl}
            alt={ref_.map ?? "Map"}
            width={200}
            height={200}
            className="rounded object-cover h-[88px] w-[88px]"
          />
        ) : (
          <div className="rounded bg-vdcBlack/30 h-[88px] w-[88px]" />
        )}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold leading-none text-vdcBlack dark:text-vdcWhite">
            {ref_.acs} <span className="text-gray-500 text-lg">ACS</span>
          </h1>
          <h1 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mt-1">
            {ref_.map ?? "Unknown map"}
          </h1>
          <h1 className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            <strong className="text-vdcBlack dark:text-vdcWhite">
              {ref_.kills}
            </strong>{" "}
            kills
          </h1>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 mt-4">
        <TeamPill
          info={home}
          highlight={side === "home" ? (wonGame ? "win" : "lose") : "neutral"}
        />
        <h2 className="text-xl font-bold text-vdcBlack dark:text-vdcWhite tabular-nums">
          {ref_.homeRoundsWon} - {ref_.awayRoundsWon}
        </h2>
        <TeamPill
          info={away}
          highlight={side === "away" ? (wonGame ? "win" : "lose") : "neutral"}
        />
      </div>
    </Link>
  );
}

function TeamPill({
  info,
  highlight,
}: {
  info: TeamLogoInfo | undefined;
  highlight: "win" | "lose" | "neutral";
}) {
  const colorClass =
    highlight === "win"
      ? "text-vdcGreen"
      : highlight === "lose"
        ? "text-red-500"
        : "text-vdcBlack dark:text-vdcWhite";
  return (
    <span className={`flex items-center gap-2 font-semibold ${colorClass}`}>
      {info?.logoPath ? (
        <Image
          src={`${TEAM_LOGOS_URL}${info.logoPath}`}
          alt={info.slug}
          width={32}
          height={32}
          className="rounded-sm w-8 h-8"
        />
      ) : (
        <span className="w-8 h-8 rounded-sm bg-vdcBlack/30" />
      )}
      <h2 className="text-sm">{info?.slug ?? "TBD"}</h2>
    </span>
  );
}
