import api from "@/lib/api";
import { authClient } from "@/lib/auth-client";

const JWT_CACHE_KEY = "studynook_ba_jwt";

/** Cache Better Auth JWT in sessionStorage for client-side use (optional). */
export function cacheBetterAuthJwt(token) {
  if (typeof window === "undefined" || !token) return;
  try {
    sessionStorage.setItem(JWT_CACHE_KEY, token);
  } catch {
    /* ignore quota errors */
  }
}

export function getCachedBetterAuthJwt() {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(JWT_CACHE_KEY);
  } catch {
    return null;
  }
}

export function clearCachedBetterAuthJwt() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(JWT_CACHE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * After Better Auth sign-in: fetch JWT, cache it, then set Express httpOnly cookie via /auth/google.
 */
export async function syncExpressSessionFromBetterAuth() {
  const sessionRes = await authClient.getSession();
  const session = sessionRes?.data;
  if (!session?.user?.email) {
    throw new Error("NO_SESSION");
  }

  let baToken = null;
  try {
    const tokenRes = await authClient.token();
    baToken = tokenRes?.data?.token || null;
    if (baToken) {
      cacheBetterAuthJwt(baToken);
    }
  } catch {
    /* JWT plugin optional if session exists */
  }

  const loginRes = await api.post("/auth/google", {
    name: session.user.name || "Google User",
    email: session.user.email,
    photoURL: session.user.image || null,
    uid: session.user.id,
  });

  return { user: loginRes.data, baToken };
}
