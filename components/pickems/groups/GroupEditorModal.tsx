"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { AGENT_PICKER_OPTIONS } from "@/lib/common/constants/agents";
import { createGroup, updateGroup } from "@/app/pickems/actions";
import AgentPicker from "./AgentPicker";

type Props = {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  groupId?: number;
  initialName?: string;
  initialImage?: string;
};

function randomAgentUuid(): string {
  const index = Math.floor(Math.random() * AGENT_PICKER_OPTIONS.length);
  return AGENT_PICKER_OPTIONS[index].uuid;
}

export default function GroupEditorModal({
  open,
  onClose,
  mode,
  groupId,
  initialName,
  initialImage,
}: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    setName(initialName ?? "");
    setImage(initialImage ?? randomAgentUuid());
    setError(null);
  }, [open, initialName, initialImage]);

  const submit = async () => {
    if (name.trim().length === 0) {
      return;
    }
    setBusy(true);
    setError(null);
    const result =
      mode === "create"
        ? await createGroup({ name, image })
        : await updateGroup({ groupId: groupId!, name, image });
    setBusy(false);
    if (result.ok) {
      onClose();
      router.refresh();
    } else {
      setError(result.error ?? "Something went wrong.");
    }
  };

  const title = mode === "create" ? "Create a group" : "Edit group";
  const submitLabel = mode === "create" ? "Create" : "Save";

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="flex max-h-[85vh] w-full max-w-md flex-col gap-3 overflow-hidden rounded-2xl border border-black/10 bg-vdcWhite p-5 dark:border-white/10 dark:bg-vdcGrey">
          <DialogTitle className="text-sm font-semibold">{title}</DialogTitle>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Group name"
            maxLength={60}
            autoFocus
            className="rounded-lg border border-black/10 bg-vdcWhite px-3 py-2 text-sm text-vdcBlack dark:border-white/10 dark:bg-vdcBlack dark:text-vdcWhite"
          />
          <h2 className="text-xs text-gray-500 dark:text-gray-400">
            Group names must follow the behavior guidelines. A rule-breaking
            name will get the group deleted and may result in moderation action
            against you.
          </h2>
          <h2 className="text-[11px] uppercase tracking-wide text-vdcGrey dark:text-gray-400">
            Pick an agent
          </h2>
          <div className="overflow-auto">
            <AgentPicker value={image} onChange={setImage} />
          </div>
          {error && (
            <h2 className="text-xs font-semibold text-vdcRed">{error}</h2>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-black/10 px-4 py-2 text-sm font-bold transition-colors hover:cursor-pointer hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
            >
              <h1>Cancel</h1>
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={busy || name.trim().length === 0}
              className="rounded-lg bg-vdcRed px-4 py-2 text-sm font-bold text-white transition-colors enabled:hover:cursor-pointer enabled:hover:bg-red-700 disabled:opacity-50"
            >
              <h1>{submitLabel}</h1>
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
