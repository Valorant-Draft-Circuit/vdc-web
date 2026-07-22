"use client";

import { MAP_LIST_URL } from "@/lib/common/constants/maps";
import Image from "next/image";
import { useVetoSelection } from "./VetoSelectionContext";

export function TilePreviewArt({ maps }: { maps: Record<string, string> }) {
  const { selectedMap, remoteSelectedMap } = useVetoSelection();
  const previewMap = selectedMap ?? remoteSelectedMap;
  if (!previewMap) return null;
  const mapUuid = maps[previewMap.toUpperCase()];
  if (!mapUuid) return null;

  return (
    <Image
      alt={previewMap}
      src={MAP_LIST_URL(mapUuid)}
      width={5000}
      height={5000}
      className="veto-tile-reveal absolute inset-0 -z-10 size-full rounded-lg object-cover brightness-55 dark:brightness-50"
    />
  );
}

export function TilePreviewName() {
  const { selectedMap, remoteSelectedMap } = useVetoSelection();
  const previewMap = selectedMap ?? remoteSelectedMap;
  if (!previewMap) return <h2 className="text-2xl">?</h2>;
  return <h2 className="text-vdcWhite drop-shadow-lg">{previewMap}</h2>;
}
