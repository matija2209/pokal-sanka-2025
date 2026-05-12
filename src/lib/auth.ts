import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins/admin";
import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";
import { prisma } from "@/lib/prisma/client";

const statement = {
  ...defaultStatements,
  event: ["create", "read", "update", "delete"],
  player: ["create", "read", "update", "delete"],
  trivia: ["create", "read", "update", "delete"],
  sighting: ["approve", "reject", "delete"],
  hype: ["create", "update", "delete", "unlock"],
} as const;

const ac = createAccessControl(statement);

const superadmin = ac.newRole({
  event: ["create", "read", "update", "delete"],
  player: ["create", "read", "update", "delete"],
  trivia: ["create", "read", "update", "delete"],
  sighting: ["approve", "reject", "delete"],
  hype: ["create", "update", "delete", "unlock"],
  ...adminAc.statements,
});

const eventAdmin = ac.newRole({
  event: ["read", "update"],
  player: ["create", "read", "update", "delete"],
  trivia: ["create", "read", "update", "delete"],
  sighting: ["approve", "reject"],
  hype: ["create", "update", "unlock"],
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  emailVerification: {
    sendVerificationEmail: async ({ url }) => {
      console.log("Verification URL:", url);
    },
  },
  user: { modelName: "AuthUser" },
  session: { modelName: "AuthSession" },
  account: { modelName: "AuthAccount" },
  plugins: [
    admin({
      ac,
      roles: { superadmin, eventAdmin },
      adminRoles: ["superadmin", "eventAdmin"],
      defaultRole: "player",
    }),
  ],
});
