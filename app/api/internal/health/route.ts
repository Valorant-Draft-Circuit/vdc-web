import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sslCipherRows = await prisma.$queryRaw`SHOW STATUS LIKE 'Ssl_cipher';` as Array<{ Value: string }>;
    const sslVersionRows = await prisma.$queryRaw`SHOW STATUS LIKE 'Ssl_version';` as Array<{ Value: string }>;

    const cipherValue = sslCipherRows?.[0]?.Value;
    const versionValue = sslVersionRows?.[0]?.Value;

    const sslCipher = (cipherValue === '') ? 'N/A' : cipherValue;
    const sslVersion = (versionValue === '') ? 'N/A' : versionValue;
    const usingSSL = sslCipher !== 'N/A' && sslVersion !== 'N/A';

    return Response.json({
      status: "healthy",
      database: {
        connected: true,
        usingSSL,
        ssl: {
          cipher: sslCipher,
          version: sslVersion
        }
      }
    });
  } catch (error) {
    return Response.json({
      status: "unhealthy",
      database: {
        connected: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }
    }, { status: 500 });
  }
}
