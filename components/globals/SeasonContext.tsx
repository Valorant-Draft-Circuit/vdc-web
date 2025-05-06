"use client";
import { createContext, useContext } from "react";

const SeasonContext = createContext<number | null>(null);
export const useSeason = () => {
  const ctx = useContext(SeasonContext);
  if (ctx === null) throw new Error("useSeason must be inside SeasonProvider");
  return ctx;
};
export default SeasonContext;
