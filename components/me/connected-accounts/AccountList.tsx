"use client";

import { signIn } from "next-auth/react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useEffect, useState } from "react";
type TRiotAccount = {
  providerAccountId: string;
  riotIGN: string;
};

type TPlayerRiotAccounts = {
  primaryRiotAccountID: string;
  Accounts: TRiotAccount[];
};

export default function AccountList() {
  const [playerRiotAccounts, setPlayerRiotAccounts] =
    useState<TPlayerRiotAccounts>();
  const [primaryRiotAccount, setPrimaryRiotAccount] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function getPlayerRiotAccounts() {
      await fetch("/api/player/riot")
        .then((res) => res.json())
        .then((data) => {
          setPlayerRiotAccounts(data);
          setPrimaryRiotAccount(data.primaryRiotAccountID);
          setLoading(false);
        })
        .catch((err) => {
          setError(true);
        });
    }
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
    <div className="flex flex-col space-y-5">
      <>
        {playerRiotAccounts?.Accounts.map((account) => (
          <Account
            key={account.providerAccountId}
            account={account}
            primaryRiotAccount={primaryRiotAccount}
          />
        ))}
        <LinkAccount />
      </>
    </div>
  );
}

function Account({ account, primaryRiotAccount }) {
  const isPrimaryAccount = primaryRiotAccount === account.providerAccountId;

  return (
    <div className="flex items-center justify-between rounded-3xl px-8 py-6 shadow-lg dark:bg-vdcBlack hover:cursor-pointer hover:text-vdcRed w-full max-w-xl mx-auto">
      <Image
        src={"external/riot-logo.svg"}
        width={50}
        height={50}
        alt="riot-logo"
      />

      <h1 className="flex-1 text-center text-md text-wrap wrap-normal break-all font-semibold text-vdcBlack dark:text-vdcWhite">
        {account.riotIGN}
      </h1>

      {isPrimaryAccount ? (
        <Image src={"vdc-flame.svg"} width={25} height={25} alt="vdcFlame" />
      ) : (
        <TrashIcon className="w-7 text-vdcBlack dark:text-vdcWhite" />
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
