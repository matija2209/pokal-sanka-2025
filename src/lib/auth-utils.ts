import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const ADMIN_ROLES = ["superadmin", "eventAdmin"];

export async function requireAuth() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not authenticated");
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  const role = session.user.role;
  if (!role || !ADMIN_ROLES.includes(role)) {
    throw new Error("Insufficient permissions");
  }
  return session;
}
