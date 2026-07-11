import Image from "next/image";
import Link from "next/link";
import { Tier } from "@prisma/client";
import {
  LockClosedIcon,
  RectangleGroupIcon,
  Squares2X2Icon,
  TrophyIcon,
} from "@heroicons/react/16/solid";
import { pickRandomMapSplashes } from "@/lib/common/maps";
import { formatPoints } from "@/lib/pickems/format";
import type {
  HubOverview,
  StageSummary,
} from "@/lib/queries/pickems/getHubOverview";

type Props = {
  overview: HubOverview;
  tier: Tier;
  season: number;
  accent: string;
};

type StageDefinition = {
  name: string;
  description: string;
  href: string;
  icon: typeof TrophyIcon;
  artUrl: string;
  summary: StageSummary;
};

function pointsLine(summary: StageSummary): string | null {
  if (summary.maxPoints === 0) {
    return null;
  }
  if (summary.state === "dead") {
    return `up to ${formatPoints(summary.maxPoints)} pts`;
  }
  const scored = summary.points !== null ? formatPoints(summary.points) : "-";
  return `${scored} / ${formatPoints(summary.maxPoints)} pts`;
}

function StageCard({
  stage,
  accent,
}: {
  stage: StageDefinition;
  accent: string;
}) {
  const { summary } = stage;
  const Icon = stage.icon;
  const points = pointsLine(summary);

  const body = (
    <>
      <Image
        src={stage.artUrl}
        alt=""
        fill
        sizes="(max-width: 640px) 100vw, 33vw"
        className={`object-cover ${
          summary.state === "open"
            ? "brightness-50 dark:brightness-35"
            : "brightness-50 grayscale dark:brightness-35"
        }`}
      />
      <div className="absolute inset-0 bg-linear-to-r from-vdcWhite/95 via-vdcWhite/60 to-transparent dark:from-vdcBlack/95 dark:via-vdcBlack/60" />
      <div className="relative flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-center gap-2">
          <Icon
            className="size-4"
            style={summary.state === "open" ? { color: accent } : undefined}
          />
          <h1 className="text-sm font-bold uppercase tracking-wide">
            {stage.name}
          </h1>
        </div>
        <h2 className="flex items-center gap-1.5 text-xs">
          {summary.state !== "open" && <LockClosedIcon className="size-3" />}
          <span
            className={
              summary.state === "open"
                ? "font-bold text-vdcGreen"
                : "text-vdcGrey dark:text-gray-400"
            }
          >
            {summary.statusLabel}
          </span>
        </h2>
        <p className="text-xs text-vdcGrey dark:text-gray-400">
          {stage.description}
        </p>
        {points && (
          <h2 className="mt-auto pt-2 text-sm font-bold tabular-nums">
            {summary.state === "dead" || summary.points === null ? (
              points
            ) : (
              <>
                <b style={{ color: accent }}>{formatPoints(summary.points)}</b>
                {` / ${formatPoints(summary.maxPoints)} pts`}
              </>
            )}
          </h2>
        )}
      </div>
    </>
  );

  const baseClasses =
    "relative flex flex-1 flex-col overflow-hidden rounded-md border min-h-[8.5rem]";

  if (summary.state === "dead") {
    return (
      <div
        className={`${baseClasses} border-black/5 opacity-40 dark:border-white/10`}
      >
        {body}
      </div>
    );
  }

  const stateClasses =
    summary.state === "open"
      ? "hover:brightness-90"
      : "border-black/5 opacity-75 hover:opacity-100 dark:border-white/10";

  return (
    <Link
      href={stage.href}
      className={`${baseClasses} ${stateClasses}`}
      style={summary.state === "open" ? { borderColor: accent } : undefined}
    >
      {body}
    </Link>
  );
}

export default function StageCards({ overview, tier, season, accent }: Props) {
  const tierSlug = tier.toLowerCase();
  const [matchesArt, advancementArt, bracketArt] = pickRandomMapSplashes(3);
  const stages: StageDefinition[] = [
    {
      name: "Matches",
      description: "Predict each match day's series scores.",
      href: `/pickems/matches?tier=${tierSlug}&season=${season}`,
      icon: Squares2X2Icon,
      artUrl: matchesArt,
      summary: overview.matches,
    },
    {
      name: "Advancement",
      description: "Call the playoff field in seed order.",
      href: `/pickems/advancement?tier=${tierSlug}&season=${season}`,
      icon: TrophyIcon,
      artUrl: advancementArt,
      summary: overview.advancement,
    },
    {
      name: "Bracket",
      description: "Fill the full playoff bracket.",
      href: `/pickems/bracket?tier=${tierSlug}&season=${season}`,
      icon: RectangleGroupIcon,
      artUrl: bracketArt,
      summary: overview.bracket,
    },
  ];

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {stages.map((stage) => (
        <StageCard key={stage.name} stage={stage} accent={accent} />
      ))}
    </div>
  );
}
