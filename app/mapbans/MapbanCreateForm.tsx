"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { Tier } from "@prisma/client";
import { PickerTeam } from "@/lib/queries/teams/teams";
import { TEAM_LOGOS_URL } from "@/lib/common/constants/urls";
import {
  MAPBAN_LOBBY_FORMATS,
  MapBanLobbyFormat,
} from "@/lib/common/mapbanLobbyConfig";
import { createMapbanLobby } from "./actions";

function TierTabs({
  tiers,
  selected,
  onSelect,
}: {
  tiers: Tier[];
  selected: Tier | null;
  onSelect: (tier: Tier) => void;
}) {
  return (
    <div className="flex flex-row flex-wrap gap-2">
      {tiers.map((tier) => (
        <button
          key={tier}
          type="button"
          onClick={() => onSelect(tier)}
          className={`rounded-md px-3 py-1 uppercase tracking-wider hover:cursor-pointer ${
            tier === selected
              ? "bg-vdcRed text-vdcWhite"
              : "border border-gray-500/40 hover:brightness-90"
          }`}
        >
          <h2>{tier}</h2>
        </button>
      ))}
    </div>
  );
}

function TeamLogo({ team }: { team: PickerTeam }) {
  if (!team.logo) return null;
  return (
    <Image
      src={`${TEAM_LOGOS_URL}${team.logo}`}
      alt={team.name}
      width={100}
      height={100}
      className="size-6"
    />
  );
}

function TeamCombobox({
  teams,
  value,
  onChange,
}: {
  teams: PickerTeam[];
  value: PickerTeam | null;
  onChange: (team: PickerTeam | null) => void;
}) {
  const [query, setQuery] = useState("");
  const filtered =
    query === ""
      ? teams
      : teams.filter((team) =>
          `${team.slug} ${team.name}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        );

  return (
    <Combobox value={value} onChange={onChange} by="id">
      <div className="relative">
        <div className="flex flex-row items-center gap-2 rounded-md border border-gray-500/40 p-2">
          {value && <TeamLogo team={value} />}
          <ComboboxInput
            className="w-full bg-transparent focus:outline-none"
            placeholder="Search a team"
            displayValue={(team: PickerTeam | null) =>
              team ? `${team.slug} ${team.name}` : ""
            }
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-500/40 bg-vdcWhite dark:bg-vdcBlack">
          {filtered.map((team) => (
            <ComboboxOption
              key={team.id}
              value={team}
              className="flex flex-row items-center gap-2 p-2 hover:cursor-pointer data-[focus]:bg-vdcRed/20"
            >
              <TeamLogo team={team} />
              <h2>
                {team.slug} {team.name}
              </h2>
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </div>
    </Combobox>
  );
}

export default function MapbanCreateForm({ teams }: { teams: PickerTeam[] }) {
  const router = useRouter();

  const tiersInOrder: Tier[] = [];
  for (const team of teams) {
    if (!tiersInOrder.includes(team.tier)) tiersInOrder.push(team.tier);
  }

  const [homeTier, setHomeTier] = useState<Tier | null>(tiersInOrder[0] ?? null);
  const [awayTier, setAwayTier] = useState<Tier | null>(tiersInOrder[0] ?? null);
  const [homeTeam, setHomeTeam] = useState<PickerTeam | null>(null);
  const [awayTeam, setAwayTeam] = useState<PickerTeam | null>(null);
  const [format, setFormat] = useState<MapBanLobbyFormat>("BO1");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const homeTeams = teams.filter((team) => team.tier === homeTier);
  const awayTeams = teams.filter((team) => team.tier === awayTier);

  const selectHomeTier = (tier: Tier) => {
    setHomeTier(tier);
    setHomeTeam(null);
  };

  const selectAwayTier = (tier: Tier) => {
    setAwayTier(tier);
    setAwayTeam(null);
  };

  const submit = () => {
    setError(null);
    if (!homeTeam || !awayTeam) {
      setError("Pick both teams");
      return;
    }
    startTransition(async () => {
      const result = await createMapbanLobby({
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        format,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(`/mapbans/${result.lobbyId}`);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h2 className="uppercase tracking-wider text-vdcRed">Home (bans first)</h2>
        <TierTabs
          tiers={tiersInOrder}
          selected={homeTier}
          onSelect={selectHomeTier}
        />
        <TeamCombobox
          key={homeTier ?? "none"}
          teams={homeTeams}
          value={homeTeam}
          onChange={setHomeTeam}
        />
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="uppercase tracking-wider text-vdcRed">Away</h2>
        <TierTabs
          tiers={tiersInOrder}
          selected={awayTier}
          onSelect={selectAwayTier}
        />
        <TeamCombobox
          key={awayTier ?? "none"}
          teams={awayTeams}
          value={awayTeam}
          onChange={setAwayTeam}
        />
      </div>

      <label className="flex flex-col gap-1">
        <h2 className="uppercase tracking-wider text-vdcRed">Format</h2>
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
