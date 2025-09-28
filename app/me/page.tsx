// import { auth } from "@/lib/auth";
import { connection } from "next/server";
import VerticalTab, { TTabElements } from "@/components/tabs/VerticalTab";
import ConnectedAccounts from "@/components/me/connected-accounts/ConnectedAccounts";
import { auth } from "@/lib/auth/auth";
import UnAuthorized from "@/components/auth/Unauthorized";
import { hasAccess } from "@/lib/auth/access";
import { Roles } from "@/prisma";
// import DashboardPanel from "@/components/me/DashboardPanel";
// import SettingsPanel from "@/components/me/SettingsPanel";

const tabs: TTabElements[] = [
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

  // TODO: remove after testing riot account linking
  const userRole = session?.user?.roles || "";
  if (!hasAccess(userRole, [Roles.ADMIN, Roles.LEAD_TECH])) {
    return <UnAuthorized />;
  }
  //

  await connection();
  return (
    <div className="mx-auto py-10 max-w-7xl xl:py-12 flex flex-col gap-10">
      <VerticalTab tabElements={tabs} params="section" />
    </div>
  );
}
