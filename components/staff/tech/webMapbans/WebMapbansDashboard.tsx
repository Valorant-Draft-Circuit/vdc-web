import Link from "next/link";
import { format } from "date-fns";
import VetoResetButton from "@/components/match/veto/VetoResetButton";
import { CopyTextButton } from "@/components/theme/CopyTextButton";
import ForceStartPanel from "./ForceStartPanel";
import {
  VetoSourceMetrics,
  WebMapbanMetrics,
  WebMapbanVeto,
} from "@/lib/queries/staff/webMapbans";

const CARD_CLASSES = "rounded-xl bg-white p-5 shadow-xs dark:bg-vdcGrey";

export default function WebMapbansDashboard({
  metrics,
}: {
  metrics: WebMapbanMetrics;
}) {
  const totalVetos = metrics.web.totalCount + metrics.bot.totalCount;
  const webShare = totalVetos === 0 ? 0 : (metrics.web.totalCount / totalVetos) * 100;
  // A handful of web vetos against a season of bot vetos rounds to 0%, which
  // reads as "none" rather than "a few".
  const webShareLabel =
    totalVetos === 0
      ? "-"
      : metrics.web.totalCount > 0 && webShare < 1
        ? "<1%"
        : `${Math.round(webShare)}%`;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className={CARD_CLASSES}>
          <h2 className="text-sm text-gray-500 dark:text-gray-300">
            Website Share
          </h2>
          <h1 className="mt-1 text-3xl font-semibold text-vdcBlack dark:text-white">
            {webShareLabel}
          </h1>
          <h2 className="text-xs text-gray-500">
            {metrics.web.totalCount} web · {metrics.bot.totalCount} discord
          </h2>
        </div>
        <div className={CARD_CLASSES}>
          <h2 className="text-sm text-gray-500 dark:text-gray-300">
            Awaiting Start
          </h2>
          <h1 className="mt-1 text-3xl font-semibold text-vdcBlack dark:text-white">
            {metrics.unstartedUpcomingCount}
          </h1>
          <h2 className="text-xs text-gray-500">upcoming, no veto yet</h2>
        </div>
        <RolloutFlagsCard flags={metrics.flags} />
      </div>

      <ForceStartPanel matches={metrics.startableMatches} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SourceSection
          title="Website Vetos"
          subtitle="run through /match veto board"
          metrics={metrics.web}
        />
        <SourceSection
          title="Discord Vetos"
          subtitle="run through the bot's /mapbans channels"
          metrics={metrics.bot}
        />
      </div>
    </div>
  );
}

function SourceSection({
  title,
  subtitle,
  metrics,
}: {
  title: string;
  subtitle: string;
  metrics: VetoSourceMetrics;
}) {
  const tiles = [
    { label: "Live", value: metrics.liveCount, accent: "text-vdcGreen" },
    { label: "Stalled", value: metrics.stuckCount, accent: "text-vdcRed" },
    {
      label: "Completed",
      value: metrics.completedCount,
      accent: "text-vdcBlack dark:text-white",
    },
    {
      label: "Total",
      value: metrics.totalCount,
      accent: "text-vdcBlack dark:text-white",
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-lg text-vdcBlack dark:text-white">{title}</h2>
        <h2 className="text-xs text-gray-500">{subtitle}</h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {tiles.map((tile) => (
          <div key={tile.label} className={CARD_CLASSES}>
            <h2 className="text-sm text-gray-500 dark:text-gray-300">
              {tile.label}
            </h2>
            <h1 className={`mt-1 text-3xl font-semibold ${tile.accent}`}>
              {tile.value}
            </h1>
          </div>
        ))}
      </div>
      <OpenVetosCard vetos={metrics.openVetos} />
    </div>
  );
}

function RolloutFlagsCard({ flags }: { flags: WebMapbanMetrics["flags"] }) {
  const allowlistEntries = flags.allowlist
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

  const rows = [
    { label: "Enabled", value: flags.enabled === "true" ? "ON" : "OFF" },
    { label: "Staff only", value: flags.staffOnly === "true" ? "ON" : "OFF" },
    { label: "Allowlisted", value: `${allowlistEntries.length}` },
    { label: "Pager", value: `${flags.pagerMinutes || "30"} min` },
  ];

  return (
    <div className={CARD_CLASSES}>
      <h2 className="text-sm text-gray-500 dark:text-gray-300">
        Rollout Controls
      </h2>
      <ul className="mt-2 divide-y divide-gray-100 border-t border-gray-100 text-sm dark:divide-gray-700 dark:border-gray-700">
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex flex-row items-baseline justify-between py-1"
          >
            <h2 className="text-gray-600 dark:text-gray-300">{row.label}</h2>
            <h2 className="text-vdcBlue">{row.value}</h2>
          </li>
        ))}
      </ul>
      <Link
        href="/staff/admin/control"
        className="mt-2 inline-block text-xs text-vdcBlue hover:underline"
      >
        <h2>Edit in control panel</h2>
      </Link>
    </div>
  );
}

function OpenVetosCard({ vetos }: { vetos: WebMapbanVeto[] }) {
  return (
    <div className={CARD_CLASSES}>
      <h2 className="text-sm text-gray-500 dark:text-gray-300">In Progress</h2>
      <h2 className="text-xs text-gray-500">
        started but not finished; stalled = scheduled time has passed
      </h2>
      {vetos.length === 0 ? (
        <h2 className="mt-3 text-sm text-gray-400">No vetos in progress.</h2>
      ) : (
        <ul className="mt-3 divide-y divide-gray-100 border-t border-gray-100 text-sm dark:divide-gray-700 dark:border-gray-700">
          {vetos.map((veto) => (
            <li key={veto.matchID} className="flex flex-row items-center gap-2">
              <Link
                href={`/match/${veto.matchID}`}
                className="block min-w-0 flex-1 py-1.5 hover:bg-gray-50 dark:hover:bg-vdcBlack/40"
              >
                <div className="flex items-baseline justify-between gap-2 text-xs text-gray-400">
                  <h2>
                    {veto.tier} · MD{veto.matchDay ?? "?"}
                  </h2>
                  <h2 className={veto.isPastScheduled ? "text-vdcRed" : ""}>
                    {veto.isPastScheduled ? "STALLED" : "LIVE"}{" "}
                    {veto.filledSteps}/{veto.totalSteps}
                  </h2>
                </div>
                <div className="flex flex-wrap items-baseline gap-x-1.5">
                  <h2 className="text-vdcBlue">{veto.homeName}</h2>
                  <h2 className="text-gray-400">v</h2>
                  <h2 className="text-vdcBlue">{veto.awayName}</h2>
                  <h2 className="text-gray-400">
                    {format(veto.dateScheduled, "MMM d")}
                  </h2>
                </div>
              </Link>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <CopyTextButton
                  text={`https://vdc.gg/match/${veto.matchID}/broadcast`}
                  label="Broadcast"
                  className="text-xs"
                />
                <VetoResetButton matchID={veto.matchID} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
