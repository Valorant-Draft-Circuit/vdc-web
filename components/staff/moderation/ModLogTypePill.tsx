import { MOD_LOG_TYPE_COLOR_MAP } from "@/lib/common/constants/modLogs";
import { ModLogDisplayType } from "@/lib/common/moderation";

export default function ModLogTypePill({ type }: { type: ModLogDisplayType }) {
  return (
    <span
      className={`shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold ${MOD_LOG_TYPE_COLOR_MAP[type]}`}
    >
      {type.replaceAll("_", " ")}
    </span>
  );
}
