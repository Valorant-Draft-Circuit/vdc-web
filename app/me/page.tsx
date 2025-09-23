// import { auth } from "@/lib/auth";
import { connection } from "next/server";
import VerticalTab, { TTabElements } from "@/components/tabs/VerticalTab";
import DashboardPanel from "@/components/me/DashboardPanel";
import ConnectedAccounts from "@/components/me/ConnectedAccounts";
import SettingsPanel from "@/components/me/SettingsPanel";

const tabs: TTabElements[] = [
  {
    name: "Dashboard",
    query: "dashboard",
    color: "vdcRed",
    content: <DashboardPanel />,
  },
  {
    name: "Settings",
    query: "settings",
    color: "vdcRed",
    content: <SettingsPanel />,
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
