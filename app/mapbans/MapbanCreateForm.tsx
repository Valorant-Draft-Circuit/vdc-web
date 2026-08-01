"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PickerTeam } from "@/lib/queries/teams/teams";
import {
  MAPBAN_LOBBY_FORMATS,
  MapBanLobbyFormat,
} from "@/lib/common/mapbanLobbyConfig";
import { createMapbanLobby } from "./actions";

export default function MapbanCreateForm({ teams }: { teams: PickerTeam[] }) {
  const router = useRouter();
  const [homeTeamId, setHomeTeamId] = useState<number | null>(null);
  const [awayTeamId, setAwayTeamId] = useState<number | null>(null);
  const [format, setFormat] = useState<MapBanLobbyFormat>("BO1");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    setError(null);
    if (homeTeamId === null || awayTeamId === null) {
      setError("Pick both teams");
      return;
    }
    startTransition(async () => {
      const result = await createMapbanLobby({ homeTeamId, awayTeamId, format });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(`/mapbans/${result.lobbyId}`);
    });
  };

  const teamOption = (team: PickerTeam) => (
    <option key={team.id} value={team.id}>
      {team.tier} - {team.slug} {team.name}
    </option>
  );

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <h2 className="text-sm uppercase tracking-wider text-vdcRed">Home (bans first)</h2>
        <select
          className="rounded-md border border-gray-500/40 bg-transparent p-2"
          value={homeTeamId ?? ""}
          onChange={(event) => setHomeTeamId(Number(event.target.value) || null)}
        >
          <option value="">Select a team</option>
          {teams.map(teamOption)}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <h2 className="text-sm uppercase tracking-wider text-vdcRed">Away</h2>
        <select
          className="rounded-md border border-gray-500/40 bg-transparent p-2"
          value={awayTeamId ?? ""}
          onChange={(event) => setAwayTeamId(Number(event.target.value) || null)}
        >
          <option value="">Select a team</option>
          {teams.map(teamOption)}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <h2 className="text-sm uppercase tracking-wider text-vdcRed">Format</h2>
        <select
          className="rounded-md border border-gray-500/40 bg-transparent p-2"
          value={format}
          onChange={(event) => setFormat(event.target.value as MapBanLobbyFormat)}
        >
          {MAPBAN_LOBBY_FORMATS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        disabled={isPending}
        onClick={submit}
        className="rounded-md bg-vdcRed px-4 py-2 text-vdcWhite hover:brightness-90 disabled:opacity-50 hover:cursor-pointer"
      >
        <h1>Create lobby</h1>
      </button>

      {error && <h2 className="text-xs text-vdcRed">{error}</h2>}
    </div>
  );
}
