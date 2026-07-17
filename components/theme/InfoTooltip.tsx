import { InformationCircleIcon } from "@heroicons/react/16/solid";

export default function InfoTooltip({
  ariaLabel,
  text,
  tooltipPosition = "left",
  iconClassName = "text-gray-400 hover:text-vdcRed",
}: {
  ariaLabel: string;
  text: string;
  tooltipPosition?: "left" | "right";
  iconClassName?: string;
}) {
  const positionClass = tooltipPosition === "left" ? "left-0" : "right-0";
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-label={ariaLabel}
        className={`inline-flex cursor-help ${iconClassName}`}
      >
        <InformationCircleIcon className="size-4" />
      </button>
      <span
        role="tooltip"
        className={`pointer-events-none absolute ${positionClass} top-6 z-20 hidden w-56 rounded-md bg-vdcBlack/90 px-3 py-2 text-[11px] not-italic leading-snug text-vdcWhite shadow-lg group-hover:block group-focus-within:block`}
      >
        <h2>{text}</h2>
      </span>
    </span>
  );
}
