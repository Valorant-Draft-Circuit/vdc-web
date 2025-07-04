import ControlPanelForm from "@/components/staff/admin/control/ControlPanelForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: `VDC | Admin Control`,
  description: `Control Panel`,
};

export default function Page() {

    
  return (
    <div className="min-h-full">
      <div className="flex flex-col gap-5 py-10">
        <header>
          <div className="flex flex-row mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 justify-between">
            <h1 className="text-3xl italic text-vdcRed">
              VDC Admin Control Panel
            </h1>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-white dark:bg-vdcGrey rounded-lg">
            <div>
              <ControlPanelForm />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
