import { redirect } from "next/navigation";

import { AuthPanel } from "@/features/auth/components/auth-panel";
import { getCurrentUser } from "@/features/auth/server/session";

export default async function AuthPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/analyses");
  }

  return <AuthPanel />;
}
