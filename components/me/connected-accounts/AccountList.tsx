"use client";

import { signIn } from "next-auth/react";
import {
  ArrowPathIcon,
  LockClosedIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { RiotAccountRow } from "@/lib/queries/user/user";

function sortAccounts(accounts: RiotAccountRow[], primaryRiotAccount: string) {
  return accounts
    .slice()
    .sort((a, b) =>
      a.providerAccountId === primaryRiotAccount
        ? -1
        : b.providerAccountId === primaryRiotAccount
          ? 1
          : 0,
    );
}

export default function AccountList({
  accounts,
  primaryRiotAccountID,
}: {
  accounts: RiotAccountRow[];
  primaryRiotAccountID: string;
}) {
  const router = useRouter();

  if (accounts.length === 0) {
    return (
      <div className="flex flex-col space-y-10">
        <h1 className="text-vdcRed text-xl m-auto py-5">No accounts linked!</h1>
        <LinkAccount />
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-5 px-2">
      {sortAccounts(accounts, primaryRiotAccountID).map((account) => (
        <Account
          key={account.providerAccountId}
          account={account}
          primaryRiotAccount={primaryRiotAccountID}
        />
      ))}
      <LinkAccount />
      <RefreshAccounts refresh={() => router.refresh()} />
    </div>
  );
}

function Account({
  account,
  primaryRiotAccount,
}: {
  account: RiotAccountRow;
  primaryRiotAccount: string;
}) {
  const [show, setShow] = useState(false);
  const isPrimaryAccount = primaryRiotAccount === account.providerAccountId;

  return (
    <div className="flex items-center justify-between rounded-3xl px-8 py-6 shadow-lg bg-vdcWhite dark:bg-vdcBlack hover:text-vdcRed w-full max-w-xl mx-auto">
      <Image
        src="external/riot-logo.svg"
        width={50}
        height={50}
        alt="riot-logo"
      />
      <h1 className="flex-1 text-center text-md break-all font-semibold text-vdcBlack dark:text-vdcWhite">
        {account.riotIGN}
      </h1>
      {isPrimaryAccount ? (
        <Image src="vdc-flame.svg" width={25} height={25} alt="vdcFlame" />
      ) : (
        <div
          className="relative"
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
        >
          <LockClosedIcon className="w-7 text-vdcBlack dark:text-vdcWhite" />
          <DeleteTooltip show={show} />
        </div>
      )}
    </div>
  );
}

function LinkAccount() {
  return (
    <button onClick={() => signIn("riot")}>
      <div className="flex items-center justify-center rounded-3xl px-8 py-8 shadow-lg dark:bg-vdcBlack hover:cursor-pointer hover:brightness-90 hover:scale-101 hover:text-vdcRed w-full max-w-xl mx-auto">
        <PlusIcon className="w-7 text-vdcBlack dark:text-vdcWhite" />
      </div>
    </button>
  );
}

function RefreshAccounts({ refresh }: { refresh: () => void }) {
  return (
    <button onClick={refresh}>
      <div className="flex flex-row space-x-5 items-center justify-center rounded-3xl py-5 hover:cursor-pointer hover:scale-101">
        <h1 className="text-vdcRed animate-none">refresh</h1>
        <ArrowPathIcon className="w-7 text-vdcBlack dark:text-vdcWhite hover:animate-spin" />
      </div>
    </button>
  );
}

function DeleteTooltip({ show }: { show: boolean }) {
  return (
    <>
      {show && (
        <div className="absolute z-10 bottom-full w-32 h-auto mb-1 left-1/2 -translate-x-1/2 text-center bg-vdcRed text-white text-xs rounded px-2 py-2 shadow-xl">
          <h2>
            If you need to unlink an account, please create an admin ticket.
          </h2>
        </div>
      )}
    </>
  );
}
