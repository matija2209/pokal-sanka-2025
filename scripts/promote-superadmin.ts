// Bootstrap or promote a Better Auth user to superadmin.
// Usage:
//   npx tsx scripts/promote-superadmin.ts <email>
//   npx tsx scripts/promote-superadmin.ts <email> <password> [--name=<name>]

import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";

const prisma = new PrismaClient();

function printUsage() {
  console.error(
    "Usage: npx tsx scripts/promote-superadmin.ts <email> [password] [--name=<name>]"
  );
}

function deriveFallbackName(email: string) {
  const localPart = email.split("@")[0] ?? "superadmin";
  return localPart.trim() || "superadmin";
}

async function main() {
  const [, , rawEmail, rawPassword, ...flags] = process.argv;
  const email = rawEmail?.trim().toLowerCase();
  const password = rawPassword?.trim();

  if (!email) {
    printUsage();
    process.exit(1);
  }

  let explicitName: string | null = null;

  for (const flag of flags) {
    if (flag.startsWith("--name=")) {
      explicitName = flag.slice("--name=".length).trim() || null;
      continue;
    }

    console.error(`Unknown argument: ${flag}`);
    printUsage();
    process.exit(1);
  }

  const existingUser = await prisma.authUser.findUnique({
    where: { email },
    select: { id: true, email: true, role: true },
  });

  if (existingUser) {
    await prisma.authUser.update({
      where: { id: existingUser.id },
      data: { role: "superadmin" },
    });

    console.log(`User ${existingUser.email} promoted to superadmin.`);
    return;
  }

  if (!password) {
    console.error(
      `No Better Auth user found with email: ${email}. Pass a password to create the first superadmin.`
    );
    printUsage();
    process.exit(1);
  }

  const name = explicitName || deriveFallbackName(email);

  await auth.api.createUser({
    body: {
      email,
      password,
      name,
      role: "superadmin",
    },
  });

  console.log(`Created superadmin ${email}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
