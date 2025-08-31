import { auth } from "@/lib/auth";
import VerticalTab, { TTabElements } from "@/components/tabs/VerticalTab";
import Dashboard from "@/components/me/Dashboard";
import ConnectedAccounts from "@/components/me/ConnectedAccounts"
import Settings from "@/components/me/Settings";


const tabs: TTabElements[]  = [
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
  }
];

export default function page() {
    return (
        <div className="mx-auto py-10 max-w-7xl xl:py-12 flex flex-col gap-10">
      <h1 className="text-vdcRed italic text-3xl text-center xl:ml-30">
            Tee Hee
      </h1>
      <VerticalTab tabElements={tabs} params="section" />
      </div>
    )
}