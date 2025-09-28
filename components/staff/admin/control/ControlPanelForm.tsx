"use client";

import { CONTROL_GROUPS } from "@/lib/common/constants";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ConfigSection, ConfigSectionSkeleton } from "./ConfigSection";
import {
  InputField,
  MapPoolSelect,
  SelectField,
  SwitchField,
  TextAreaField,
} from "./Fields";

export type TConfigItem = {
  label: string;
  value: string;
  notes: string;
};

export default function ControlPanelForm() {
  const [generalControls, setGeneralControls] = useState<TConfigItem[]>([]);
  const [mmrControls, setMmrControls] = useState<TConfigItem[]>([]);
  const [draftControls, setDraftControls] = useState<TConfigItem[]>([]);
  const [banControls, setBanControls] = useState<TConfigItem[]>([]);

  const [loading, setLoading] = useState(true);
  const { control, handleSubmit, reset } = useForm<{ [key: string]: string }>();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchControlPanel() {
      try {
        const res = await fetch("/api/internal/control");
        const { controlPanelMap } = await res.json();
        const data: TConfigItem[] = controlPanelMap;
        const groupMap: Record<string, TConfigItem[]> = {
          general: [],
          mmr: [],
          draft: [],
          ban: [],
        };

        data.forEach((item, i) => {
          const idx = i + 1;
          for (const [groupName, controlSet] of Object.entries(
            CONTROL_GROUPS
          )) {
            if (controlSet.has(idx)) {
              groupMap[groupName].push(item);
              break;
            }
          }
        });

        setGeneralControls(groupMap.general);
        setMmrControls(groupMap.mmr);
        setDraftControls(groupMap.draft);
        setBanControls(groupMap.ban);

        reset(Object.fromEntries(data.map((c) => [c.label, c.value])));
      } finally {
        setLoading(false);
      }
    }

    fetchControlPanel();
  }, [reset]);

  const onSubmit = async (formData: { [key: string]: string }) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/internal/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const { message } = await res.json();
      alert(message);
    } catch (err) {
      console.error("Failed to save:", err);
      alert("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 flex flex-col max-w-4xl mx-auto"
    >
      {loading ? (
        <>
          <ConfigSectionSkeleton />
          <ConfigSectionSkeleton />
          <ConfigSectionSkeleton />
          <ConfigSectionSkeleton />
        </>
      ) : (
        <>
          <GeneralControls
            generalControls={generalControls}
            control={control}
          />
          <DraftControls draftControls={draftControls} control={control} />
          <MmrControls mmrControls={mmrControls} control={control} />
          <BanControls banControls={banControls} control={control} />
          <button
            type="submit"
            disabled={isSaving}
            className="bg-vdcRed text-vdcWhite px-6 py-2 rounded hover:bg-red-700 disabled:opacity-50 hover:cursor-pointer"
          >
            <h1>{isSaving ? "Saving..." : "Save"}</h1>
          </button>
        </>
      )}
    </form>
  );
}

export function parseOptions(notes: string): string[] | null {
  const match = notes?.match(/options:\s*["']?(.+?)["']?$/i);
  if (!match) return null;

  return match[1]
    .split(",")
    .map((opt) => opt.trim().replace(/^["']|["']$/g, ""));
}

export function GeneralControls({ generalControls, control }) {
  return (
    <ConfigSection
      title="General Controls"
      controls={generalControls}
      control={control}
      renderField={(field, label, notes) => {
        const options = parseOptions(notes);
        if (options)
          return <SelectField field={field} label={label} options={options} />;
        if (isMapPool(label))
          return <MapPoolSelect field={field} label={label} />;
        if (isWelcomeMessage(label))
          return <TextAreaField field={field} label={label} />;
        return <InputField field={field} label={label} />;
      }}
    />
  );
}

function DraftControls({ draftControls, control }) {
  return (
    <ConfigSection
      title="Draft Controls"
      controls={draftControls}
      control={control}
      renderField={(field, label) => {
        return <SwitchField field={field} label={label} />;
      }}
    />
  );
}

function MmrControls({ mmrControls, control }) {
  return (
    <ConfigSection
      title="MMR Controls"
      controls={mmrControls}
      control={control}
    />
  );
}

function BanControls({ banControls, control }) {
  return (
    <ConfigSection
      title="Ban Order Controls"
      controls={banControls}
      control={control}
    />
  );
}

export function isWelcomeMessage(label: string) {
  if (label.toUpperCase() === "WELCOME_MESSAGE_TITLE") {
    return true;
  }
  return false;
}

export function isMapPool(label: string) {
  if (label.toUpperCase() === "MAP_POOL") {
    return true;
  }
  return false;
}
