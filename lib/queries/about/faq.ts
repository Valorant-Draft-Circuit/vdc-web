// This has been deprecated in favor of just having a json object in the app/about/page.tsx file.

import { prisma } from "@/lib/prisma";

export type Faq = {
  question: string;
  answer: string;
};

export async function getFaq(): Promise<Faq[]> {
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
