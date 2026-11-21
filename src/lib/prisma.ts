import { PrismaClient } from "@prisma/client";

function sanitizeDatabaseUrl(rawUrl: string | undefined): string | undefined {
  if (!rawUrl || !rawUrl.startsWith("postgres")) return rawUrl;

  let url = rawUrl.trim();
  // Strip surrounding quotes
  if ((url.startsWith('"') && url.endsWith('"')) || (url.startsWith("'") && url.endsWith("'"))) {
    url = url.slice(1, -1).trim();
  }

  // 1. Remove [ ] placeholder brackets around password: :[password]@ -> :password@
  url = url.replace(/:\[([^\]]+)\]@/, (_, pass) => `:${encodeURIComponent(pass)}@`);

  // 2. Handle unescaped characters in password (e.g. unescaped @, #, etc.)
  const protocolEnd = url.indexOf("://");
  if (protocolEnd !== -1) {
    const protocol = url.slice(0, protocolEnd + 3);
    const rest = url.slice(protocolEnd + 3);
    const lastAt = rest.lastIndexOf("@");
    if (lastAt !== -1) {
      const creds = rest.slice(0, lastAt);
      const hostPart = rest.slice(lastAt + 1);
      const firstColon = creds.indexOf(":");
      if (firstColon !== -1) {
        const user = creds.slice(0, firstColon);
        let password = creds.slice(firstColon + 1);
        try {
          password = decodeURIComponent(password);
        } catch {
          // ignore
        }
        url = `${protocol}${user}:${encodeURIComponent(password)}@${hostPart}`;
      }
    }
  }

  return url;
}

const cleanDatabaseUrl = sanitizeDatabaseUrl(process.env.DATABASE_URL);
if (cleanDatabaseUrl) {
  process.env.DATABASE_URL = cleanDatabaseUrl;
}

const cleanDirectUrl = sanitizeDatabaseUrl(process.env.DIRECT_URL) || cleanDatabaseUrl;
if (cleanDirectUrl) {
  process.env.DIRECT_URL = cleanDirectUrl;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: cleanDatabaseUrl
      ? {
          db: {
            url: cleanDatabaseUrl,
          },
        }
      : undefined,
    log: ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
