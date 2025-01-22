// prisma/seed.ts

import { PrismaClient } from '@prisma/client';

// initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  // create two dummy articles
  const product1 = await prisma.product.upsert({
    where: { name: 'Samsung 24 inch' },
    update: {},
    create: {
      name: 'Samsung 24 inch',
      description: 'Samsung 24 inch 100hz IPS',
      sku_name: 'samsung-24-inch',
      slug: 'samsung-24-inch',
      category: {
        connect: { id: 1 },
      },
    },
  });

  const product2 = await prisma.product.upsert({
    where: { name: 'Aula F75' },
    update: {},
    create: {
      name: 'Aula F75',
      description: 'Aula F75',
      sku_name: 'samsung-24-inch',
      slug: 'samsung-24-inch',
      category: {
        connect: { id: 2 },
      },
    },
  });

  console.log({ product1, product2 });
}

// execute the main function
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // close Prisma Client at the end
    await prisma.$disconnect();
  });