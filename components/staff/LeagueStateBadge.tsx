export default function LeagueStateBadge({
  leagueState,
}: {
  leagueState: string;
}) {
  let statusColor;
  switch (leagueState) {
    case "OFFSEASON":
      statusColor = "fill-gray-500";
      break;
    case "COMBINES":
      statusColor = "fill-yellow-500";
      break;
    case "PRESEASON":
      statusColor = "fill-blue-500";
      break;
    case "REGULAR_SEASON":
      statusColor = "fill-green-500";
      break;
    case "PLAYOFFS":
      statusColor = "fill-red-500";
      break;
  }
  leagueState = leagueState.replace("_", " ");

  return (
    <span className="inline-flex items-center gap-x-1.5 rounded-lg px-2 my-5 md:my-1 text-xs font-medium ring-1 ring-gray-200 dark:ring-vdcGrey ring-inset">
      <svg
        viewBox="0 0 6 6"
        aria-hidden="true"
        className={`size-1.5 ${statusColor} animate-pulse`}
      >
        <circle r={3} cx={3} cy={3} />
      </svg>
      <h2>{leagueState}</h2>
    </span>
  );
}
