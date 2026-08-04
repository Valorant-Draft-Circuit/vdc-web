import type { MatchupSentimentView } from "@/lib/queries/pickems/getMatchSentiment";

const HOME_COLOR = "#c0392b";
const DRAW_COLOR = "#7f8c8d";
const AWAY_COLOR = "#2980b9";

function pct(share: number): string {
  return `${Math.round(share * 100)}%`;
}

export default function MatchSentimentBar({
  matchup,
}: {
  matchup: MatchupSentimentView;
}) {
  const segments = [
    { key: "home", color: HOME_COLOR, share: matchup.shares.home, label: matchup.home?.slug ?? "HOME" },
    { key: "draw", color: DRAW_COLOR, share: matchup.shares.draw, label: "1-1" },
    { key: "away", color: AWAY_COLOR, share: matchup.shares.away, label: matchup.away?.slug ?? "AWAY" },
  ];

  return (
    <div className="flex h-6 overflow-hidden rounded text-[11px] font-bold text-white">
      {segments.map((segment) =>
        segment.share > 0 ? (
          <div
            key={segment.key}
            className="flex items-center justify-center"
            style={{ width: `${segment.share * 100}%`, backgroundColor: segment.color }}
          >
            {segment.share >= 0.12 ? `${segment.label} ${pct(segment.share)}` : ""}
          </div>
        ) : null,
      )}
    </div>
  );
}
