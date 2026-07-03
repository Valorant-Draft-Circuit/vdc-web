import { ModLogType } from "@prisma/client";

import { MOD_LOG_TYPE_COLOR_MAP } from "@/lib/common/constants/modLogs";

export default function ModLogTypePill({ type }: { type: ModLogType }) {
  return (
    <span
      className={`shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold ${MOD_LOG_TYPE_COLOR_MAP[type]}`}
    >
      {type.replaceAll("_", " ")}
    </span>
  );
}
