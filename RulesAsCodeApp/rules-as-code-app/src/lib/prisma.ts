// src/lib/prisma.ts
import { PrismaClient } from "../generated/prisma"; // This will resolve to src\generated\prisma

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;