import UnAuthorized from "@/components/auth/Unauthorized";
import { viewerHasAccess } from "@/lib/auth/guards";
import { ADMIN_ACCESS_LIST } from "@/lib/common/constants/roles";
import ControlPanelForm from "@/components/staff/admin/control/ControlPanelForm";
import { getAllControlPanel } from "@/lib/queries/control/control";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: `VDC | Admin Control`,
  description: `Control Panel`,
};

export default async function Page() {
  if (!(await viewerHasAccess(ADMIN_ACCESS_LIST))) return <UnAuthorized />;
  const initialControls = await getAllControlPanel();
  return (
    <div className="min-h-full">
      <div className="flex flex-col gap-5 py-10">
        <header>
          <div className="flex flex-row mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 justify-between">
            <h1 className="text-3xl text-vdcRed">Admin Control Panel</h1>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-4rounded-lg">
            <div>
              <ControlPanelForm
                initialControls={initialControls}
                sections={["general", "draft", "mmr", "ban"]}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
