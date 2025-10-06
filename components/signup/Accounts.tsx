"use client";

import Link from "next/link";
import { UseFormRegister } from "react-hook-form";
import { TSignUpInput } from "./SignUpForm";

export default function Accounts({
  user,
  register,
}: {
  user;
  register: UseFormRegister<TSignUpInput>;
}) {
  return (
    <div className="text-sm flex flex-col py-2 gap-2">
      <div className="flex flex-col gap-1">
        <label>
          <h1>Discord Username</h1>
        </label>
        <input
          {...register("accountID", { required: true })}
          value={user.id}
          className="hidden"
        />
        <input
          value={user.name}
          readOnly
          className="w-full xl:w-1/3 text-vdcRed dark:text-gray-400 rounded-sm border p-1 font-semibold hover:cursor-not-allowed"
        />
        <p className="text-xs xl:text-sm">
          If this looks wrong, please create a bug report in the{" "}
          <a
            href={
              "https://discord.com/channels/963274331251671071/1193322044281081876"
            }
            target="_blank"
            className="text-[#5865F2] underline hover:text-blue-600"
          >
            #vdc-bug-reports
          </a>
          channel
        </p>
      </div>
      <div className="flex flex-col gap-1">
        <label>
          <h1>Primary Valorant Account</h1>
        </label>
        <select
          {...register("primaryValorantAccount", { required: true })}
          className="w-full xl:w-1/3 text-vdcRed dark:text-gray-400 rounded-sm border p-1 font-semibold"
        >
          <ValAccounts user={user} />
        </select>
        <AccountHelper user={user} />
      </div>
    </div>
  );
}

function ValAccounts({ user }: { user }) {
  return (
    <>
      <optgroup label="Your connected accounts:">
        {user.Accounts.map((account) => (
          <option key={account.id} value={account.providerAccountId}>
            {account.riotIGN}
          </option>
        ))}
      </optgroup>
    </>
  );
}

function AccountHelper({ user }: { user }) {
  if (user.Accounts.length === 0) {
    return (
      <>
        <p className="font-roboto text-xs xl:text-sm">
          No Riot account linked. Please click{" "}
          <Link href="/me" className="text-vdcRed hover:text-red-800 underline">
            here{" "}
          </Link>
          to link your Riot account.
        </p>
      </>
    );
  }
  if (user.Accounts.length === 1) {
    return (
      <>
        <p className="font-roboto text-xs xl:text-sm">
          (If you want to use an alternative account for VDC, click{" "}
          <Link
            href="/me"
            className="text-vdcRed hover:text-red-800 underline font-bold"
          >
            here
          </Link>{" "}
          to link additional Riot accounts.)
        </p>
      </>
    );
  }
}
