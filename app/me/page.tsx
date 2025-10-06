// import { auth } from "@/lib/auth";
import { connection } from "next/server";
import VerticalTab, { TTabElements } from "@/components/tabs/VerticalTab";
import ConnectedAccounts from "@/components/me/connected-accounts/ConnectedAccounts";
import Dashboard from "@/components/me/dashboard/Dashboard";
import Settings from "@/components/me/settings/Settings";

const tabs: TTabElements[] = [
  {
    name: "Dashboard",
    query: "dashboard",
    color: "vdcRed",
    content: <Dashboard />,
  },
  {
    name: "Settings",
    query: "settings",
    color: "vdcRed",
    content: <Settings />,
  },
  {
    name: "Connected Accounts",
    query: "accounts",
    color: "vdcRed",
    content: <ConnectedAccounts />,
  },
];

export default async function page() {
  await connection();
  return (
    <div className="mx-auto py-10 max-w-7xl xl:py-12 flex flex-col gap-10">
      <VerticalTab tabElements={tabs} params="section" />
    </div>
  );
}
