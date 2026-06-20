"use client";

import { useState } from "react";
import Image from "next/image";
import { PencilIcon } from "@heroicons/react/16/solid";
import { AGENTURL } from "@/lib/common/constants/agents";
import GroupEditorModal from "./GroupEditorModal";

type Props = {
  groupId: number;
  name: string;
  image: string;
  isOwner: boolean;
};

export default function GroupScopeTitle({
  groupId,
  name,
  image,
  isOwner,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-2.5">
      <div className="relative size-9 flex-none overflow-hidden rounded-xl">
        <Image
          src={AGENTURL(image)}
          alt={name}
          fill
          sizes="36px"
          className="object-cover"
        />
      </div>
      <h2 className="text-lg font-extrabold">{name}</h2>
      {isOwner && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Edit group"
          className="text-vdcGrey transition-colors hover:cursor-pointer hover:text-vdcRed dark:text-gray-400"
        >
          <PencilIcon className="size-4" />
        </button>
      )}
      <GroupEditorModal
        open={open}
        onClose={() => setOpen(false)}
        mode="edit"
        groupId={groupId}
        initialName={name}
        initialImage={image}
      />
    </div>
  );
}
