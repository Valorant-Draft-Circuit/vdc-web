"use client";

import { useState } from "react";

export default function CopyInviteButton() {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
    });
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-md border border-vdcBlue px-2 py-1 text-xs uppercase tracking-wider text-vdcBlue hover:bg-vdcBlue hover:text-vdcWhite hover:cursor-pointer"
    >
      <h2>{copied ? "Copied" : "Copy invite"}</h2>
    </button>
  );
}
