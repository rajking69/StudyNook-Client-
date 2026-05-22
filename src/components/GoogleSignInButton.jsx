"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useToast } from "@/lib/ToastContext";

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#ffffff" stroke="#e5e7eb" />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fontSize="12"
        fontFamily="Arial, sans-serif"
        fontWeight="700"
        fill="#4285F4"
      >
        G
      </text>
    </svg>
  );
}

export default function GoogleSignInButton({
  label = "Continue with Google",
  callbackUrl,
  callbackURL,
  disabled = false,
}) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const target = callbackUrl || callbackURL || "/auth/bridge";

  const handleGoogleSignIn = async () => {
    if (loading || disabled) return;
    setLoading(true);

    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: target,
      });
      if (result?.error) {
        toast(
          result.error.message || "Google sign-in failed. Try again.",
          "error"
        );
        setLoading(false);
      }
    } catch (err) {
      toast(err?.message || "Google sign-in failed. Try again.", "error");
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={disabled || loading}
      className="flex w-full items-center justify-center gap-2 rounded-full border border-[var(--sn-border)] bg-[var(--sn-card)] px-4 py-2 text-sm font-semibold text-[var(--sn-ink)] shadow-sm transition hover:-translate-y-0.5 hover:border-[rgba(15,118,110,0.35)] hover:bg-[var(--sn-card-90)] hover:text-[var(--sn-teal)] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70 dark:border-[#2a3655] dark:bg-[#151c2f] dark:text-slate-200 dark:hover:bg-[#1a2440] dark:hover:text-[#8fb0ff]"
    >
      {loading ? (
        <span className="inline-flex items-center justify-center gap-2">
          <span className="loading loading-spinner loading-xs" />
          Connecting...
        </span>
      ) : (
        <>
          <GoogleIcon />
          {label}
        </>
      )}
    </button>
  );
}
