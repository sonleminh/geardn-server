// prisma/seed.ts

import { PrismaClient } from '@prisma/client';

// initialize Prisma Client
const prisma = new PrismaClient();

const attributeValueSeedList = [
  {
    value: 'Đen',
    attributeId: 1,
  },
  {
    value: 'Trắng',
    attributeId: 1,
  },
  {
    value: 'Trắng xanh',
    attributeId: 1,
  },
  {
    value: 'Leopog Reaper',
    attributeId: 2,
  },
  {
    value: 'Silent',
    attributeId: 2,
  },
];

const categorySeedList = [
  {
    name: 'Bàn phím',
    icon: 'https://storage.googleapis.com/geardn-a6c28.appspot.com/1745052785684-keyboard-icon.png',
    slug: 'ban-phim',
  },
  {
    name: 'Chuột',
    icon: 'https://storage.googleapis.com/geardn-a6c28.appspot.com/1745052813486-mouse-icon.png',
    slug: 'chuot',
  },
  {
    name: 'Giá treo màn hình',
    icon: 'https://storage.googleapis.com/geardn-a6c28.appspot.com/1745052839096-arm-icon.jpg',
    slug: 'gia-treo-man-hinh',
  },
  {
    name: 'Màn hình',
    icon: 'https://storage.googleapis.com/geardn-a6c28.appspot.com/1745052875782-monitor-icon.png',
    slug: 'man-hinh',
  },
  {
    name: 'Phụ kiện',
    icon: 'https://storage.googleapis.com/geardn-a6c28.appspot.com/1745052922012-acces-icon.png',
    slug: 'man-hinh',
  },
];

const warehouseSeedList = [
  {
    name: 'Home 1',
    address: '02 Tô Hiến Thành, Phước Mỹ, Sơn Trà, Đà Nẵng',
  },
  {
    name: 'Home 2',
    address: '39/48 Cù Chính Lan, Hoà Khê, Thanh Khê, Đà Nẵng',
  },
];

async function main() {
  await prisma.paymentMethod.create({
    data: {
      key: 'COD',
      name: 'Thanh toán khi nhận hàng',
      image:
        'https://storage.googleapis.com/geardn-a6c28.appspot.com/1745053973932-cod-icon.png',
    },
  });

  await prisma.attribute.createMany({
    data: [
      { name: 'color', label: 'Màu sắc' },
      { name: 'switch', label: 'Switch' },
    ],
  });

  await prisma.attributeValue.createMany({
    data: attributeValueSeedList,
  });

  await prisma.category.createMany({
    data: categorySeedList?.map((item) => item),
  });

  await prisma.paymentMethod.create({
    data: {
      key: 'COD',
      name: 'Thanh toán khi nhận hàng',
      image:
        'https://storage.googleapis.com/geardn-a6c28.appspot.com/1745053973932-cod-icon.png',
    },
  });

  await prisma.warehouse.createMany({
    data: warehouseSeedList?.map((item) => item),
  });
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
