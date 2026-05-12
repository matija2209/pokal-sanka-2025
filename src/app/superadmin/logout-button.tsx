"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.push("/login"),
      },
    });
  }

  return (
    <Button variant="outline" size="sm" onClick={handleLogout}>
      Sign out
    </Button>
  );
}
