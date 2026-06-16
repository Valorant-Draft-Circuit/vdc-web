import type { ReactNode } from "react";
import {
  getPickemEnabled,
  getPickemPreview,
} from "@/lib/queries/pickems/getAdvanceBoard";
import PreviewBanner from "@/components/pickems/common/PreviewBanner";

export default async function PickemsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [enabled, preview] = await Promise.all([
    getPickemEnabled(),
    getPickemPreview(),
  ]);

  if (!enabled) {
    return (
      <div className="mx-auto max-w-7xl px-2 py-20 xl:px-8">
        <h1 className="text-center text-2xl font-extrabold">
          Pick&apos;ems is currently unavailable
        </h1>
        <h2 className="mt-2 text-center text-sm text-vdcGrey dark:text-gray-400">
          Check back soon.
        </h2>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-2 py-6 xl:px-8">
      {preview && <PreviewBanner />}
      {children}
    </div>
  );
}
