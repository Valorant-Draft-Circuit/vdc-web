"use client";

import { useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/16/solid";

const CHANNEL_URL = "https://twitch.tv/valorantdraftcircuit";
const POLL_INTERVAL_MS = 60 * 1000;

type Props = {
  initialLive: boolean;
};

export default function LiveBannerBar({ initialLive }: Props) {
  const [live, setLive] = useState(initialLive);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let active = true;

    async function refresh() {
      try {
        const res = await fetch("/api/twitch/live", { cache: "no-store" });
        if (!res.ok) {
          return;
        }
        const data = (await res.json()) as { live: boolean };
        if (active) {
          setLive(data.live);
        }
      } catch {
        return;
      }
    }

    const timer = setInterval(refresh, POLL_INTERVAL_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  if (!live || dismissed) {
    return null;
  }

  return (
    <div className="live-banner relative">
      <a
        href={CHANNEL_URL}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center gap-2.5 bg-[#8956FB] py-1 text-white transition hover:opacity-90"
      >
        <div className="rounded-full flex items-center bg-vdcBlack gap-2.5 px-4 py-1">
          <span
            className="size-2 flex-none animate-pulse rounded-full bg-vdcRed"
            aria-hidden="true"
          />
          <h2 className="text-sm font-extrabold uppercase tracking-wide">
            Live Now
          </h2>
          <h2 className="text-sm font-medium">Watch on Twitch</h2>
        </div>
      </a>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/80 transition hover:bg-white/20 hover:text-white"
      >
        <XMarkIcon className="size-4" />
      </button>
    </div>
  );
}
