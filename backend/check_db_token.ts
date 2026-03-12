import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const p = await prisma.project.findUnique({ where: { id: 'cmmlyb2ic0004phoahkkzjfbk' }, select: { name: true, githubToken: true } });
  console.log(p);
}
run();
