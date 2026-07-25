"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAgentsCached } from "@/lib/common/cache";
import { AGENTS, AGENTURL } from "@/lib/common/constants/agents";
import { normalizeAgentName } from "@/lib/common/agents";
import { Agents } from "@/lib/common/valorant-api";
import type { LobbyRosters, RosterEntry } from "@/lib/common/match";

export default function RosterColumns({ rosters }: { rosters: LobbyRosters }) {
  const [agents, setAgents] = useState<Agents>();

  useEffect(() => {
    let isMounted = true;
    async function loadAgents() {
      try {
        const data = await getAgentsCached();
        if (isMounted) {
          setAgents(data);
        }
      } catch (err) {
        console.error("Failed to load agents", err);
        if (isMounted) {
          setAgents(AGENTS);
        }
      }
    }
    loadAgents();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!agents) {
    return null;
  }

  return (
    <div className="hidden xl:flex flex-row gap-1 m-auto">
      <RosterStack entries={rosters.home} agents={agents} />
      <RosterStack entries={rosters.away} agents={agents} />
    </div>
  );
}

function RosterStack({
  entries,
  agents,
}: {
  entries: RosterEntry[];
  agents: Agents;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      {entries.map((entry) => (
        <RosterRow key={entry.userID} entry={entry} agents={agents} />
      ))}
    </div>
  );
}

function RosterRow({ entry, agents }: { entry: RosterEntry; agents: Agents }) {
  const nameClass = entry.isViewedPlayer ? "text-vdcWhite" : "text-gray-300";

  const name = (
    <p className={`${nameClass} text-xs leading-tight truncate max-w-16`}>
      {entry.riotIGN ?? "Unknown"}
    </p>
  );

  const agentIcon = (
    <Image
      src={AGENTURL(agents[normalizeAgentName(entry.agent)])}
      alt={entry.agent}
      width={100}
      height={100}
      className="size-4 rounded-sm text-[5px]"
    />
  );

  if (!entry.riotIGN) {
    return (
      <div className="flex flex-row gap-1 items-center" title="Unknown">
        {agentIcon}
        {name}
      </div>
    );
  }

  return (
    <Link
      onClick={(e) => {
        e.stopPropagation();
      }}
      href={`/player/${encodeURIComponent(entry.riotIGN)}`}
      title={entry.riotIGN}
      className="flex flex-row gap-1 items-center hover:brightness-125"
    >
      {agentIcon}
      {name}
    </Link>
  );
}
