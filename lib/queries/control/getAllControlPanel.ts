import { prisma } from "@/lib/prisma";

export type ControlPanelItem = {
  label: string;
  value: string;
  notes: string | null;
};

export async function getAllControlPanel(): Promise<ControlPanelItem[]> {
  const rows = await prisma.controlPanel.findMany();
  return rows.map((row) => ({
    label: row.name,
    value: row.value,
    notes: row.notes,
  }));
}
