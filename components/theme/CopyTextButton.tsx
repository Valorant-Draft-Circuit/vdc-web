"use client";

import { useState } from "react";
import {
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/16/solid";

const COPIED_FEEDBACK_MS = 1500;

export function CopyTextButton({
  text,
  label,
  className,
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copyText = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
  };

  return (
    <button
      type="button"
      onClick={copyText}
      aria-label={`Copy ${label ?? "to clipboard"}`}
      className={`flex cursor-pointer items-center gap-1 text-vdcBlue hover:underline ${className ?? ""}`}
    >
      {copied ? (
        <ClipboardDocumentCheckIcon className="size-4 text-vdcGreen" />
      ) : (
        <ClipboardDocumentIcon className="size-4" />
      )}
      {label && <h2>{copied ? "Copied" : label}</h2>}
    </button>
  );
}
