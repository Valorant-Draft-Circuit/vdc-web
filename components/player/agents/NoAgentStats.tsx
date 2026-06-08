import Link from "next/link";
import type { BestGameRef } from "@/lib/queries/stats/getPlayerAgentBreakdown";
import type { TeamLogoMap } from "@/lib/queries/teams/teams";
import BestGameCard from "./BestGameCard";

type Props = {
  variant: "empty" | "season-empty-has-combine" | "combine-empty-has-season";
  currentPlayerHref: string;
  searchParams: Record<string, string | string[] | undefined>;
  bestCombineGame?: BestGameRef | null;
  teamMap?: TeamLogoMap;
};

function buildHrefWithType(
  base: string,
  searchParams: Props["searchParams"],
  newType: "season" | "combine",
): string {
  const next = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    if (typeof v === "string") next.set(k, v);
  }
  next.set("type", newType);
  return `${base}?${next.toString()}`;
}

export default function NoAgentStats({
  variant,
  currentPlayerHref,
  searchParams,
  bestCombineGame,
  teamMap,
}: Props) {
  if (variant === "empty") {
    return (
      <div className="m-auto text-center py-10">
        <h1 className="text-vdcRed">
          Player has no agent stats for this season.
        </h1>
      </div>
    );
  }

  if (variant === "season-empty-has-combine") {
    const tryCombineHref = buildHrefWithType(currentPlayerHref, searchParams, "combine");
    return (
      <div className="flex flex-col items-center gap-4 py-8 px-2 xl:px-0">
        <div className="text-center">
          <h1 className="text-vdcRed">
            Player has no agent stats for this season.
          </h1>
          <Link
            href={tryCombineHref}
            className="text-sm text-vdcBlack dark:text-vdcWhite underline hover:text-vdcRed"
          >
            Try combine instead
          </Link>
        </div>
        {bestCombineGame && teamMap && (
          <div className="w-full max-w-md">
            <BestGameCard
              ref_={bestCombineGame}
              teamMap={teamMap}
              variant="standalone"
              label="Best combine game"
            />
          </div>
        )}
      </div>
    );
  }

  const trySeasonHref = buildHrefWithType(currentPlayerHref, searchParams, "season");
  return (
    <div className="m-auto text-center py-10">
      <h1 className="text-vdcRed">
        Player has no agent stats for this combine.
      </h1>
      <Link
        href={trySeasonHref}
        className="text-sm text-vdcBlack dark:text-vdcWhite underline hover:text-vdcRed"
      >
        Try season instead
      </Link>
    </div>
  );
}
