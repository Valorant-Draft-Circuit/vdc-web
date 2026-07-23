"use client";

import { createContext, useContext, useEffect, useState } from "react";

const BroadcastRevealContext = createContext<number>(Number.POSITIVE_INFINITY);

const HINT_VISIBLE_MS = 5000;

export function BroadcastRevealProvider({
  stepCount,
  children,
}: {
  stepCount: number;
  children: React.ReactNode;
}) {
  const active = Number.isFinite(stepCount);
  const [revealStep, setRevealStep] = useState(stepCount);
  const [hintVisible, setHintVisible] = useState(true);

  useEffect(() => {
    setRevealStep((current) => Math.min(current, stepCount));
  }, [stepCount]);

  useEffect(() => {
    if (!active) return;
    const timeout = setTimeout(() => setHintVisible(false), HINT_VISIBLE_MS);
    return () => clearTimeout(timeout);
  }, [active]);

  useEffect(() => {
    if (!active) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === "ArrowRight") {
        setRevealStep((current) => Math.min(current + 1, stepCount));
      } else if (event.key === "ArrowLeft") {
        setRevealStep((current) => Math.max(current - 1, 0));
      } else if (event.key === "ArrowUp") {
        setRevealStep(stepCount);
      } else if (event.key === "ArrowDown") {
        setRevealStep(0);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [active, stepCount]);

  if (!active) return <>{children}</>;

  return (
    <BroadcastRevealContext.Provider value={revealStep}>
      {children}
      {hintVisible && (
        <div className="pointer-events-none fixed bottom-4 left-1/2 -translate-x-1/2 rounded-md bg-vdcBlack/70 px-4 py-2 text-xs text-gray-300">
          <h2>← → reveal step · ↑ show all · ↓ hide all</h2>
        </div>
      )}
    </BroadcastRevealContext.Provider>
  );
}

export function RevealGate({
  index,
  fallback = null,
  children,
}: {
  index: number;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  const revealStep = useContext(BroadcastRevealContext);
  return <>{index < revealStep ? children : fallback}</>;
}
