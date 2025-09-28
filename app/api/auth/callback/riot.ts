import { auth } from "@/lib/auth/auth";
import { prisma } from "@/prisma/prismadb";

const provider = "https://auth.riotgames.com";
const tokenUrl = provider + "/token";
const userInfoUrl = provider + "/userinfo";
const valUserInfoUrl =
  "https://americas.api.riotgames.com/riot/account/v1/accounts/me";

const appCallbackUrl = `${process.env.NEXTAUTH_URL}/api/auth/callback/riot`;

const handler = async (req, res) => {
  const accessCode = req.query.code;
  const callbackUrl =
    req?.cookies?.["__Secure-next-auth.callback-url"] ?? "/me";

  try {
    const tokenResponse = await fetch(tokenUrl, {
      method: "post",
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: accessCode,
        redirect_uri: appCallbackUrl,
      }),
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            process.env.RIOT_CLIENT_ID + ":" + process.env.RIOT_CLIENT_SECRET
          ).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    const payload = await tokenResponse.json();

    if (tokenResponse.status !== 200) {
      throw new Error("Error fetching access token", payload);
    }
    const tokens = {
      refresh_token: payload.refresh_token,
      id_token: payload.id_token,
      access_token: payload.access_token,
    };

    const userResponse = await fetch(userInfoUrl, {
      headers: { Authorization: "Bearer " + tokens.access_token },
    });

    const userInfo = await userResponse.json();
    const userResponseVal = await fetch(valUserInfoUrl, {
      headers: { Authorization: "Bearer " + tokens.access_token },
    });

    const userInfoVal = await userResponseVal.json();

    const session = await auth(req, res);
    console.log("🚀 ~ file: riot.ts ~ line 54 ~ handler ~ session", session);

    const user = await prisma.user.findUnique({
      where: {
        id: session?.user?.id,
      },
    });
    console.log("🚀 ~ file: riot.ts ~ line 61 ~ handler ~ user", user);

    const accountExists = await prisma.account.findFirst({
      where: {
        userId: user?.id,
        providerAccountId: userInfoVal.puuid,
      },
    });

    if (user) {
      if (!accountExists) {
        const upsertAccount = await prisma.account.create({
          data: {
            userId: user.id,
            type: "oauth",
            provider: "riot",
            providerAccountId: userInfoVal.puuid,
            refresh_token: tokens.refresh_token,
            access_token: tokens.access_token,
            expires_at: Math.round(Date.now() / 1000) + payload.expires_in,
            token_type: payload.token_type,
            scope: payload.scope,
            riotIGN: userInfoVal.gameName + "#" + userInfoVal.tagLine,
          },
        });
        if (!user.primaryRiotAccountID) {
          await prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              primaryRiotAccountID: userInfoVal.puuid,
            },
          });
        }
      } else {
        const updatedAccounts = await prisma.account.updateMany({
          where: {
            userId: user.id,
            providerAccountId: userInfoVal.puuid,
          },
          data: {
            refresh_token: tokens.refresh_token,
            access_token: tokens.access_token,
            expires_at: Math.round(Date.now() / 1000) + payload.expires_in,
            scope: payload.scope,
            riotIGN: userInfoVal.gameName + "#" + userInfoVal.tagLine,
          },
        });
      }
    }

    await prisma.$disconnect();

    res.redirect(callbackUrl);
  } catch (error) {
    console.error(error);
    res.send("/token request failed" + error);
  }
};

export default handler;
