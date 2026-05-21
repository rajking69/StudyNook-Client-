"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import api, { getErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/lib/ToastContext";
import GoogleSignInButton from "@/components/GoogleSignInButton";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const { setUser } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [googleOnly, setGoogleOnly] = useState(false);

  const redirectTo = searchParams.get("next") || "/";
  const isLoginLoading = status === "loading";

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setGoogleOnly(false);
    setStatus("loading");

    try {
      const response = await api.post("/auth/login", {
        email: form.email,
        password: form.password,
      });
      setUser(response.data);
      toast("Welcome back!");
      router.replace(redirectTo);
    } catch (err) {
      const isGoogleOnly = err?.response?.data?.code === "GOOGLE_ONLY";
      const message = getErrorMessage(
        err,
        "Login failed. Check your credentials."
      );
      setGoogleOnly(isGoogleOnly);
      setError(message);
      toast(message, "error");
      setStatus("idle");
    }
  };

  const googleCallback = `/auth/bridge?redirect=${encodeURIComponent(redirectTo)}`;

  return (
    <section className="mx-auto w-full max-w-4xl px-6 py-16">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-4">
          <h1 className="heading-font text-3xl">Welcome back to StudyNook</h1>
          <p className="text-sm text-soft">
            Sign in to manage bookings, add rooms, and keep your study plans on track.
          </p>
          <div className="rounded-3xl border border-[var(--sn-border)] bg-white/70 p-6 text-sm text-soft">
            <p className="heading-font text-base text-[var(--sn-ink)]">Quick access</p>
            <ul className="mt-2 space-y-2">
              <li>View upcoming reservations</li>
              <li>Manage your listed rooms</li>
              <li>Track cancellations in one place</li>
            </ul>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-8 space-y-5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-soft">
              Email
            </label>
            <input
              className="input input-bordered mt-2 w-full bg-white"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@university.edu"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-soft">
              Password
            </label>
            <input
              className="input input-bordered mt-2 w-full bg-white"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Your password"
              required
            />
          </div>
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 space-y-2">
              <p>{error}</p>
              {googleOnly && (
                <p className="text-xs">
                  Or{" "}
                  <Link className="font-semibold text-[var(--sn-teal)] underline" href="/register">
                    add a password on Register
                  </Link>{" "}
                  with the same email.
                </p>
              )}
            </div>
          )}
          <button
            className="btn w-full border-none bg-[var(--sn-teal)] text-white hover:bg-[var(--sn-teal-dark)]"
            type="submit"
            disabled={status !== "idle"}
          >
            {isLoginLoading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <span className="loading loading-spinner loading-xs" />
                Signing in...
              </span>
            ) : (
              "Sign in"
            )}
          </button>
          <GoogleSignInButton
            callbackUrl={googleCallback}
            disabled={status !== "idle"}
          />
          <p className="text-center text-sm text-soft">
            New here?{" "}
            <Link className="text-[var(--sn-teal)]" href="/register">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <section className="mx-auto flex min-h-[50vh] w-full max-w-4xl items-center justify-center px-6 py-16">
          <span className="loading loading-spinner loading-lg text-[var(--sn-teal)]" />
        </section>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
