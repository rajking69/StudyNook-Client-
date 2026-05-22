"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import api, { getErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/lib/ToastContext";
import { syncExpressSessionFromBetterAuth } from "@/lib/syncExpressSession";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForBetterAuthSession(maxAttempts = 20, delayMs = 300) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const { data: session } = await authClient.getSession();
    if (session?.user?.email) {
      return session;
    }
    await sleep(delayMs);
  }
  return null;
}

function AuthBridgeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const { setUser } = useAuth();
  const toast = useToast();
  const [hint, setHint] = useState("Securing your session…");

  useEffect(() => {
    let cancelled = false;

    const fail = (message) => {
      if (cancelled) return;
      toast(message, "error");
      router.replace(`/login?next=${encodeURIComponent(redirectTo)}`);
    };

    const run = async () => {
      try {
        setHint("Waiting for Better Auth session…");
        const session = await waitForBetterAuthSession();
        if (cancelled) return;

        if (!session?.user?.email) {
          fail(
            "Sign-in session not ready. Try again or restart the dev server."
          );
          return;
        }

        setHint("Generating JWT and API cookie…");
        const { user } = await syncExpressSessionFromBetterAuth();
        if (cancelled) return;

        setUser(user);
        setHint("Redirecting…");
        router.replace(redirectTo);
      } catch (err) {
        if (cancelled) return;
        const message = !err?.response
          ? err?.message === "NO_SESSION"
            ? "Better Auth session missing."
            : "Backend not reachable. Run: cd Server && npm run dev"
          : getErrorMessage(err, "Sign-in failed. Please try again.");
        fail(message);
      }
    };

    const watchdog = setTimeout(() => {
      if (!cancelled) {
        fail("Sign-in timed out. Try again.");
      }
    }, 25000);

    run().finally(() => clearTimeout(watchdog));

    return () => {
      cancelled = true;
    };
  }, [redirectTo, router, setUser, toast]);

  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center px-6 py-16">
      <div className="glass-card w-full rounded-3xl p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--sn-border)] bg-white/80">
          <span className="loading loading-spinner loading-md" />
        </div>
        <h1 className="heading-font text-2xl">Finalizing your sign-in</h1>
        <p className="mt-2 text-sm text-soft">{hint}</p>
      </div>
    </section>
  );
}

export default function AuthBridgePage() {
  return (
    <Suspense
      fallback={
        <section className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center px-6 py-16">
          <span className="loading loading-spinner loading-lg text-[var(--sn-teal)]" />
        </section>
      }
    >
      <AuthBridgeContent />
    </Suspense>
  );
}
