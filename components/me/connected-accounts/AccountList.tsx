"use client";

import { signIn } from "next-auth/react";
import {
  ArrowPathIcon,
  LockClosedIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { useEffect, useState } from "react";

type RiotAccount = {
  providerAccountId: string;
  riotIGN: string;
};

type PlayerRiotAccounts = {
  primaryRiotAccountID: string;
  Accounts: RiotAccount[];
};

async function fetchPlayerRiotAccounts() {
  const res = await fetch("/api/player/riot");
  if (!res.ok) throw new Error("Failed to fetch accounts");
  return res.json();
}

// async function handleRemoveAccount(id: string) {
//   const payload = { job: "remove", id };
//   const res = await fetch("/api/player/riot", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(payload),
//   });
//   return res.ok;
// }

function sortAccounts(accounts: RiotAccount[], primaryRiotAccount: string) {
  return accounts
    .slice()
    .sort((a, b) =>
      a.providerAccountId === primaryRiotAccount
        ? -1
        : b.providerAccountId === primaryRiotAccount
        ? 1
        : 0
    );
}

export default function AccountList() {
  const [playerRiotAccounts, setPlayerRiotAccounts] =
    useState<PlayerRiotAccounts>();
  const [primaryRiotAccount, setPrimaryRiotAccount] = useState("");
  const [loading, setLoading] = useState(false);

  async function getPlayerRiotAccounts() {
    try {
      setLoading(true);
      const data = await fetchPlayerRiotAccounts();
      setPlayerRiotAccounts(data);
      setPrimaryRiotAccount(data.primaryRiotAccountID);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getPlayerRiotAccounts();
  }, []);

  const hasNoAccounts = !playerRiotAccounts?.Accounts?.length;

  if (loading) {
    return (
      <div className="flex m-auto">
        <h1 className="text-xl">Fetching Your Accounts...</h1>
      </div>
    );
  }

  if (hasNoAccounts) {
    return (
      <div className="flex flex-col space-y-10">
        <h1 className="text-vdcRed text-xl m-auto py-5">No accounts linked!</h1>
        <LinkAccount />
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-5 px-2">
      {playerRiotAccounts &&
        sortAccounts(playerRiotAccounts.Accounts, primaryRiotAccount).map(
          (account) => (
            <Account
              key={account.providerAccountId}
              account={account}
              primaryRiotAccount={primaryRiotAccount}
              // onRemoved={getPlayerRiotAccounts}
            />
          )
        )}
      <LinkAccount />
      <RefreshAccounts refresh={getPlayerRiotAccounts} />
    </div>
  );
}

function Account({
  account,
  primaryRiotAccount,
}: // onRemoved,
{
  account: RiotAccount;
  primaryRiotAccount: string;
  // onRemoved: () => Promise<void>;
}) {
  const [show, setShow] = useState(false);
  // const [removing, setRemoving] = useState(false);
  const isPrimaryAccount = primaryRiotAccount === account.providerAccountId;

  // async function removeAccount() {
  //   setRemoving(true);
  //   const ok = await handleRemoveAccount(account.providerAccountId);
  //   setRemoving(false);

  //   if (ok) {
  //     alert(`Successfully removed ${account.riotIGN}.`);
  //     await onRemoved();
  //   } else {
  //     alert(
  //       "Something went wrong :( Please try again or contact the VDC Admins/Tech."
  //     );
  //   }
  // }

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
      {
        isPrimaryAccount ? (
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
        )
        // TODO: extract this to Admin page in the future where admins can manually delete accounts
        // <button disabled={removing} onClick={removeAccount}>
        //   {removing ? (
        //     <LoadingSpinner />
        //   ) : (
        //     <TrashIcon className="w-7 text-vdcBlack dark:text-vdcWhite hover:cursor-pointer hover:scale-110" />
        //   )}
        // </button>
      }
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

function RefreshAccounts({ refresh }: { refresh: () => Promise<void> }) {
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
