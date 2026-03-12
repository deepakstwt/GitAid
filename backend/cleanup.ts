import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const deleted = await prisma.comment.deleteMany({
    where: {
      summary: {
        contains: 'Fallback: AI unavailable'
      }
    }
  });
  console.log(`Deleted ${deleted.count} fallback summaries.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
