import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  const newPassword = "Money@2025";
  const passwordHash = await argon2.hash(newPassword);

  // 1. Update Admin (Manager)
  await prisma.user.update({
    where: { email: "manager@demo.local" },
    data: {
      email: "admin@jrecommerce.com",
      name: "Admin Manager",
      passwordHash: passwordHash
    }
  });
  console.log("✅ Admin updated -> admin@jrecommerce.com / Money@2025");

  // 2. Update Customer
  await prisma.user.update({
    where: { email: "customer@demo.local" },
    data: {
      email: "lerrick@jrecommerce.com",
      name: "Lerrick",
      passwordHash: passwordHash
    }
  });
  console.log("✅ Customer updated -> lerrick@jrecommerce.com / Money@2025");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });