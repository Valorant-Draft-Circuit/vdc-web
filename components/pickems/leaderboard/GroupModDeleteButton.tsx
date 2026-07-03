"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrashIcon } from "@heroicons/react/16/solid";

import { deleteGroup } from "@/app/pickems/actions";

type Props = {
  groupId: number;
  name: string;
  redirectTo?: string;
};

export default function GroupModDeleteButton({
  groupId,
  name,
  redirectTo,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete the group "${name}"? This removes the group and all its members and cannot be undone.`,
    );
    if (!confirmed) {
      return;
    }
    setBusy(true);
    const result = await deleteGroup({ groupId });
    setBusy(false);
    if (result.ok) {
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
    } else {
      alert(result.error ?? "Failed to delete group.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={busy}
      aria-label={`Delete ${name}`}
      className="text-vdcGrey transition-colors enabled:hover:cursor-pointer enabled:hover:text-vdcRed disabled:opacity-50 dark:text-gray-400"
    >
      <TrashIcon className="size-4" />
    </button>
  );
}
