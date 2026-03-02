import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.product.createMany({
    data: [
      {
        name: 'Sneakers Urban',
        description: 'Comfort shoes for daily use',
        imageUrl: 'https://picsum.photos/400/400',
        price: 2000000,
        stock: 5,
      },
      {
        name: 'Smart Watch Pro',
        description: 'Fitness & notifications',
        imageUrl: 'https://picsum.photos/401/401',
        price: 1500000,
        stock: 8,
      },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
