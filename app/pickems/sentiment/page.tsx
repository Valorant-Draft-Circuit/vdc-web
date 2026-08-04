import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Tier } from "@prisma/client";
import { QuestionMarkCircleIcon, HomeIcon } from "@heroicons/react/16/solid";
import { getSeasonCached } from "@/lib/common/cache";
import { TIER_HEX_COLOR_MAP, TIERS_LIST } from "@/lib/common/constants/tiers";
import { getUserTier } from "@/lib/queries/user/user";
import { PICKEM_FIRST_SEASON, requirePickemsEnabled } from "@/lib/pickems/guard";
import PickemTierTabs from "@/components/pickems/common/PickemTierTabs";
import SentimentPhaseTabs, {
  type SentimentPhase,
} from "@/components/pickems/sentiment/SentimentPhaseTabs";
import MatchSentimentPanel from "@/components/pickems/sentiment/MatchSentimentPanel";
import MatchSentimentPanelSkeleton from "@/components/pickems/sentiment/MatchSentimentPanelSkeleton";
import AdvancementSentimentPanel from "@/components/pickems/sentiment/AdvancementSentimentPanel";
import AdvancementSentimentPanelSkeleton from "@/components/pickems/sentiment/AdvancementSentimentPanelSkeleton";
import BracketSentimentPanel from "@/components/pickems/sentiment/BracketSentimentPanel";
import BracketSentimentPanelSkeleton from "@/components/pickems/sentiment/BracketSentimentPanelSkeleton";

export const metadata: Metadata = {
  title: "VDC | Pick'ems Sentiment",
  description: "How the community is predicting each tier.",
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const VALID_TIERS = new Set(TIERS_LIST.map((tier) => tier.toLowerCase()));
const VALID_PHASES = new Set<SentimentPhase>(["matches", "advancement", "bracket"]);

const GHOST_PILL =
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-gray-300 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-vdcGrey transition-colors hover:cursor-pointer hover:border-vdcGrey hover:text-vdcBlack dark:border-gray-600 dark:text-gray-400 dark:hover:text-vdcWhite";

function isPhase(value: string | null): value is SentimentPhase {
  return value !== null && VALID_PHASES.has(value as SentimentPhase);
}

export default async function SentimentPage({ searchParams }: Props) {
  await requirePickemsEnabled();

  const [sp, currentSeason, userTier] = await Promise.all([
    searchParams,
    getSeasonCached(),
    getUserTier(),
  ]);

  const rawPhase =
    (typeof sp.phase === "string" && sp.phase) ||
    (typeof sp.section === "string" && sp.section) ||
    null;
  const phaseParam = isPhase(rawPhase) ? rawPhase : null;
  const tierParam = typeof sp.tier === "string" ? sp.tier.toLowerCase() : null;
  const seasonParam = typeof sp.season === "string" ? Number(sp.season) : NaN;

  if (
    !phaseParam ||
    !tierParam ||
    !VALID_TIERS.has(tierParam) ||
    Number.isNaN(seasonParam) ||
    seasonParam < PICKEM_FIRST_SEASON
  ) {
    const userTierSlug = userTier?.toLowerCase();
    const defaultTier =
      userTierSlug && VALID_TIERS.has(userTierSlug) ? userTierSlug : "mythic";
    const phase = phaseParam ?? "matches";
    redirect(
      `/pickems/sentiment?phase=${phase}&tier=${defaultTier}&season=${currentSeason}`,
    );
  }

  const tier = tierParam.toUpperCase() as Tier;
  const season = seasonParam;
  const accent = TIER_HEX_COLOR_MAP[tier];
  const requestedMatchDay =
    typeof sp.md === "string" && !Number.isNaN(Number(sp.md))
      ? Number(sp.md)
      : null;

  const suspenseKey = `${phaseParam}-${tierParam}-${season}-${requestedMatchDay ?? "latest"}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-extrabold tracking-wide">
            PICK<b className="text-vdcRed">&apos;</b>EMS
          </h1>
          <h2
            className="rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white"
            style={{ backgroundColor: accent }}
          >
            {tier}
          </h2>
          <h2 className="text-sm text-vdcGrey dark:text-gray-400">
            Community Sentiment
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/pickems?tier=${tierParam}&season=${season}`}
            className={GHOST_PILL}
          >
            <HomeIcon className="size-4" />
            <h1>Hub</h1>
          </Link>
          <Link href="/pickems/about" className={GHOST_PILL}>
            <QuestionMarkCircleIcon className="size-4" />
            <h1>How to play</h1>
          </Link>
        </div>
      </div>

      <SentimentPhaseTabs activePhase={phaseParam} tier={tier} season={season} />
      <PickemTierTabs
        activeTier={tier}
        season={season}
        basePath="/pickems/sentiment"
        section={phaseParam}
      />

      <Suspense key={suspenseKey} fallback={<PhaseSkeleton phase={phaseParam} />}>
        {phaseParam === "matches" && (
          <MatchSentimentPanel
            tier={tier}
            season={season}
            requestedMatchDay={requestedMatchDay}
          />
        )}
        {phaseParam === "advancement" && (
          <AdvancementSentimentPanel tier={tier} season={season} accent={accent} />
        )}
        {phaseParam === "bracket" && (
          <BracketSentimentPanel tier={tier} season={season} accent={accent} />
        )}
      </Suspense>
    </div>
  );
}

function PhaseSkeleton({ phase }: { phase: SentimentPhase }) {
  if (phase === "advancement") {
    return <AdvancementSentimentPanelSkeleton />;
  }
  if (phase === "bracket") {
    return <BracketSentimentPanelSkeleton />;
  }
  return <MatchSentimentPanelSkeleton />;
}
