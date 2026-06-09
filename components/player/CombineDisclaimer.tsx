import { InformationCircleIcon } from "@heroicons/react/16/solid";

export default function CombineDisclaimer() {
  return (
    <div className="rounded-md bg-vdcRed/30 dark:bg-vdcRed/10 p-4 mx-2 xl:mx-0 outline outline-vdcRed/20">
      <div className="flex">
        <div className="shrink-0">
          <InformationCircleIcon
            aria-hidden="true"
            className="size-5 text-vdcRed"
          />
        </div>
        <div className="ml-3 flex-1 md:flex md:justify-between">
          <p className="text-sm text-vdcBlack dark:text-vdcWhite font-roboto ">
            Combine stats are stored differently than regular season stats. Some
            data might be different or missing entirely.
          </p>
        </div>
      </div>
    </div>
  );
}
