// prisma/seed.ts

import { PrismaClient, ProductAttributeType } from '@prisma/client';

// initialize Prisma Client
const prisma = new PrismaClient();

const categorySeedList = [
  {
    name: 'Bàn phím',
    icon: 'https://firebasestorage.googleapis.com/v0/b/geardn-a6c28.appspot.com/o/1738830964369-keyboard-icon.png?alt=media&token=5da19bf2-dd80-4b08-9230-9608ec048e70',
    slug: 'ban-phim',
    isDeleted: false,
  },
  {
    name: 'Chuột',
    icon: 'https://firebasestorage.googleapis.com/v0/b/geardn-a6c28.appspot.com/o/1740806241785-mouse-icon.png?alt=media&token=c0e1f999-75ae-455d-9f3d-f3b790645af3',
    slug: 'chuot',
    isDeleted: false,
  },
  {
    name: 'Giá treo màn hình',
    icon: 'https://firebasestorage.googleapis.com/v0/b/geardn-a6c28.appspot.com/o/1738831118040-arm-icon.jpg?alt=media&token=f64ac5e7-110e-4fec-9cfc-ece235ddaba2',
    slug: 'gia-treo-man-hinh',
    isDeleted: false,
  },
  {
    name: 'Màn hình',
    icon: 'https://firebasestorage.googleapis.com/v0/b/geardn-a6c28.appspot.com/o/1738831106576-monitor-icon.png?alt=media&token=ed682c0a-365d-42af-9030-f658be22b76f',
    slug: 'man-hinh',
    isDeleted: false,
  },
];

const productAttributeSeedList = [
  {
    type: ProductAttributeType.COLOR,
    value: 'Đen',
    isDeleted: false,
  },
  {
    type: ProductAttributeType.COLOR,
    value: 'Trắng',
    isDeleted: false,
  },
  {
    type: ProductAttributeType.SWITCH,
    value: 'Leopog Reaper',
    isDeleted: false,
  },
  {
    type: ProductAttributeType.SWITCH,
    value: 'Silent Reaper',
    isDeleted: false,
  },
];

async function main() {
  // create two dummy articles
  const categorieList = await prisma.category.createMany({
    data: categorySeedList?.map((item) => item),
  });

  const productAttributeList = await prisma.productAttribute.createMany({
    data: productAttributeSeedList?.map((item) => item),
  });

  const paymentMethod = await prisma.paymentMethod.create({
    data: {
      key: 'COD',
      name: 'Thanh toán khi nhận hàng',
      image:
        'https://firebasestorage.googleapis.com/v0/b/geardn-a6c28.appspot.com/o/1743094400265-COD-icon.jpg?alt=media&token=287ae75c-8d5f-4348-8498-b8c7d39f3522',
    },
  });

  console.log({ categorieList, productAttributeList, paymentMethod });
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