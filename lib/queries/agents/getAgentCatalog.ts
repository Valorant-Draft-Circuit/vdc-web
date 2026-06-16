import { cache } from "react";
import { normalizeAgentName } from "@/lib/common/agents";
import type { RoleName } from "@/lib/common/constants/roles";

export type AgentCatalogEntry = {
  uuid: string;
  displayName: string;
  displayIconUrl: string;
  fullPortraitUrl: string;
  isFullPortraitRightFacing: boolean;
  backgroundGradientColors: string[];
  role: { uuid: string; name: RoleName; iconUrl: string } | null;
};

export type AgentCatalog = Record<string, AgentCatalogEntry>;

type ApiAgent = {
  uuid: string;
  displayName: string;
  displayIcon: string | null;
  fullPortrait: string | null;
  isFullPortraitRightFacing: boolean;
  backgroundGradientColors: string[] | null;
  role: {
    uuid: string;
    displayName: string;
    displayIcon: string | null;
  } | null;
};

const ROLE_NAME_MAP: Record<string, RoleName> = {
  Duelist: "DUELIST",
  Sentinel: "SENTINEL",
  Controller: "CONTROLLER",
  Initiator: "INITIATOR",
};

function toCatalogEntry(agent: ApiAgent): AgentCatalogEntry {
  const roleName = agent.role
    ? ROLE_NAME_MAP[agent.role.displayName]
    : undefined;
  return {
    uuid: agent.uuid,
    displayName: agent.displayName,
    displayIconUrl: agent.displayIcon ?? "",
    fullPortraitUrl: agent.fullPortrait ?? "",
    isFullPortraitRightFacing: agent.isFullPortraitRightFacing,
    backgroundGradientColors: agent.backgroundGradientColors ?? [],
    role:
      agent.role && roleName && agent.role.displayIcon
        ? {
            uuid: agent.role.uuid,
            name: roleName,
            iconUrl: agent.role.displayIcon,
          }
        : null,
  };
}

export const getAgentCatalog = cache(async (): Promise<AgentCatalog> => {
  try {
    const res = await fetch(
      "https://valorant-api.com/v1/agents?isPlayableCharacter=true",
      { next: { revalidate: 86400 } },
    );
    if (!res.ok) return {};

    const json: { data: ApiAgent[] } = await res.json();
    const catalog: AgentCatalog = {};
    for (const agent of json.data) {
      const key = normalizeAgentName(agent.displayName.toUpperCase());
      catalog[key] = toCatalogEntry(agent);
    }
    return catalog;
  } catch {
    return {};
  }
});
