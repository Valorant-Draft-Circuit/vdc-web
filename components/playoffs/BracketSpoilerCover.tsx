"use client";

import { useState, type ReactNode } from "react";
import { EyeSlashIcon } from "@heroicons/react/24/solid";

export default function BracketSpoilerCover({
  children,
}: {
  children: ReactNode;
}) {
  const [revealed, setRevealed] = useState(false);

  if (revealed) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-md" aria-hidden="true">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="flex items-center gap-2 rounded-lg bg-vdcRed px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg transition-colors hover:cursor-pointer hover:bg-red-700"
        >
          <EyeSlashIcon className="size-4" />
          Reveal results
        </button>
      </div>
    </div>
  );
}
