import { redirect } from "next/navigation";
import { getSession } from "./auth";
import { prisma } from "./db";

/**
 * Server-side guard for /admin pages. Non-admins are bounced to the
 * dashboard rather than shown an error — the section stays invisible.
 */
export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/login");
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, isAdmin: true },
  });
  if (!user?.isAdmin) redirect("/dashboard");
  return user;
}
