import { InformationCircleIcon } from "@heroicons/react/16/solid";

export default function PreviewBanner() {
  return (
    <div className="rounded-md bg-vdcRed/15 p-4 mx-2 xl:mx-0 outline outline-vdcRed/20">
      <div className="flex">
        <div className="shrink-0">
          <InformationCircleIcon
            aria-hidden="true"
            className="size-5 text-vdcRed"
          />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-vdcBlack dark:text-vdcWhite font-roboto">
            Pick&apos;ems is in beta. Scoring and features may change.
          </p>
        </div>
      </div>
    </div>
  );
}
