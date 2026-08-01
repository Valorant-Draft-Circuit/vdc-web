"use client";

import { CONTROL_GROUPS } from "@/lib/common/constants/controls";
import { useMemo, useState } from "react";
import { Control, useForm } from "react-hook-form";
import { ConfigSection } from "./ConfigSection";
import {
  DateField,
  InputField,
  MapPoolSelect,
  SelectField,
  SwitchField,
  TextAreaField,
} from "./Fields";
import { updateControlPanelAction } from "@/app/staff/admin/control/actions";
import type { ControlPanelItem } from "@/lib/queries/control/control";

export type ConfigItem = {
  id: number;
  label: string;
  value: string;
  notes: string;
};

type ControlsSectionProps = {
  control: Control;
};

export default function ControlPanelForm({
  initialControls,
  sections,
}: {
  initialControls: ControlPanelItem[];
  sections: string[];
}) {
  const items: ConfigItem[] = useMemo(
    () =>
      initialControls.map((item) => ({
        id: item.id,
        label: item.label,
        value: item.value,
        notes: item.notes ?? "",
      })),
    [initialControls],
  );

  const groupedControls = useMemo(() => {
    const groupMap: Record<string, ConfigItem[]> = {
      general: [],
      mmr: [],
      draft: [],
      ban: [],
      pickems: [],
      webMapbans: [],
      queuebot: [],
      playoff: [],
      matchPoller: [],
    };
    items.forEach((item) => {
      for (const [groupName, controlIds] of Object.entries(CONTROL_GROUPS)) {
        if (controlIds.includes(item.id)) {
          groupMap[groupName].push(item);
          break;
        }
      }
    });
    for (const [groupName, controlIds] of Object.entries(CONTROL_GROUPS)) {
      groupMap[groupName].sort(
        (first, second) =>
          controlIds.indexOf(first.id) - controlIds.indexOf(second.id),
      );
    }
    return groupMap;
  }, [items]);

  const defaultValues = useMemo(
    () => Object.fromEntries(items.map((c) => [c.label, c.value])),
    [items],
  );

  const { control, handleSubmit } = useForm<{ [key: string]: string }>({
    defaultValues,
  });
  const [isSaving, setIsSaving] = useState(false);

  const onSubmit = async (formData: { [key: string]: string }) => {
    setIsSaving(true);
    const result = await updateControlPanelAction(formData);
    setIsSaving(false);
    if (result.ok) {
      alert("Control Panel values successfully updated.");
    } else {
      alert(`Failed to save: ${result.error}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 flex flex-col max-w-4xl mx-auto"
    >
      {sections.map((section) =>
        renderSection(section, groupedControls[section] ?? [], control),
      )}
      <button
        type="submit"
        disabled={isSaving}
        className="bg-vdcRed text-vdcWhite px-6 py-2 rounded hover:bg-red-700 disabled:opacity-50 hover:cursor-pointer"
      >
        <h1>{isSaving ? "Saving..." : "Save"}</h1>
      </button>
    </form>
  );
}

function renderSection(
  section: string,
  items: ConfigItem[],
  control: Control,
) {
  if (items.length === 0) {
    return null;
  }
  switch (section) {
    case "general":
      return (
        <GeneralControls
          key={section}
          generalControls={items}
          control={control}
        />
      );
    case "draft":
      return (
        <DraftControls key={section} draftControls={items} control={control} />
      );
    case "mmr":
      return <MmrControls key={section} mmrControls={items} control={control} />;
    case "ban":
      return <BanControls key={section} banControls={items} control={control} />;
    case "pickems":
      return (
        <PickemControls
          key={section}
          pickemControls={items}
          control={control}
        />
      );
    case "webMapbans":
      return (
        <WebMapbansControls
          key={section}
          webMapbansControls={items}
          control={control}
        />
      );
    case "queuebot":
      return (
        <QueuebotControls
          key={section}
          queuebotControls={items}
          control={control}
        />
      );
    case "playoff":
      return (
        <PlayoffControls key={section} playoffControls={items} control={control} />
      );
    case "matchPoller":
      return (
        <MatchPollerControls
          key={section}
          matchPollerControls={items}
          control={control}
        />
      );
    default:
      return null;
  }
}

export function parseOptions(notes: string): string[] | null {
  const match = notes?.match(/options:\s*["']?(.+?)["']?$/i);
  if (!match) return null;

  return match[1]
    .split(",")
    .map((opt) => opt.trim().replace(/^["']|["']$/g, ""));
}

export function GeneralControls({
  generalControls,
  control,
}: ControlsSectionProps & { generalControls: ConfigItem[] }) {
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

function DraftControls({
  draftControls,
  control,
}: ControlsSectionProps & { draftControls: ConfigItem[] }) {
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

function MmrControls({
  mmrControls,
  control,
}: ControlsSectionProps & { mmrControls: ConfigItem[] }) {
  return (
    <ConfigSection
      title="MMR Controls"
      controls={mmrControls}
      control={control}
    />
  );
}

function BanControls({
  banControls,
  control,
}: ControlsSectionProps & { banControls: ConfigItem[] }) {
  return (
    <ConfigSection
      title="Ban Order Controls"
      controls={banControls}
      control={control}
    />
  );
}

function QueuebotControls({
  queuebotControls,
  control,
}: ControlsSectionProps & { queuebotControls: ConfigItem[] }) {
  return (
    <ConfigSection
      title="Queuebot Controls"
      controls={queuebotControls}
      control={control}
      renderField={(field, label) =>
        label.toLowerCase() === "queue_enabled" ? (
          <SwitchField field={field} label={label} />
        ) : null
      }
    />
  );
}

function PickemControls({
  pickemControls,
  control,
}: ControlsSectionProps & { pickemControls: ConfigItem[] }) {
  return (
    <ConfigSection
      title="Pick'ems Controls"
      controls={pickemControls}
      control={control}
      renderField={(field, label) =>
        label.toUpperCase() === "PICKEM_ADVANCE_LOCK" ||
        label.toUpperCase() === "PICKEM_BRACKET_LOCK" ? (
          <DateField field={field} label={label} />
        ) : (
          <SwitchField field={field} label={label} />
        )
      }
    />
  );
}

function WebMapbansControls({
  webMapbansControls,
  control,
}: ControlsSectionProps & { webMapbansControls: ConfigItem[] }) {
  return (
    <ConfigSection
      title="Web Map Bans Controls"
      controls={webMapbansControls}
      control={control}
      renderField={(field, label) =>
        label.toUpperCase() === "WEB_MAPBANS_PAGER_MINUTES" ? (
          <InputField field={field} label={label} />
        ) : (
          <SwitchField field={field} label={label} />
        )
      }
    />
  );
}

function PlayoffControls({
  playoffControls,
  control,
}: ControlsSectionProps & { playoffControls: ConfigItem[] }) {
  return (
    <ConfigSection
      title="Playoff Predictions"
      controls={playoffControls}
      control={control}
      renderField={(field, label) => (
        <SwitchField field={field} label={label} />
      )}
    />
  );
}

function MatchPollerControls({
  matchPollerControls,
  control,
}: ControlsSectionProps & { matchPollerControls: ConfigItem[] }) {
  return (
    <ConfigSection
      title="Auto-Submit Poller"
      controls={matchPollerControls}
      control={control}
      renderField={(field, label) =>
        label.toLowerCase() === "match_poller_enabled" ? (
          <SwitchField field={field} label={label} />
        ) : (
          <InputField field={field} label={label} />
        )
      }
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
