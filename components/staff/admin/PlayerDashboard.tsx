"use client";

import { TSummary } from "@/app/api/staff/admins/summary/route";
import { TIER_COLOR_MAP } from "@/lib/common/constants";
import { useEffect, useState } from "react";

export default function LeagueDashboard() {
  const [summary, setSummary] = useState<TSummary>();

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch(`/api/staff/admins/summary`);
        if (!res.ok) {
          throw new Error(`Error fetching summary: ${res.status}`);
        }
        const data = await res.json();
        setSummary(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchSummary();
  }, []);

  return (
    <div className="grid grid-cols-3 gap-5">
      <OverallSummary summary={summary} />
      <SignedPlayersSummary summary={summary} />
      <FreeAgentSummary summary={summary} />
    </div>
  );
}

function OverallSummary({ summary }) {
  const signed = summary?.signedPlayerCount ?? 0;
  const freeAgents = summary?.freeAgentCount ?? 0;
  const sum = signed + freeAgents;

  return (
    <div className="flex flex-col rounded-xl bg-indigo-50">
      <div className="px-8 sm:px-10 py-10">
        <h2 className="mt-2 text-md text-vdcBlack">Active Players</h2>
        <h1 className="mt-2 max-w-lg text-3xl text-gray-600 max-lg:text-center">
          {sum}
        </h1>
      </div>
    </div>
  );
}

function SignedPlayersSummary({ summary }) {
  return (
    <div className="rounded-xl flex flex-col bg-indigo-50 p-5">
      <h2 className="text-md text-vdcBlack">
        Signed Players ({summary?.signedPlayerCount})
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {summary?.signedPlayerCountByTier?.map((tierData) => (
          <SignedPlayersByTier key={tierData.tier} tierData={tierData} />
        ))}
      </div>
    </div>
  );
}

function SignedPlayersByTier({ tierData }) {
  console.log(tierData);
  return (
    <div className="rounded-md">
      <h1 className={`text-${TIER_COLOR_MAP[tierData.tier]} text-lg`}>
        {tierData.tier}
      </h1>
      <div className="text-sm text-gray-700">
        <h2>Players: {tierData.count}</h2>
      </div>
    </div>
  );
}

function FreeAgentSummary({ summary }) {
  return (
    <div className="rounded-xl flex flex-col bg-indigo-50 p-5">
      <h2 className="text-md text-vdcBlack">
        Free Agent Pool ({summary?.freeAgentCount})
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {summary?.freeAgentCountByTier?.map((tierData) => (
          <FreeAgentsByTier key={tierData.tier} tierData={tierData} />
        ))}
      </div>
    </div>
  );
}

function FreeAgentsByTier({ tierData }) {
  return (
    <div className="rounded-md">
      <h1 className={`text-${TIER_COLOR_MAP[tierData.tier]} text-lg`}>
        {tierData.tier}
      </h1>
      <div className="text-sm text-gray-700">
        <h2>FAs: {tierData.faCount}</h2>
        <h2>RFAs: {tierData.rfaCount}</h2>
      </div>
    </div>
  );
}
