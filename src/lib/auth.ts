import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import type { Role } from "@prisma/client";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "dev-secret"
);
const COOKIE = "kg_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days — field workers stay signed in

export type Session = {
  userId: string;
  email: string;
  name: string;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: {
  id: string;
  email: string;
  name: string;
}) {
  const token = await new SignJWT({ email: user.email, name: user.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(SECRET);

  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return {
      userId: payload.sub as string,
      email: payload.email as string,
      name: payload.name as string,
    };
  } catch {
    return null;
  }
}

/** Throws a Response(401) if not signed in — use inside route handlers. */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) {
    throw new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return session;
}

/** Returns the caller's role on a farm, or null if not a member. */
export async function getFarmRole(
  userId: string,
  farmId: string
): Promise<Role | null> {
  const member = await prisma.farmMember.findUnique({
    where: { userId_farmId: { userId, farmId } },
  });
  return member?.role ?? null;
}

/** Throws Response(403) unless the user holds one of `roles` on the farm. */
export async function requireFarmRole(
  session: Session,
  farmId: string,
  roles: Role[]
): Promise<Role> {
  const role = await getFarmRole(session.userId, farmId);
  if (!role || !roles.includes(role)) {
    throw new Response(
      JSON.stringify({ error: "Insufficient permissions for this farm" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }
  return role;
}

/** All roles that can write cultivation data. Inspectors are read-only. */
export const WRITE_ROLES: Role[] = ["OWNER", "MANAGER", "SUPERVISOR", "WORKER"];
/** Roles that can manage farm structure, members, compliance sign-off. */
export const MANAGE_ROLES: Role[] = ["OWNER", "MANAGER"];
/** Every role, including read-only inspectors. */
export const ALL_ROLES: Role[] = [
  "OWNER",
  "MANAGER",
  "SUPERVISOR",
  "INSPECTOR",
  "WORKER",
];

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);
// Auth and billing endpoints stay reachable with a lapsed subscription,
// otherwise nobody could log in or pay.
const BILLING_EXEMPT = [/^\/api\/auth\//, /^\/api\/billing(\/|$)/];

/**
 * Wraps a route handler so `throw new Response(...)` from the require*
 * helpers becomes the HTTP response instead of a 500.
 *
 * Also enforces the subscription: mutations from users whose trial and
 * subscription have both lapsed get a 402. Reads stay open so licensees
 * never lose access to their compliance records.
 */
export function handler<T extends unknown[]>(
  fn: (...args: T) => Promise<Response>
): (...args: T) => Promise<Response> {
  return async (...args: T) => {
    try {
      const req = args[0];
      if (req instanceof Request && MUTATING.has(req.method)) {
        const path = new URL(req.url).pathname;
        if (path.startsWith("/api/") && !BILLING_EXEMPT.some((r) => r.test(path))) {
          const session = await getSession();
          if (session) {
            const { getBillingInfo } = await import("./billing");
            const billing = await getBillingInfo(session.userId);
            if (!billing.active) {
              throw new Response(
                JSON.stringify({
                  error: "Your trial has ended — subscribe to keep capturing data",
                  code: "SUBSCRIPTION_REQUIRED",
                }),
                { status: 402, headers: { "Content-Type": "application/json" } }
              );
            }
          }
        }
      }
      return await fn(...args);
    } catch (err) {
      if (err instanceof Response) return err;
      console.error(err);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  };
}
