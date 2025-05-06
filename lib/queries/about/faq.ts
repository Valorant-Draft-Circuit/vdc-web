import { prisma } from "@/prisma/prismadb";

export type FAQ = {
  question: string;
  answer: string;
};

export async function getFaq(): Promise<FAQ[]> {
  const res = await prisma.fAQ.findMany({
    where: {
      visible: true,
    },
    orderBy: {
      id: "asc",
    },
    select: {
      question: true,
      answer: true,
    },
  });
  return res;
}
