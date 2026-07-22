"use client";

import { createContext, useContext, useEffect, useState } from "react";

const VetoSelectionContext = createContext<{
  selectedMap: string | null;
  setSelectedMap: (map: string | null) => void;
  remoteSelectedMap: string | null;
  setRemoteSelectedMap: (map: string | null) => void;
}>({
  selectedMap: null,
  setSelectedMap: () => {},
  remoteSelectedMap: null,
  setRemoteSelectedMap: () => {},
});

export function VetoSelectionProvider({
  turnKey,
  children,
}: {
  turnKey: string;
  children: React.ReactNode;
}) {
  const [selectedMap, setSelectedMap] = useState<string | null>(null);
  const [remoteSelectedMap, setRemoteSelectedMap] = useState<string | null>(
    null,
  );

  useEffect(() => {
    setSelectedMap(null);
    setRemoteSelectedMap(null);
  }, [turnKey]);

  return (
    <VetoSelectionContext.Provider
      value={{
        selectedMap,
        setSelectedMap,
        remoteSelectedMap,
        setRemoteSelectedMap,
      }}
    >
      {children}
    </VetoSelectionContext.Provider>
  );
}

export function useVetoSelection() {
  return useContext(VetoSelectionContext);
}
