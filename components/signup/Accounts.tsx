"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";

export default function Accounts({ user }: { user }) {
  const { register } = useForm();
  return (
    <div className="text-sm flex flex-col py-2 gap-2">
      <div>
        <label>
          <h2>Discord ID</h2>
        </label>
        <p className="text-xs xl:text-sm">
          If this looks wrong, please create a bug report in the vdc-bug-reports
          channel.
        </p>
        <select
          {...register("discordAccount", { required: true })}
          className="w-1/3 text-vdcRed rounded-sm border-1 p-1 font-semibold"
        >
          <option value={user.id}>{user.name}</option>
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label>
          <h2>Primary Valorant Account</h2>
        </label>
        <select
          {...register("priValAcc", { required: true })}
          className="w-1/3 text-vdcRed rounded-sm border-1 p-1 font-bold"
        >
          <ValAccounts user={user} />
        </select>
        <GetAccountInfo user={user} />
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

function GetAccountInfo({ user }: { user }) {
  if (user.Accounts.length === 0) {
    return (
      <>
        <p className="font-roboto mt-0">
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
        <p className="font-roboto mt-0">
          (If you want to list alternative accounts for VDC, click{" "}
          <Link href="/me" className="text-vdcRed hover:text-red-800 underline">
            here
          </Link>{" "}
          to link additional Riot accounts.)
        </p>
      </>
    );
  }
}
