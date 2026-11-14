import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import VerticalTab from "@/components/tabs/VerticalTab";
import { TabElement } from "@/components/tabs/types";
import ConnectedAccounts from "@/components/me/connected-accounts/ConnectedAccounts";
// import DashboardPanel from "@/components/me/DashboardPanel";
// import SettingsPanel from "@/components/me/SettingsPanel";

const tabs: TabElement[] = [
  // {
  //   name: "Dashboard",
  //   query: "dashboard",
  //   color: "vdcRed",
  //   content: <DashboardPanel />,
  // },
  // {
  //   name: "Settings",
  //   query: "settings",
  //   color: "vdcRed",
  //   content: <SettingsPanel />,
  // },
  {
    name: "Connected Accounts",
    query: "accounts",
    color: "vdcRed",
    content: <ConnectedAccounts />,
  },
];

export default async function page() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");
  return (
    <div className="mx-auto py-10 max-w-7xl xl:py-12 flex flex-col gap-10">
      <VerticalTab tabElements={tabs} params="section" />
    </div>
  );
}
