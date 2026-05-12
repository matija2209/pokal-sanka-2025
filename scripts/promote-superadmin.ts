// Promote a Better Auth user to superadmin by email.
// Usage: npx tsx scripts/promote-superadmin.ts <email>

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("Usage: npx tsx scripts/promote-superadmin.ts <email>");
    process.exit(1);
  }

  const user = await prisma.authUser.findUnique({
    where: { email },
    select: { id: true, email: true, role: true },
  });

  if (!user) {
    console.error(`No Better Auth user found with email: ${email}`);
    console.error("Sign up first at /login before promoting.");
    process.exit(1);
  }

  await prisma.authUser.update({
    where: { id: user.id },
    data: { role: "superadmin" },
  });

  console.log(`User ${user.email} promoted to superadmin.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
