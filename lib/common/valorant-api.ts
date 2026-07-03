import { AGENTS } from "./constants/agents";
import { MAPS } from "./constants/maps";

export type Agents = Record<string, string>;
export type Maps = Record<string, string>;

export async function getAgents(): Promise<Agents> {
  try {
    const res = await fetch("https://valorant-api.com/v1/agents");

    if (!res.ok) {
      console.warn("Failed to fetch agents. Falling back to static agents map");
      return AGENTS;
    }

    const json = await res.json();
    const data = json?.data;
    if (!Array.isArray(data)) {
      console.warn("Failed to fetch agents. Falling back to static agents map");
      return AGENTS;
    }

    const agents: Agents = {};
    for (const agent of data) {
      if (agent.displayName && agent.uuid) {
        agents[agent.displayName.toUpperCase()] = agent.uuid;
      }
    }

    return agents;
  } catch (err) {
    console.error(
      "Failed to fetch agents. Falling back to static agents map",
      err
    );
    return AGENTS;
  }
}

export async function getMaps(): Promise<Maps> {
  try {
    const res = await fetch("https://valorant-api.com/v1/maps");
    
    if (!res.ok) {
      console.warn("Failed to fetch maps. Falling back to static maps map");
      return MAPS;
    }

    const json = await res.json();
    const data = json?.data;
    if (!Array.isArray(data)) {
      console.warn("Failed to fetch maps. Falling back to static maps map");
      return MAPS;
    }

    const maps: Maps = {};
    for (const map of data) {
      if (map.displayName && map.uuid && map.tacticalDescription) {
        maps[map.displayName.toUpperCase()] = map.uuid;
      }
    }

    return maps;
  } catch (err) {
    console.error("Failed to fetch maps. Falling back to static maps map", err);
    return MAPS;
  }
}
