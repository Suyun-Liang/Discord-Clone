import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

export const db = globalThis.prisma || new PrismaClient();

// prevent hot reload in next13 to not initialize too many prisma client
if (process.env.NODE_ENV !== "production") globalThis.prisma = db;
