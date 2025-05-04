"use client";
import { useEffect, useState } from "react";
const TIMEOUT_MILLISECONDS = 10_00;
export default function InactivityWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [inactive, setInactive] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeout);
      setInactive(false);
      timeout = setTimeout(() => {
        setInactive(true);
      }, TIMEOUT_MILLISECONDS);
    };

    const events = ["mousemove", "keydown", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timeout);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, []);

  return (
    <div
      className={`transition-opacity duration-200 ${
        inactive ? "opacity-40" : "opacity-100"
      }`}
    >
      {children}
    </div>
  );
}
