"use client";

import { toBlob } from "html-to-image";
import { useRef, useState } from "react";
import { ClipboardDocumentIcon } from "@heroicons/react/16/solid";

type Props = {
  children: React.ReactNode;
};

type Status = "idle" | "copying" | "copied";

export default function ShareableHero({ children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onCopy() {
    if (!ref.current) return;
    setStatus("copying");
    setError(null);
    try {
      const blob = await toBlob(ref.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
      if (!blob) throw new Error("Could not capture image");
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setStatus("copied");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (e) {
      setStatus("idle");
      setError(e instanceof Error ? e.message : "Copy failed");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-end gap-2 px-2 xl:px-0">
        {error && <p className="text-xs text-vdcRed">{error}</p>}
        <button
          type="button"
          onClick={onCopy}
          disabled={status === "copying"}
          title="Copy hero card to clipboard"
          aria-label="Copy hero card image to clipboard"
          className="flex items-center gap-1 rounded bg-vdcRed hover:brightness-110 hover:cursor-pointer disabled:opacity-50 text-vdcWhite text-xs px-2 py-1 transition-colors"
        >
          <ClipboardDocumentIcon className="size-3" />
          <h1>
            {status === "copying"
              ? "Copying..."
              : status === "copied"
                ? "Copied!"
                : "Copy"}
          </h1>
        </button>
      </div>
      <div ref={ref}>{children}</div>
    </div>
  );
}
