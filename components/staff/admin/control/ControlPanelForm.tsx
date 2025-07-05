"use client";

import { CONTROL_GROUPS } from "@/lib/common/constants";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ConfigSection } from "./ConfigSection";
import {
  InputField,
  MapPoolSelect,
  SelectField,
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

  const { control, handleSubmit, reset } = useForm<{ [key: string]: string }>();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchControlPanel() {
      const res = await fetch("/api/internal/control");
      const { controlPanelMap } = await res.json();
      const data: TConfigItem[] = controlPanelMap;

      const groupMap: Record<string, TConfigItem[]> = {
        general: [],
        mmr: [],
        draft: [],
        ban: [],
      };

      data.forEach((item, index) => {
        const i = index + 1;

        for (const [groupName, controlSet] of Object.entries(CONTROL_GROUPS)) {
          if (controlSet.has(i)) {
            groupMap[groupName].push(item);
            break;
          }
        }
      });

      setGeneralControls(groupMap.general);
      setMmrControls(groupMap.mmr);
      setDraftControls(groupMap.draft);
      setBanControls(groupMap.ban);

      const defaults = Object.fromEntries(
        data.map((item) => [item.label, item.value])
      );
      reset(defaults);
    }

    fetchControlPanel();
  }, [reset]);

  const onSubmit = async (formData: { [key: string]: string }) => {
    setIsSaving(true);
    try {
      await fetch("/api/internal/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      alert("Settings saved successfully!");
    } catch (err) {
      console.error("Failed to save:", err);
      alert("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      className="space-y-6 flex flex-col max-w-4xl mx-auto"
      onSubmit={handleSubmit(onSubmit)}
    >
      <GeneralControls generalControls={generalControls} control={control} />
      <DraftControls draftControls={draftControls} control={control} />
      <MmrControls mmrControls={mmrControls} control={control} />
      <BanControls banControls={banControls} control={control} />
      <button
        type="submit"
        disabled={isSaving}
        className="bg-vdcRed text-vdcWhite px-6 py-2 rounded hover:bg-red-700 disabled:opacity-50 hover:cursor-pointer"
      >
        <h1> {isSaving ? "Saving..." : "Save"}</h1>
      </button>
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

function BanControls({ banControls, control }) {
  return (
    <ConfigSection
      title="Ban Controls"
      controls={banControls}
      control={control}
    />
  );
}

function DraftControls({ draftControls, control }) {
  return (
    <ConfigSection
      title="Draft Controls"
      controls={draftControls}
      control={control}
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

export function GeneralControls({ generalControls, control }) {
  return (
    <ConfigSection
      title="General League Controls"
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
