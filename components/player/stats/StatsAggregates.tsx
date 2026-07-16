import type { AggregatedStats } from "@/lib/common/indepth";

type SheetRow = [label: string, value: string];
type SheetGroup = { title: string; rows: SheetRow[] };

function SheetGroupBlock({
  group,
  first,
}: {
  group: SheetGroup;
  first: boolean;
}) {
  return (
    <div className={first ? "" : "mt-3"}>
      <h1 className="text-md tracking-wider text-vdcRed">{group.title}</h1>
      {group.rows.map(([label, value]) => (
        <div
          key={label}
          className="flex flex-row justify-between items-baseline py-1 border-b border-vdcBlack/10 dark:border-vdcWhite/10 last:border-b-0"
        >
          <h2 className="text-xs font-normal text-gray-600 dark:text-gray-400">
            {label}
          </h2>
          <h2 className="text-xs tabular-nums">{value}</h2>
        </div>
      ))}
    </div>
  );
}

export default function StatsAggregates({ agg }: { agg: AggregatedStats }) {
  const signedFkDiff = `${agg.fkMinusFd > 0 ? "+" : ""}${agg.fkMinusFd}`;

  const leftGroups: SheetGroup[] = [
    {
      title: "Overview",
      rows: [
        ["Games / Rounds", `${agg.games} · ${agg.rounds}`],
        [
          "W-L (WR%)",
          `${agg.wins}-${agg.losses} (${Math.round(agg.winPct)}%)`,
        ],
      ],
    },
    {
      title: "Combat",
      rows: [
        ["ACS / ADR", `${agg.acs.toFixed(0)} · ${agg.adr.toFixed(0)}`],
        [
          "K / D / A",
          `${agg.totalKills} / ${agg.totalDeaths} / ${agg.totalAssists}`,
        ],
        ["KD / KDA", `${agg.kd.toFixed(2)} · ${agg.kda.toFixed(2)}`],
        [
          "KPR / APR / DPR",
          `${agg.kpr.toFixed(2)} · ${agg.apr.toFixed(2)} · ${agg.dpr.toFixed(2)}`,
        ],
      ],
    },
  ];

  const rightGroups: SheetGroup[] = [
    {
      title: "Impact",
      rows: [
        [
          "Rating (ATK / DEF)",
          `${agg.ratingOverall.toFixed(2)} (${agg.ratingAttack.toFixed(2)} / ${agg.ratingDefense.toFixed(2)})`,
        ],
        [
          "KAST / HS%",
          `${agg.kast.toFixed(0)}% · ${agg.hsPercent.toFixed(0)}%`,
        ],
        [
          "Clutches (per game)",
          `${agg.clutches} (${agg.clutchesPerGame.toFixed(2)})`,
        ],
      ],
    },
    {
      title: "Entry",
      rows: [
        [
          "FK / FD (diff)",
          `${agg.firstKills} / ${agg.firstDeaths} (${signedFkDiff})`,
        ],
        ["FK% / FD%", `${agg.fkPct.toFixed(0)}% · ${agg.fdPct.toFixed(0)}%`],
      ],
    },
    {
      title: "Economy",
      rows: [
        ["Eco K / Anti-eco K", `${agg.ecoKills} · ${agg.antiEcoKills}`],
        ["Trades K / D", `${agg.tradeKills} / ${agg.tradeDeaths}`],
        ["Plants / Defuses", `${agg.plants} · ${agg.defuses}`],
      ],
    },
  ];

  return (
    <div className="bg-vdcWhite/40 dark:bg-vdcBlack/40 backdrop-blur-sm rounded-md px-4 py-3">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-8">
        <div>
          {leftGroups.map((group, index) => (
            <SheetGroupBlock
              key={group.title}
              group={group}
              first={index === 0}
            />
          ))}
        </div>
        <div className="mt-3 xl:mt-0">
          {rightGroups.map((group, index) => (
            <SheetGroupBlock
              key={group.title}
              group={group}
              first={index === 0}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
