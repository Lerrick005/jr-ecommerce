import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
const prisma = new PrismaClient();
async function main() {
  await prisma.user.update({
    where: { email: "customer@demo.local" },
    data: { passwordHash: await argon2.hash("Customer123!") }
  });
  await prisma.user.update({
    where: { email: "manager@demo.local" },
    data: { passwordHash: await argon2.hash("Manager123!") }
  });
  console.log("Passwords updated.");
}
main().finally(() => prisma.$disconnect());