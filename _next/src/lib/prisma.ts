// 추후에 자체 서버 구축시 활용

// import { PrismaClient } from "@prisma/client";

// const globalForPrisma = global as unknown as { prisma?: PrismaClient };

// export const prisma =
//   globalForPrisma.prisma ??
//   new PrismaClient({
//     log: ["warn", "error", "query"], // 필요하면 'query'도 추가 가능
//   });

// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
