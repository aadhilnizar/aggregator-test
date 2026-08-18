import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const restaurants = [
  { name: "Spice Route", cuisine: "North Indian", area: "Andheri West", rating: 4.8, reviewCount: 2140, prepTime: 22, commission: 18 },
  { name: "Burger Barn", cuisine: "American", area: "Bandra", rating: 4.6, reviewCount: 1830, prepTime: 18, commission: 20 },
  { name: "Sushi Zen", cuisine: "Japanese", area: "Lower Parel", rating: 4.9, reviewCount: 980, prepTime: 28, commission: 22 },
  { name: "Taco Fiesta", cuisine: "Mexican", area: "Powai", rating: 4.4, reviewCount: 1210, prepTime: 20, commission: 19, status: "BUSY" },
  { name: "Green Bowl", cuisine: "Healthy", area: "Juhu", rating: 4.5, reviewCount: 640, prepTime: 15, commission: 17 },
  { name: "Pasta Fresca", cuisine: "Italian", area: "Colaba", rating: 4.7, reviewCount: 1520, prepTime: 25, commission: 21 },
  { name: "Dragon Wok", cuisine: "Chinese", area: "Malad", rating: 4.3, reviewCount: 870, prepTime: 24, commission: 18, status: "CLOSED" },
  { name: "Curry Leaf", cuisine: "South Indian", area: "Dadar", rating: 4.6, reviewCount: 1340, prepTime: 19, commission: 16 },
];

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@orderhub.app" },
    update: {},
    create: { email: "admin@orderhub.app", name: "Ravi Kumar", role: "ADMIN", passwordHash },
  });
  console.log(`✓ Admin: ${admin.email}  (password: password123)`);

  const existing = await prisma.restaurant.count();
  if (existing === 0) {
    for (const r of restaurants) {
      const created = await prisma.restaurant.create({ data: r });
      await prisma.menuItem.createMany({
        data: [
          { restaurantId: created.id, name: `${created.name} Signature`, price: 320, cuisine: created.cuisine, prepTime: created.prepTime, isAvailable: true },
          { restaurantId: created.id, name: `${created.name} Combo`, price: 480, cuisine: created.cuisine, prepTime: created.prepTime, isAvailable: true },
        ],
      });
    }
    console.log(`✓ Seeded ${restaurants.length} restaurants (2 menu items each)`);
  } else {
    console.log(`• Restaurants already present (${existing}) — skipping`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
