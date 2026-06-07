import ControlPanelForm from "@/components/staff/admin/control/ControlPanelForm";
import { getAllControlPanel } from "@/lib/queries/control/control";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: `VDC | Admin Control`,
  description: `Control Panel`,
};

export default async function Page() {
  const initialControls = await getAllControlPanel();
  return (
    <div className="min-h-full">
      <div className="flex flex-col gap-5 py-10">
        <header>
          <div className="flex flex-row mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 justify-between">
            <h1 className="text-3xl italic text-vdcRed">Admin Control Panel</h1>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-4rounded-lg">
            <div>
              <ControlPanelForm initialControls={initialControls} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
