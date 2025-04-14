const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateTypeToTypeId() {
  const allTypes = await prisma.attributeType.findMany();

  const allAttributes = await prisma.attributeValue.findMany();

  for (const attr of allAttributes) {
    if (!attr.type) continue;

    const match = allTypes.find(
      (t) => t.name.toLowerCase() === attr.type.toLowerCase(),
    );
    if (match) {
      await prisma.attributeValue.update({
        where: { id: attr.id },
        data: { typeId: match.id },
      });
    } else {
      console.warn(
        `⚠️  Không tìm thấy type "${attr.type}" trong bảng AttributeType`,
      );
    }
  }

  console.log('✅ Đã cập nhật typeId cho tất cả ProductAttribute');
  await prisma.$disconnect();
}

migrateTypeToTypeId();
