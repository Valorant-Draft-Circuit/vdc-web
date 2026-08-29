import { TIERS_LIST } from "@/lib/common/constants/tiers";

type Props = {
  showTierLeaders: boolean;
};

export default function HubOverviewSkeleton({ showTierLeaders }: Props) {
  return (
    <div className="flex animate-pulse flex-col gap-4">
      <div className="h-24 rounded-md bg-slate-100 dark:bg-vdcGrey" />
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="h-32 flex-1 rounded-md bg-slate-100 dark:bg-vdcGrey" />
        <div className="h-32 flex-1 rounded-md bg-slate-100 dark:bg-vdcGrey" />
        <div className="h-32 flex-1 rounded-md bg-slate-100 dark:bg-vdcGrey" />
      </div>
      {showTierLeaders && (
        <div className="flex flex-col gap-2">
          <div className="h-5 w-32 rounded-md bg-slate-100 dark:bg-vdcGrey" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {TIERS_LIST.map((tier) => (
              <div
                key={tier}
                className="h-[5.75rem] rounded-md bg-slate-100 dark:bg-vdcGrey"
              />
            ))}
          </div>
        </div>
      )}
      <div className="h-80 rounded-md bg-slate-100 dark:bg-vdcGrey" />
      <div className="h-28 rounded-md bg-slate-100 dark:bg-vdcGrey" />
    </div>
  );
}
