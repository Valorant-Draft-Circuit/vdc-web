"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PencilIcon } from "@heroicons/react/16/solid";
import type { GroupSummary } from "@/lib/queries/pickems/getGroups";
import { AGENTURL } from "@/lib/common/constants/agents";
import { joinGroupByCode, leaveGroup } from "@/app/pickems/actions";
import { AgentOption } from "@/lib/common/constants/agents";
import GroupEditorModal from "./GroupEditorModal";

type Props = {
  groups: GroupSummary[];
  season: number;
  agentOptions: AgentOption[];
};

export default function GroupsPanel({ groups, season, agentOptions }: Props) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
  const [editorGroup, setEditorGroup] = useState<GroupSummary | null>(null);

  const runAction = async (
    action: () => Promise<{ ok: boolean; error?: string }>,
    onOk: () => void,
  ) => {
    setBusy(true);
    setMessage(null);
    const result = await action();
    setBusy(false);
    if (result.ok) {
      onOk();
      router.refresh();
    } else {
      setMessage(result.error ?? "Something went wrong.");
    }
  };

  const handleJoin = () => {
    if (code.trim().length === 0) {
      return;
    }
    runAction(
      () => joinGroupByCode({ code }),
      () => setCode(""),
    );
  };

  const handleLeave = (groupId: number) => {
    runAction(
      () => leaveGroup({ groupId }),
      () => {},
    );
  };

  const copyCode = async (joinCode: string) => {
    await navigator.clipboard.writeText(joinCode);
    setCopied(joinCode);
    setTimeout(() => setCopied(null), 1500);
  };

  const openCreate = () => {
    setEditorMode("create");
    setEditorGroup(null);
    setEditorOpen(true);
  };

  const openEdit = (group: GroupSummary) => {
    setEditorMode("edit");
    setEditorGroup(group);
    setEditorOpen(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col rounded-2xl border border-black/10 bg-gray-100 p-4 dark:border-white/10 dark:bg-vdcGrey">
          <h1 className="mb-2.5 text-sm font-semibold">Create a group</h1>
          <button
            type="button"
            onClick={openCreate}
            className="rounded-lg bg-vdcRed px-4 py-2 text-sm font-bold text-white transition-colors hover:cursor-pointer hover:bg-red-700"
          >
            <h1>Create a group</h1>
          </button>
          <p className="mt-2 text-[11px] text-vdcGrey dark:text-gray-400">
            Pick a name and an agent. You&apos;ll get a shareable join code for
            this season.
          </p>
        </div>

        <div className="rounded-2xl border border-black/10 bg-gray-100 p-4 dark:border-white/10 dark:bg-vdcGrey">
          <h1 className="mb-2.5 text-sm font-semibold">Join a group</h1>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter join code"
              className="flex-1 rounded-lg border border-black/10 bg-vdcWhite px-3 py-2 text-sm uppercase text-vdcBlack dark:border-white/10 dark:bg-vdcBlack dark:text-vdcWhite"
            />
            <button
              type="button"
              onClick={handleJoin}
              disabled={busy || code.trim().length === 0}
              className="rounded-lg border border-black/10 bg-black/5 px-4 py-2 text-sm font-bold transition-colors enabled:hover:cursor-pointer enabled:hover:bg-black/10 disabled:opacity-50 dark:border-white/10 dark:bg-black/25 dark:enabled:hover:bg-black/40"
            >
              <h1>Join</h1>
            </button>
          </div>
          <p className="mt-2 text-[11px] text-vdcGrey dark:text-gray-400">
            Ask the group owner for the code.
          </p>
        </div>
      </div>

      {message && (
        <h2 className="text-xs font-semibold text-vdcRed">{message}</h2>
      )}

      <div>
        <h2 className="mb-2.5 text-[11px] uppercase tracking-wide text-vdcGrey dark:text-gray-400">
          My groups
        </h2>
        {groups.length === 0 ? (
          <h2 className="py-6 text-center text-sm text-vdcGrey dark:text-gray-400">
            You&apos;re not in any groups for season {season} yet.
          </h2>
        ) : (
          <div className="flex flex-col gap-2.5">
            {groups.map((group) => {
              const copyLabel = copied === group.joinCode ? "COPIED" : "COPY";
              return (
                <div
                  key={group.id}
                  className="flex items-center gap-3.5 rounded-2xl border border-black/10 bg-gray-100 px-4 py-3 dark:border-white/10 dark:bg-vdcGrey"
                >
                  <div className="relative size-10 flex-none overflow-hidden rounded-xl">
                    <Image
                      src={AGENTURL(group.image)}
                      alt={group.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="flex items-center text-[15px] font-bold">
                      {group.name}
                      {group.isOwner && (
                        <b className="ml-1.5 rounded border border-vdcRed px-1 py-px text-[9px] font-extrabold text-vdcRed">
                          OWNER
                        </b>
                      )}
                      {group.isOwner && (
                        <button
                          type="button"
                          onClick={() => openEdit(group)}
                          aria-label="Edit group"
                          className="ml-1.5 text-vdcGrey transition-colors hover:cursor-pointer hover:text-vdcRed dark:text-gray-400"
                        >
                          <PencilIcon className="size-3.5" />
                        </button>
                      )}
                    </h2>
                    <h2 className="text-xs text-vdcGrey dark:text-gray-400">
                      {group.memberCount} members &middot; Season {group.season}
                    </h2>
                    {group.isOwner && (
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-vdcGrey dark:text-gray-400">
                        <h1>code:</h1>
                        <h2 className="rounded border border-black/10 bg-vdcWhite px-2 py-0.5 font-mono font-normal tracking-wide text-vdcBlack dark:border-white/10 dark:bg-vdcBlack dark:text-vdcWhite">
                          {group.joinCode}
                        </h2>
                        <button
                          type="button"
                          onClick={() => copyCode(group.joinCode)}
                          className="text-[10px] font-bold text-vdcRed transition-colors hover:cursor-pointer hover:text-red-700"
                        >
                          <h1>{copyLabel}</h1>
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Link
                      href={`/pickems/leaderboard?scope=group:${group.id}&season=${group.season}`}
                      className="text-xs font-bold text-vdcRed underline underline-offset-2 transition-colors hover:cursor-pointer hover:text-red-700"
                    >
                      <h1>Leaderboard</h1>
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleLeave(group.id)}
                      disabled={busy}
                      className="text-[11px] text-vdcGrey transition-colors enabled:hover:cursor-pointer enabled:hover:text-vdcRed disabled:opacity-50 dark:text-gray-400"
                    >
                      <h1>Leave</h1>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <GroupEditorModal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        mode={editorMode}
        agentOptions={agentOptions}
        groupId={editorGroup?.id}
        initialName={editorGroup?.name}
        initialImage={editorGroup?.image}
      />
    </div>
  );
}
