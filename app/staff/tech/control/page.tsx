import ControlPanelForm from "@/components/staff/admin/control/ControlPanelForm";
import { getAllControlPanel } from "@/lib/queries/control/control";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: `VDC | Tech Control`,
  description: `Tech Control Panel`,
};

export default async function Page() {
  const initialControls = await getAllControlPanel();
  return (
    <div className="min-h-full">
      <div className="flex flex-col gap-5 py-10">
        <main>
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-4rounded-lg">
            <div>
              <ControlPanelForm
                initialControls={initialControls}
                sections={[
                  "pickems",
                  "webMapbans",
                  "queuebot",
                  "playoff",
                  "matchPoller",
                ]}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
