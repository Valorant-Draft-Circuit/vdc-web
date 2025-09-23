import { ControlPanelID } from "@/prisma/enums/_controlpanel";
import { prisma } from "@/prisma/prismadb";

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
