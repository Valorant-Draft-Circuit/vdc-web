import { auth } from "@/lib/auth";
import VerticalTab, { TTabElements } from "@/components/tabs/VerticalTab";
import DashboardPanel from "@/components/me/DashboardPanel";
import ConnectedAccounts from "@/components/me/ConnectedAccounts"
import Settings from "@/components/me/Settings";


const tabs: TTabElements[]  = [
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
    content: <Settings />,
  },
  {
    name: "Connected Accounts",
    query: "accounts",
    color: "vdcRed",
    content: <ConnectedAccounts />,
  }
];

export default function page() {
    return (
        <div className="mx-auto py-10 max-w-7xl xl:py-12 flex flex-col gap-10">
      <VerticalTab tabElements={tabs} params="section" />
      </div>
    )
}