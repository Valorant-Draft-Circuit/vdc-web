"use client";

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import { Tier } from "@prisma/client";
import { ROLE_ORDER, type RoleName } from "@/lib/common/constants/roles";
import { TIERS_LIST } from "@/lib/common/constants/tiers";
import Link from "next/link";
import {
  COMPARABLE_STAT_LABELS,
  LOWER_IS_BETTER,
  bestPeer,
  filterPeers,
  formatStatValue,
  ordinal,
  percentileAndRank,
  titleCaseRole,
  type AggregatedStats,
  type ComparableStat,
  type PeerRow,
  type RoleFilter,
  type TierFilter,
} from "@/lib/common/indepth";

const STAT_OPTIONS = Object.keys(COMPARABLE_STAT_LABELS) as ComparableStat[];

function titleCaseTier(tier: Tier): string {
  return tier.charAt(0) + tier.slice(1).toLowerCase();
}

export default function PeerComparison({
  agg,
  pool,
  primaryRole,
  selfTier,
  stat,
  role,
  tier,
  onStat,
  onRole,
  onTier,
}: {
  agg: AggregatedStats;
  pool: PeerRow[];
  primaryRole: RoleName | null;
  selfTier: Tier | null;
  stat: ComparableStat;
  role: RoleFilter;
  tier: TierFilter;
  onStat: (stat: ComparableStat) => void;
  onRole: (role: RoleFilter) => void;
  onTier: (tier: TierFilter) => void;
}) {
  const peers = filterPeers(pool, { role, tier });
  const value = agg[stat];
  const dist = percentileAndRank(
    value,
    peers.map((peer) => peer.stats[stat]),
    LOWER_IS_BETTER.has(stat),
  );
  const statLeader = bestPeer(peers, stat);

  const markerPct =
    dist && dist.max !== dist.min
      ? ((value - dist.min) / (dist.max - dist.min)) * 100
      : 50;
  const medianPct =
    dist && dist.max !== dist.min
      ? ((dist.median - dist.min) / (dist.max - dist.min)) * 100
      : 50;

  const statOptions = STAT_OPTIONS.map((statOption) => ({
    value: statOption,
    label: COMPARABLE_STAT_LABELS[statOption],
  }));
  const roleOptions = [
    { value: "ANY", label: "ALL" },
    ...(primaryRole ? [{ value: primaryRole, label: "Primary" }] : []),
    ...ROLE_ORDER.filter((roleOption) => roleOption !== primaryRole).map(
      (roleOption) => ({
        value: roleOption,
        label: titleCaseRole(roleOption),
      }),
    ),
  ];
  const tierOptions = [
    { value: "ANY", label: "ALL" },
    ...(selfTier ? [{ value: selfTier, label: titleCaseTier(selfTier) }] : []),
    ...TIERS_LIST.filter((tierOption) => tierOption !== selfTier).map(
      (tierOption) => ({
        value: tierOption,
        label: titleCaseTier(tierOption),
      }),
    ),
  ];

  return (
    <div className="relative z-10 bg-vdcWhite/40 dark:bg-vdcBlack/40 backdrop-blur-sm rounded-md">
      <div className="px-4 pt-3">
        <h1 className="text-md tracking-wider text-vdcRed">Compare</h1>
      </div>
      <div className="px-4 py-3 flex flex-col gap-3">
        <div className="flex flex-row flex-wrap gap-2 text-xs">
          <FilterSelect
            label="Stat"
            value={stat}
            onChange={(next) => onStat(next as ComparableStat)}
            options={statOptions}
          />
          <FilterSelect
            label="Role"
            value={role}
            onChange={(next) => onRole(next as RoleFilter)}
            options={roleOptions}
          />
          <FilterSelect
            label="Tier"
            value={tier}
            onChange={(next) => onTier(next as TierFilter)}
            options={tierOptions}
          />
        </div>

        <div className="flex flex-row items-baseline gap-2">
          <h2 className="text-xs text-gray-500 dark:text-gray-400">
            {COMPARABLE_STAT_LABELS[stat]}:
          </h2>
          <h1 className="text-2xl">{formatStatValue(stat, value)}</h1>
        </div>

        {dist ? (
          <>
            <h2 className="text-xs text-gray-500 dark:text-gray-400">
              {ordinal(dist.percentile)} percentile · #{dist.rank} of{" "}
              {dist.count}
            </h2>
            <div className="relative h-2 rounded-full bg-gradient-to-r from-vdcRed via-vdcYellow to-vdcGreen">
              <span
                className="absolute -top-1 w-px h-4 bg-gray-400"
                style={{ left: `${medianPct}%` }}
              />
              <span
                className="absolute -top-1.5 w-1 h-5 rounded-sm bg-vdcWhite border border-vdcBlack"
                style={{ left: `${markerPct}%` }}
              />
            </div>
            <div className="flex flex-row justify-between text-[10px] font-normal text-gray-500 dark:text-gray-400">
              <h2 className="font-normal">
                Min {formatStatValue(stat, dist.min)}
              </h2>
              <h2 className="font-normal">
                Median {formatStatValue(stat, dist.median)}
              </h2>
              <h2 className="font-normal">
                Max {formatStatValue(stat, dist.max)}
              </h2>
            </div>
            {statLeader?.ign ? (
              <h2 className="text-xs font-normal text-gray-500 dark:text-gray-400">
                Top:{" "}
                <Link
                  href={`/player/${encodeURIComponent(statLeader.ign)}`}
                  className="text-vdcRed hover:brightness-90"
                >
                  {statLeader.ign}
                </Link>{" "}
                · {formatStatValue(stat, statLeader.stats[stat])}
              </h2>
            ) : null}
          </>
        ) : (
          <h2 className="text-xs text-gray-500 dark:text-gray-400">
            Not enough peers for this filter.
          </h2>
        )}
      </div>
    </div>
  );
}

type FilterOption = { value: string; label: string };

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}) {
  const selected =
    options.find((option) => option.value === value) ?? options[0];

  return (
    <div className="relative">
      <Listbox value={selected} onChange={(next) => onChange(next.value)}>
        <ListboxButton className="flex items-center gap-1 rounded-full border border-vdcBlack/30 dark:border-vdcWhite/30 px-2 py-1 cursor-pointer hover:bg-vdcBlack/5 dark:hover:bg-vdcWhite/10">
          <h2 className="font-normal text-gray-500 dark:text-gray-400">
            {label}:
          </h2>
          <h2 className="text-vdcRed">{selected.label}</h2>
          <ChevronDownIcon className="size-3 fill-gray-500" />
        </ListboxButton>

        <ListboxOptions
          transition
          className="z-50 absolute bg-vdcWhite dark:bg-vdcBlack rounded-sm mt-1 min-w-full w-max border border-gray-300 dark:border-vdcGrey focus:outline-none transition duration-100 ease-in data-leave:data-closed:opacity-0"
        >
          {options.map((option) => (
            <ListboxOption
              key={option.value}
              value={option}
              className="relative rounded-sm group flex cursor-pointer items-center gap-2 pl-3 pr-8 py-1.5 hover:bg-slate-200 dark:hover:bg-vdcGrey"
            >
              <h1 className="text-xs/6 font-normal normal-case text-vdcGrey dark:text-vdcWhite">
                {option.label}
              </h1>
              <div className="absolute right-0 pr-2">
                <CheckIcon
                  className={`${
                    option.value === selected.value ? "visible" : "invisible"
                  } size-3.5 fill-vdcRed`}
                />
              </div>
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Listbox>
    </div>
  );
}
