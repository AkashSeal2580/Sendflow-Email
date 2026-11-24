import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log("MySQL database connected successfully");
  } catch (error) {
    console.error("MySQL connection failed:", error);
    throw error;
  }
}
