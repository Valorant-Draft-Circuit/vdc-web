import { prisma } from "@/prisma/prismadb";

export default async function getFaq() {
  const res = await prisma.fAQ.findMany({
    where: {
      visible: true,
    },
    orderBy: {
      id: "asc",
    },
  });
  await prisma.$disconnect();
  return res;
}
