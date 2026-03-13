import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });
}

function hasExpectedDelegates(client: PrismaClient | undefined) {
  if (!client) {
    return false;
  }

  const candidate = client as PrismaClient & {
    user?: unknown;
    authSession?: unknown;
    jobDescriptionCache?: unknown;
  };

  return Boolean(candidate.user && candidate.authSession && candidate.jobDescriptionCache);
}

const prismaClient: PrismaClient = hasExpectedDelegates(globalThis.prisma)
  ? (globalThis.prisma as PrismaClient)
  : createPrismaClient();

export const db: PrismaClient = prismaClient;

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prismaClient;
}
