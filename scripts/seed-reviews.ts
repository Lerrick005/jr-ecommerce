import { PrismaClient, UserRole } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding real-looking reviews...");

  const customerNames = ["Amina K.", "Wanjiru M.", "David O."];
  const reviewers = [];

  for (const name of customerNames) {
    const firstName = name.split(" ")[0] ?? "customer";
    const email = `${firstName.toLowerCase()}@example.com`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name,
        passwordHash: await argon2.hash("Customer123!"),
        emailVerified: new Date(),
        role: UserRole.CUSTOMER,
        customer: { create: {} }
      }
    });
    reviewers.push(user);
  }

  const products = await prisma.product.findMany({ where: { active: true }, take: 5 });

  const reviews = [
    { rating: 5, title: "Beautiful quality", body: "The leather is so soft and the stitching is perfect. Arrived fast to Mombasa." },
    { rating: 4, title: "Lovely, but sizing runs small", body: "Very nice product. I usually wear an M but had to exchange for an L. Exchange was easy though." },
    { rating: 5, title: "Exceeded expectations", body: "Honestly better in person. The colour is exactly as shown." },
    { rating: 5, title: "Fast delivery, great quality", body: "Ordered Friday, delivered Monday. Will definitely buy again." },
    { rating: 4, title: "Good, not perfect", body: "It's lovely but a bit smaller than I expected. Still keeping it." }
  ];

  let rIndex = 0;
  for (const product of products) {
    for (const reviewer of reviewers.slice(0, 2)) {
      const r = reviews[rIndex % reviews.length] ?? reviews[0]!;
      await prisma.review.upsert({
        where: { productId_userId: { productId: product.id, userId: reviewer.id } },
        update: {},
        create: {
          productId: product.id,
          userId: reviewer.id,
          rating: r.rating,
          title: r.title,
          body: r.body,
          approved: true
        }
      });
      rIndex++;
    }
  }

  console.log(`Seeded ${rIndex} reviews for ${products.length} products.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());