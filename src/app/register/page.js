"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api, { getErrorMessage } from "@/lib/api";
import { useToast } from "@/lib/ToastContext";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { validatePassword } from "@/lib/validatePassword";

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState({ name: "", email: "", photoURL: "", password: "" });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const isRegisterLoading = status === "loading";

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const passwordError = validatePassword(form.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setStatus("loading");

    try {
      const response = await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        photoURL: form.photoURL,
      });
      toast(
        response.data?.message ||
        (response.data?.linked
          ? "Password linked. Please login."
          : "Registration successful! Please login.")
      );
      router.push("/login");
    } catch (err) {
      const message = getErrorMessage(
        err,
        "Unable to create account. Try again."
      );
      setError(message);
      toast(message, "error");
      setStatus("idle");
    }
  };


  return (
    <section className="mx-auto w-full max-w-4xl px-6 py-16">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-4">
          <h1 className="heading-font text-3xl">Create your StudyNook profile</h1>
          <p className="text-sm text-soft">
            Build a personalized dashboard for your study schedule and get instant room
            confirmations.
          </p>
          <div className="rounded-3xl border border-[var(--sn-border)] bg-white/70 p-6 text-sm text-soft">
            <p className="heading-font text-base text-[var(--sn-ink)]">What you get</p>
            <ul className="mt-2 space-y-2">
              <li>Real-time booking availability</li>
              <li>Conflict-free reservations</li>
              <li>Personal session reminders</li>
            </ul>
          </div>
        </div>
        <form
          onSubmit={handleSubmit}
          className="glass-card rounded-3xl p-8 space-y-5"
        >
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-soft">
              Full name
            </label>
            <input
              className="input input-bordered mt-2 w-full bg-white"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Alex Morgan"
              required
            />
          </div>
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
              Photo URL <span className="text-soft font-normal normal-case">(optional)</span>
            </label>
            <input
              className="input input-bordered mt-2 w-full bg-white"
              type="url"
              name="photoURL"
              value={form.photoURL}
              onChange={handleChange}
              placeholder="https://example.com/avatar.png"
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
              placeholder="Minimum 6 characters"
              required
            />
          </div>
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <button
            className="btn w-full border-none bg-[var(--sn-teal)] text-white hover:bg-[var(--sn-teal-dark)]"
            type="submit"
            disabled={status !== "idle"}
          >
            {isRegisterLoading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <span className="loading loading-spinner loading-xs" />
                Creating...
              </span>
            ) : (
              "Create Account"
            )}
          </button>
          <GoogleSignInButton
            callbackUrl="/auth/bridge?redirect=/"
            disabled={status !== "idle"}
          />
          <p className="text-center text-sm text-soft">
            Already have an account?{" "}
            <Link className="text-[var(--sn-teal)]" href="/login">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}
