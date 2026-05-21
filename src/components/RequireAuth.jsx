"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, router, pathname]);

  if (loading) {
    return (
      <section className="mx-auto flex min-h-[50vh] w-full max-w-6xl items-center justify-center px-6 py-16">
        <span className="loading loading-spinner loading-lg text-[var(--sn-teal)]" />
      </section>
    );
  }

  if (!user) {
    return null;
  }

  return children;
}
