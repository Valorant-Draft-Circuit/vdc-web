"use client";

import Image from "next/image";
import {
  AGENT_PICKER_OPTIONS,
  AGENTURL,
} from "@/lib/common/constants/agents";

type Props = {
  value: string;
  onChange: (uuid: string) => void;
};

export default function AgentPicker({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
      {AGENT_PICKER_OPTIONS.map((agent) => {
        const isSelected = agent.uuid === value;
        const borderClass = isSelected
          ? "border-vdcRed"
          : "border-transparent hover:border-vdcGrey";
        return (
          <button
            key={agent.uuid}
            type="button"
            onClick={() => onChange(agent.uuid)}
            aria-label={agent.name}
            aria-pressed={isSelected}
            className={`relative aspect-square overflow-hidden rounded-lg border-2 bg-black/5 transition-colors hover:cursor-pointer dark:bg-black/25 ${borderClass}`}
          >
            <Image
              src={AGENTURL(agent.uuid)}
              alt={agent.name}
              fill
              sizes="64px"
              className="object-cover"
            />
          </button>
        );
      })}
    </div>
  );
}
