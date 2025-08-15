// prisma/seed.ts

import { PrismaClient, ProductStatus, UserRole } from '@prisma/client';

// initialize Prisma Client
const prisma = new PrismaClient();

const categorySeedList = [
  { id: 1, name: 'Bàn phím', icon: 'https://storage.googleapis.com/geardn-a6c28.appspot.com/1755230275956-keyboard-icon.png', slug: 'ban-phim' },
  { id: 2, name: 'Chuột', icon: 'https://storage.googleapis.com/geardn-a6c28.appspot.com/1755230300189-mouse-icon.png', slug: 'chuot' },
  {
    id: 3,
    name: 'Giá treo màn hình',
    icon: 'https://storage.googleapis.com/geardn-a6c28.appspot.com/1755230308503-arm-icon.jpg',
    slug: 'gia-treo-man-hinh',
  },
  { id: 4, name: 'Màn hình', icon: 'https://storage.googleapis.com/geardn-a6c28.appspot.com/1755230318576-monitor-icon.png', slug: 'man-hinh' },
  { id: 5, name: 'Phụ kiện', icon: 'https://storage.googleapis.com/geardn-a6c28.appspot.com/1755230291682-assessories-icon.png', slug: 'phu-kien' },
];

const warehouseSeedList = [
  { name: 'Home 1', address: '02 Tô Hiến Thành, An Hải, Đà Nẵng' },
  { name: 'Home 2', address: '39/48 Cù Chính Lan, Thanh Khê, Đà Nẵng' },
  { name: 'MobiFone KV3', address: '586 Nguyễn Hữu Thọ, Cẩm Lệ, Đà Nẵng' },
];

const attributeValueSeedList = [
  { id: 1, value: 'Đen', attributeId: 1 },
  { id: 2, value: 'Trắng', attributeId: 1 },
  { id: 3, value: 'Trắng xanh', attributeId: 1 },
  { id: 4, value: 'Leopog Reaper', attributeId: 2 },
  { id: 5, value: 'Silent', attributeId: 2 },
  { id: 6, value: 'L1', attributeId: 3 },
  { id: 7, value: 'L1 Plus', attributeId: 3 },
  { id: 8, value: 'Polar', attributeId: 1 },
  { id: 9, value: 'Đen xám', attributeId: 1 },
];

const productSeedList = [
  {
    id: 8,
    name: 'E-Dra EMA7302',
    slug: 'e-dra-ema7302',
    description: '<p>E-Dra EMA7302</p>',
    brand: 'E-Dra',
    images: [
      'https://storage.googleapis.com/geardn-a6c28.appspot.com/1753410910911-e-dra-ema7302.jpg',
    ],
    tags: [{ label: 'Bán chạy', value: 'bestseller' }],
    details: {
      weight: '3kg',
      material: '',
      guarantee: '12 tháng',
    },
    status: ProductStatus.ACTIVE,
    isVisible: true,
    isDeleted: false,
    categoryId: 3,
    createdAt: '2025-07-25T02:35:33.054Z',
    updatedAt: '2025-07-25T02:35:33.054Z',
  },
  {
    id: 7,
    name: 'Giá treo laptop NB-FP2',
    slug: 'gia-treo-laptop-nb-fp2',
    description: '<p>Giá treo laptop NB-FP2</p>',
    brand: 'North Bayou',
    images: [
      'https://storage.googleapis.com/geardn-a6c28.appspot.com/1753410795846-nb-fp2.png',
    ],
    tags: [],
    details: {
      weight: '1kg',
      material: '',
      guarantee: '12 tháng',
    },
    status: ProductStatus.ACTIVE,
    isVisible: true,
    isDeleted: false,
    categoryId: 3,
    createdAt: '2025-07-25T02:33:35.932Z',
    updatedAt: '2025-07-25T02:33:35.932Z',
  },
  {
    id: 6,
    name: 'DareU LM115B',
    slug: 'dareu-lm115b',
    description: '<p>DareU LM115B</p>',
    brand: 'DareU',
    images: [
      'https://storage.googleapis.com/geardn-a6c28.appspot.com/1753410589884-dareu-lm105b-silent.webp',
    ],
    tags: [{ label: 'Giảm giá', value: 'sale' }],
    details: {
      weight: '80g',
      material: '',
      guarantee: '36 tháng',
    },
    status: ProductStatus.ACTIVE,
    isVisible: true,
    isDeleted: false,
    categoryId: 2,
    createdAt: '2025-07-25T02:30:46.902Z',
    updatedAt: '2025-07-25T02:30:46.902Z',
  },
  {
    id: 5,
    name: 'Chuột không dây Logitech M331Silent',
    slug: 'chuot-khong-day-logitech-m331silent',
    description: '<p>Chuột không dây Logitech M331Silent</p>',
    brand: 'Logitech',
    images: [
      'https://storage.googleapis.com/geardn-a6c28.appspot.com/1753410548213-logitech-m331-slient.jpg',
    ],
    tags: [
      { label: 'Giảm giá', value: 'sale' },
      { label: 'Bán chạy', value: 'bestseller' },
    ],
    details: {
      weight: '100g',
      material: '',
      guarantee: '24 tháng',
    },
    status: ProductStatus.ACTIVE,
    isVisible: true,
    isDeleted: false,
    categoryId: 2,
    createdAt: '2025-07-25T02:29:33.187Z',
    updatedAt: '2025-07-25T02:29:33.187Z',
  },
  {
    id: 4,
    name: 'Màn hình Samsung công thái học D400GAEXXV FHD IPS 100Hz giúp bảo vệ mắt Khử nhấp nháy',
    slug: 'man-hinh-samsung-cong-thai-hoc-d400gaexxv-fhd-ips-100hz-giup-bao-ve-mat-khu-nhap-nhay',
    description: '<p>Màn hình Samsung công thái học D400GAEXXV FHD IPS 100Hz giúp bảo vệ mắt Khử nhấp nháy</p>',
    brand: 'Samsung',
    images: [
      'https://storage.googleapis.com/geardn-a6c28.appspot.com/1753410464079-samsung-24inch-new.jpg',
    ],
    tags: [{ label: 'Bán chạy', value: 'bestseller' }],
    details: {
      weight: '3kg',
      material: '',
      guarantee: '24 tháng',
    },
    status: ProductStatus.ACTIVE,
    isVisible: true,
    isDeleted: false,
    categoryId: 4,
    createdAt: '2025-07-25T02:28:09.238Z',
    updatedAt: '2025-07-25T02:28:09.238Z',
  },
  {
    id: 3,
    name: 'Đèn màn hình LED Xiaomi Lymax L1 / L1 Plus bảo vệ mắt 3 chế độ sáng',
    slug: 'en-man-hinh-led-xiaomi-lymax-l1-l1-plus-bao-ve-mat-3-che-o-sang',
    description: '<p>Đèn màn hình LED Xiaomi Lymax L1 / L1 Plus bảo vệ mắt 3 chế độ sáng</p>',
    brand: 'Xiaomi',
    images: [
      'https://storage.googleapis.com/geardn-a6c28.appspot.com/1753711124667-xiaomi-lymax-l1.png',
    ],
    tags: [{ label: 'Giảm giá', value: 'sale' }],
    details: {
      weight: '200g',
      material: '',
      guarantee: '30 ngày',
    },
    status: ProductStatus.ACTIVE,
    isVisible: true,
    isDeleted: false,
    categoryId: 5,
    createdAt: '2025-07-25T02:25:51.827Z',
    updatedAt: '2025-07-25T02:25:51.827Z',
  },
  {
    id: 2,
    name: 'Bàn phím cơ không dây AULA F75',
    slug: 'ban-phim-co-khong-day-aula-f75',
    description: '<p>Bàn phím cơ không dây AULA F75</p>',
    brand: 'Aula',
    images: [
      'https://storage.googleapis.com/geardn-a6c28.appspot.com/1753410132555-aula-f75-main.jpg',
    ],
    tags: [
      { label: 'Hot', value: 'hot' },
      { label: 'Bán chạy', value: 'bestseller' },
    ],
    details: {
      weight: '800g',
      material: '',
      guarantee: '3 tháng',
    },
    status: ProductStatus.ACTIVE,
    isVisible: true,
    isDeleted: false,
    categoryId: 1,
    createdAt: '2025-07-25T02:22:42.246Z',
    updatedAt: '2025-07-25T02:22:42.246Z',
  },
  {
    id: 1,
    name: 'NB-F80',
    slug: 'nb-f80',
    description: '<p>NB-F80</p>',
    brand: 'North Bayou',
    images: [
      'https://storage.googleapis.com/geardn-a6c28.appspot.com/1753367729405-NB-F80(B%26W).jpg',
    ],
    tags: [
      { label: 'Bán chạy', value: 'bestseller' },
      { label: 'Giảm giá', value: 'sale' },
    ],
    details: {
      weight: '3kg',
      material: '',
      guarantee: '12 tháng',
    },
    status: ProductStatus.ACTIVE,
    isVisible: true,
    isDeleted: false,
    categoryId: 3,
    createdAt: '2025-07-24T14:36:07.414Z',
    updatedAt: '2025-07-24T14:36:07.414Z',
  },
];

const productSkuSeedList = [
  {
    id: 1,
    productId: 8,
    sku: 'GDN0001',
    sellingPrice: '319000',
    imageUrl: null,
  },
  {
    id: 2,
    productId: 7,
    sku: 'GDN0002',
    sellingPrice: '235000',
    imageUrl: null,
  },
  {
    id: 3,
    productId: 6,
    sku: 'GDN0003',
    sellingPrice: '190000',
    imageUrl: null,
  },
  {
    id: 4,
    productId: 5,
    sku: 'GDN0004',
    sellingPrice: '290000',
    imageUrl: null,
  },
  {
    id: 5,
    productId: 4,
    sku: 'GDN0005',
    sellingPrice: '1890000',
    imageUrl: null,
  },
  {
    id: 6,
    productId: 3,
    sku: 'GDN0006',
    sellingPrice: '319000',
    imageUrl: 'https://storage.googleapis.com/geardn-a6c28.appspot.com/1753434194774-lymax-l1.webp',
  },
  {
    id: 7,
    productId: 3,
    sku: 'GDN0007',
    sellingPrice: '469000',
    imageUrl: 'https://storage.googleapis.com/geardn-a6c28.appspot.com/1753434286481-lymax-l1-plus.webp',
  },
  {
    id: 8,
    productId: 2,
    sku: 'GDN0008',
    sellingPrice: '790000',
    imageUrl: 'https://storage.googleapis.com/geardn-a6c28.appspot.com/1753434359837-aula-f75-white-blue.webp',
  },
  {
    id: 9,
    productId: 2,
    sku: 'GDN0009',
    sellingPrice: '890000',
    imageUrl: 'https://storage.googleapis.com/geardn-a6c28.appspot.com/1753434378358-aula-f75-polar.jpg',
  },
  {
    id: 10,
    productId: 1,
    sku: 'GDN0010',
    sellingPrice: '315000',
    imageUrl: 'https://storage.googleapis.com/geardn-a6c28.appspot.com/1753434405588-nb-f80-black.webp',
  },
  {
    id: 11,
    productId: 1,
    sku: 'GDN0011',
    sellingPrice: '329000',
    imageUrl: 'https://storage.googleapis.com/geardn-a6c28.appspot.com/1753434418417-nb-f80-white.jpg',
  },
];

const productSkuAttributeSeedList = [
  {
    id: 1,
    skuId: 6,             // GDN0006
    attributeValueId: 6,  // version: L1
  },
  {
    id: 2,
    skuId: 7,             // GDN0007
    attributeValueId: 7,  // version: L1 Plus
  },
  {
    id: 3,
    skuId: 8,             // GDN0008
    attributeValueId: 4,  // switch: Leopog Reaper
  },
  {
    id: 4,
    skuId: 8,
    attributeValueId: 3,  // color: Trắng xanh
  },
  {
    id: 5,
    skuId: 9,             
    attributeValueId: 4,  // switch: Leopog Reaper
  },
  {
    id: 6,
    skuId: 9,
    attributeValueId: 8,  // color: Polar
  },
  {
    id: 7,
    skuId: 10,            
    attributeValueId: 1,  // color: Đen
  },
  {
    id: 8,
    skuId: 11,            
    attributeValueId: 2,  // color: Trắng
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
      { name: 'version', label: 'Phiên bản' },
    ],
  });

  await prisma.attributeValue.createMany({
    data: attributeValueSeedList,
  });

  await prisma.category.createMany({
    data: categorySeedList?.map((item) => item),
  });

  await prisma.warehouse.createMany({
    data: warehouseSeedList?.map((item) => item),
  });

  await prisma.product.createMany({
    data: productSeedList?.map((item) => item),
  });

  await prisma.productSKU.createMany({
    data: productSkuSeedList?.map((item) => item),
  });

  await prisma.productSKUAttribute.createMany({
    data: productSkuAttributeSeedList?.map((item) => item),
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
