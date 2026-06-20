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

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-2 py-6 xl:px-8">
      {enabled && preview && <PreviewBanner />}
      {children}
    </div>
  );
}
