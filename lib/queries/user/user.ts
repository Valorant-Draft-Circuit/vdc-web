import { prisma } from "@/prisma/prismadb";

export async function getUser(id) {
  const user = await prisma.user.findUnique({
    where: {
      id: "clu76oynz0000traw15nj9btz",
    },
    include: {
      Accounts: {
        where: {
          provider: "riot",
        },
      },
      Team: {
        include: {
          Franchise: {
            include: {
              Brand: true,
            },
          },
        },
      },
      Status: true,
    },
  });
  await prisma.$disconnect;
  return user;
}
