// prisma/seed.ts

import { PrismaClient } from '@prisma/client';

// initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  // create two dummy articles
  const category1 = await prisma.category.upsert({
    where: { name: 'Bàn phím' },
    update: {},
    create: {
      name: 'Bàn phím',
      icon: 'c',
      slug: 'ban-phim',
    },
  });

  const category2 = await prisma.category.upsert({
    where: { name: 'Màn hình' },
    update: {},
    create: {
      name: 'Màn hình',
      icon: 'c',
      slug: 'man-hinh',
    },
  });

  console.log({ category1, category2 });
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