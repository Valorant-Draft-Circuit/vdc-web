import { cache } from "react";
import { ControlPanelID } from "@/prisma/enums/_controlpanel";
import { prisma } from "@/lib/prisma";

export type ControlPanelItem = {
  id: number;
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

export async function getLeagueState(): Promise<string | null> {
  const row = await prisma.controlPanel.findFirst({
    where: { id: ControlPanelID.LEAGUE_STATE },
    select: { value: true },
  });
  return row?.value ?? null;
}

export type WebMapbansFlags = {
  enabled: boolean;
  staffOnly: boolean;
  allowlist: string[];
};

export const getWebMapbansFlags = cache(async (): Promise<WebMapbansFlags> => {
  const rows = await prisma.controlPanel.findMany({
    where: {
      id: {
        in: [
          ControlPanelID.WEB_MAPBANS_ENABLED,
          ControlPanelID.WEB_MAPBANS_STAFF_ONLY,
          ControlPanelID.WEB_MAPBANS_ALLOWLIST,
        ],
      },
    },
    select: { id: true, value: true },
  });
  const enabledRow = rows.find(
    (row) => row.id === ControlPanelID.WEB_MAPBANS_ENABLED,
  );
  const staffOnlyRow = rows.find(
    (row) => row.id === ControlPanelID.WEB_MAPBANS_STAFF_ONLY,
  );
  const allowlistRow = rows.find(
    (row) => row.id === ControlPanelID.WEB_MAPBANS_ALLOWLIST,
  );
  // Fail closed: the feature stays off until an admin row explicitly enables it,
  // and stays staff-only until an admin row explicitly lifts the restriction;
  // a missing allowlist row admits nobody extra.
  const enabled = enabledRow?.value === "true";
  const staffOnly = staffOnlyRow?.value
    ? staffOnlyRow.value === "true"
    : true;
  const allowlist = (allowlistRow?.value ?? "")
    .split(",")
    .map((discordId) => discordId.trim())
    .filter((discordId) => discordId.length > 0);
  return { enabled, staffOnly, allowlist };
});

export async function getAllControlPanel(): Promise<ControlPanelItem[]> {
  const rows = await prisma.controlPanel.findMany({ orderBy: { id: "asc" } });
  return rows.map((row) => ({
    id: row.id,
    label: row.name,
    value: row.value,
    notes: row.notes,
  }));
}
