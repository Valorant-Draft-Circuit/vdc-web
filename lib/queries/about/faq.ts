import { prisma } from "@/lib/prisma";

export type TFAQ = {
  question: string;
  answer: string;
};

export async function getFaq(): Promise<TFAQ[]> {
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
