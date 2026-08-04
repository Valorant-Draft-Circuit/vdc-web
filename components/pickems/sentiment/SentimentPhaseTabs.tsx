import Link from "next/link";
import { type CSSProperties } from "react";
import { Tier } from "@prisma/client";
import { VDC_RED } from "@/lib/common/constants/colors";
import ListBox from "@/components/tabs/DropDown";

export type SentimentPhase = "matches" | "advancement" | "bracket";

type Props = {
  activePhase: SentimentPhase;
  tier: Tier;
  season: number;
};

const PHASES: { query: SentimentPhase; name: string }[] = [
  { query: "matches", name: "MATCHES" },
  { query: "advancement", name: "ADVANCEMENT" },
  { query: "bracket", name: "BRACKET" },
];

const TAB_BASE =
  "rounded-full border-[1.5px] border-[var(--accent)] px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors";
const TAB_ACTIVE = "bg-[var(--accent)] text-white";
const TAB_INACTIVE = "text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white";

export default function SentimentPhaseTabs({ activePhase, tier, season }: Props) {
  const accentVar = { "--accent": VDC_RED } as CSSProperties;
  const tierSlug = tier.toLowerCase();
  const hrefFor = (phase: SentimentPhase) =>
    `/pickems/sentiment?phase=${phase}&tier=${tierSlug}&season=${season}`;

  return (
    <>
      <div className="sm:hidden">
        <ListBox
          params="phase"
          menuElements={PHASES}
          defaultDropDownQuery={activePhase}
        />
      </div>
      <div className="hidden flex-wrap gap-1.5 sm:flex">
        {PHASES.map((phase) => (
          <Link
            key={phase.query}
            href={hrefFor(phase.query)}
            className={`${TAB_BASE} ${phase.query === activePhase ? TAB_ACTIVE : TAB_INACTIVE}`}
            style={accentVar}
          >
            <h1>{phase.name}</h1>
          </Link>
        ))}
      </div>
    </>
  );
}
