"use client";

import { useEffect } from "react";

export default function BroadcastViewport() {
  useEffect(() => {
    document.documentElement.classList.add("broadcast-mode");
    return () => document.documentElement.classList.remove("broadcast-mode");
  }, []);

  return null;
}
