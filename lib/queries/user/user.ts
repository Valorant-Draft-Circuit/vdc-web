import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
export type TUser = Prisma.UserGetPayload<{
  include: {
    Accounts: {
      where: {
        provider: "riot";
      };
    };
    Team: {
      include: {
        Franchise: {
          include: {
            Brand: true;
          };
        };
      };
    };
    Status: true;
  };
}>;

export async function getUser(id: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: id,
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

  
  return user;
}
