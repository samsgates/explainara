import { PrismaClient } from "@prisma/client";

declare global { var __explainaraPrisma: PrismaClient | undefined; }

export const db = globalThis.__explainaraPrisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
});

if (process.env.NODE_ENV !== "production") globalThis.__explainaraPrisma = db;
export * from "@prisma/client";
