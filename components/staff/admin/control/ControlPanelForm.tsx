"use client";

import {
  BAN_CONTROL,
  CONTROL_GROUPS,
  DRAFT_CONTROL,
  GENERAL_CONTROL,
  MMR_CONTROL,
} from "@/lib/common/constants";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

type ConfigItem = {
  label: string;
  value: string;
  notes: string;
};

export default function ControlPanelForm() {
  const [configItems, setConfigItems] = useState<ConfigItem[]>([]);
  const [generalControls, setGeneralControls] = useState<ConfigItem[]>([]);
  const [mmrControls, setMmrControls] = useState<ConfigItem[]>([]);
  const [draftControls, setDraftControls] = useState<ConfigItem[]>([]);
  const [banControls, setBanControls] = useState<ConfigItem[]>([]);

  const { control, handleSubmit, reset } = useForm<{ [key: string]: string }>();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchControlPanel() {
      const res = await fetch("/api/internal/control");
      const { controlPanelMap } = await res.json();
      const data: ConfigItem[] = controlPanelMap;

      const groupMap: Record<string, ConfigItem[]> = {
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
      setConfigItems(data);

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

  console.log("general:", generalControls);
  console.log("mmr:", mmrControls);
  console.log("draft:", draftControls);
  console.log("ban:", banControls);

  return (
    <div className="space-y-6 flex flex-col max-w-4xl mx-auto p-6">
      <h1 className="text-2xl">GENERAL</h1>
      <GeneralControlPanel generalConfig={generalControls} />
    </div>
    // <form
    //   onSubmit={handleSubmit(onSubmit)}
    //   className="space-y-6 max-w-4xl mx-auto p-6"
    // >
    //   {configItems.map(({ label, notes }) => (
    //     <div key={label}>
    //       <label
    //         className="block font-medium mb-1 uppercase text-vdcRed"
    //         htmlFor={label}
    //       >
    //         <h1> {label.replace("_", " ")}</h1>
    //       </label>
    //       <Controller
    //         name={label}
    //         control={control}
    //         render={({ field }) => (
    //           <input
    //             id={label}
    //             {...field}
    //             className="w-full p-2 border border-gray-300 rounded"
    //           />
    //         )}
    //       />
    //       {notes && <p className="text-sm mt-1">{notes}</p>}
    //     </div>
    //   ))}

    //   <button
    //     type="submit"
    //     disabled={isSaving}
    //     className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
    //   >
    //     {isSaving ? "Saving..." : "Save"}
    //   </button>
    // </form>
  );
}

function GeneralControlPanel({ generalConfig }) {
  return (
    <div>
      <h1>this is general</h1>
    </div>
  );
}
