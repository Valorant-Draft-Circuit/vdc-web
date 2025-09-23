import { ControlPanelID } from "@/prisma/enums/_controlpanel";
import { prisma } from "@/prisma/prismadb";

export async function getSignupState() {
  const response = await prisma.controlPanel.findFirst({
    where: { id: ControlPanelID.SIGNUP_STATE },
  });

  if (!response) throw new Error(`Didn't get a response from the database!`);
  return response.value;
}
