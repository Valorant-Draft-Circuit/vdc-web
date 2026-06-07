import { ControlPanelID } from "@/prisma/enums/_controlpanel";
import { prisma } from "@/lib/prisma";

export type ControlPanelItem = {
  label: string;
  value: string;
  notes: string | null;
};

export async function getSignupState() {
  const response = await prisma.controlPanel.findFirst({
    where: { id: ControlPanelID.SIGNUP_STATE },
  });

  if (!response) {
    console.error(
      "Failed to fetch value from database. If you are seeing this message, please contact VDC Tech/Admins"
    );
    return "CLOSED";
  }
  return response.value;
}

export async function getAllControlPanel(): Promise<ControlPanelItem[]> {
  const rows = await prisma.controlPanel.findMany();
  return rows.map((row) => ({
    label: row.name,
    value: row.value,
    notes: row.notes,
  }));
}
