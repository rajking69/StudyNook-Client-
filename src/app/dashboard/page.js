"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import api, { getErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/lib/ToastContext";
import { validatePassword } from "@/lib/validatePassword";
import RequireAuth from "@/components/RequireAuth";

function getInitials(name) {
  return (
    name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "U"
  );
}

function formatWhen(iso) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }),
    time: d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
  };
}

function StatusPill({ status }) {
  const confirmed = status === "confirmed";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
        confirmed
          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
          : "bg-red-500/15 text-red-600 dark:text-red-300"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${confirmed ? "bg-emerald-500" : "bg-red-400"}`}
      />
      {confirmed ? "Confirmed" : "Cancelled"}
    </span>
  );
}

function StatCard({ label, value, hint, icon }) {
  return (
    <div className="rounded-2xl border border-[var(--sn-border)] bg-[var(--sn-card)]/90 p-5 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-soft">
            {label}
          </p>
          <p className="heading-font mt-1 text-2xl font-semibold text-[var(--sn-ink)]">
            {value}
          </p>
          {hint && <p className="mt-1 text-xs text-soft">{hint}</p>}
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(15,118,110,0.1)] text-[var(--sn-teal)]">
          {icon}
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="h-48 animate-pulse rounded-3xl bg-[var(--sn-border)]/60" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-[var(--sn-border)]/50" />
        ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 h-80 animate-pulse rounded-3xl bg-[var(--sn-border)]/40" />
        <div className="h-80 animate-pulse rounded-3xl bg-[var(--sn-border)]/40" />
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { logout, setUser: setAuthUser } = useAuth();
  const toast = useToast();

  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [listingCount, setListingCount] = useState(0);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  const [nameValue, setNameValue] = useState("");
  const [photoValue, setPhotoValue] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [profileStatus, setProfileStatus] = useState("idle");
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState("idle");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    let alive = true;

    const loadDashboard = async () => {
      try {
        const [userRes, bookingsRes, listingsRes] = await Promise.all([
          api.get("/auth/me"),
          api.get("/api/bookings/my"),
          api.get("/api/rooms/mine").catch(() => ({ data: [] })),
        ]);
        if (!alive) return;

        const user = userRes.data;
        setProfile(user);
        setAuthUser(user);
        setNameValue(user?.name || "");
        setPhotoValue(user?.photoURL || "");
        setPhotoPreview(user?.photoURL || "");
        setBookings(Array.isArray(bookingsRes.data) ? bookingsRes.data : []);
        setListingCount(
          Array.isArray(listingsRes.data) ? listingsRes.data.length : 0
        );
        setStatus("success");
      } catch (err) {
        if (!alive) return;
        setProfile(null);
        setBookings([]);
        setError(getErrorMessage(err, "Please sign in to view your dashboard."));
        setStatus("error");
      }
    };

    loadDashboard();
    return () => {
      alive = false;
    };
  }, [setAuthUser]);

  const upcomingCount = bookings.filter(
    (b) => b.status === "confirmed" && new Date(b.startAt) > new Date()
  ).length;
  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;
  const cancelledCount = bookings.filter((b) => b.status === "cancelled").length;
  const stats = {
    upcoming: upcomingCount,
    confirmed: confirmedCount,
    cancelled: cancelledCount,
    total: bookings.length,
  };

  const recentBookings = useMemo(
    () =>
      [...bookings]
        .sort((a, b) => new Date(b.startAt) - new Date(a.startAt))
        .slice(0, 5),
    [bookings]
  );

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const handlePhotoUrlChange = (event) => {
    const value = event.target.value;
    setPhotoValue(value);
    setPhotoPreview(value);
  };

  const handleSetPassword = async (event) => {
    event.preventDefault();
    setPasswordError("");

    const ruleError = validatePassword(newPassword);
    if (ruleError) {
      setPasswordError(ruleError);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setPasswordStatus("saving");
    try {
      const response = await api.post("/auth/set-password", { password: newPassword });
      setProfile(response.data);
      setAuthUser(response.data);
      setNewPassword("");
      setConfirmPassword("");
      toast("Password saved. You can sign in with email and password.");
    } catch (err) {
      const message = getErrorMessage(err, "Could not save password.");
      setPasswordError(message);
      toast(message, "error");
    } finally {
      setPasswordStatus("idle");
    }
  };

  const handleProfileSave = async () => {
    if (profileStatus === "saving") return;

    const nextName = nameValue.trim();
    const nextPhoto = photoValue.trim();
    if (!nextName) {
      toast("Name is required.", "error");
      return;
    }

    const nameSame = nextName === (profile?.name || "");
    const photoSame = nextPhoto === (profile?.photoURL || "");
    if (nameSame && photoSame) {
      toast("Profile is already up to date.");
      return;
    }

    setProfileStatus("saving");
    try {
      const payload = {};
      if (!nameSame) payload.name = nextName;
      if (!photoSame) payload.photoURL = nextPhoto;

      const response = await api.patch("/auth/me", payload);
      setProfile(response.data);
      setAuthUser(response.data);
      setNameValue(response.data?.name || "");
      setPhotoValue(response.data?.photoURL || "");
      setPhotoPreview(response.data?.photoURL || "");
      toast("Profile updated.");
      setShowProfileEdit(false);
    } catch (err) {
      toast(getErrorMessage(err, "Could not update profile."), "error");
    } finally {
      setProfileStatus("idle");
    }
  };

  if (status === "loading") {
    return (
      <RequireAuth>
        <DashboardSkeleton />
      </RequireAuth>
    );
  }

  if (status === "error") {
    return (
      <RequireAuth>
        <section className="mx-auto w-full max-w-6xl px-6 py-16">
          <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
            {error}
          </div>
          <Link
            href="/login"
            className="mt-6 inline-flex rounded-full bg-[var(--sn-teal)] px-6 py-2.5 text-sm font-semibold text-white"
          >
            Go to Login
          </Link>
        </section>
      </RequireAuth>
    );
  }

  const displayName = profile?.name || "User";
  const initials = getInitials(displayName);

  return (
    <RequireAuth>
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pt-10">
        {/* Hero profile header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-visible rounded-3xl border border-[var(--sn-border)] bg-gradient-to-br from-[var(--sn-teal)] via-[#0d9488] to-[#134e4a] p-6 text-white shadow-lg sm:p-8"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-[var(--sn-amber)]/20 blur-3xl" />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:items-start">
            {/* Avatar + compact edit */}
            <div className="relative mx-auto shrink-0 sm:mx-0">
              <div className="relative">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt=""
                    className="h-20 w-20 rounded-2xl border-2 border-white/40 object-cover shadow-lg sm:h-24 sm:w-24"
                    onError={() => setPhotoPreview("")}
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-white/35 bg-white/20 text-2xl font-bold text-white shadow-lg backdrop-blur sm:h-24 sm:w-24 sm:text-3xl">
                    {initials}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setShowProfileEdit((open) => !open)}
                  className="absolute -bottom-1 -left-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[var(--sn-teal-dark)] shadow ring-2 ring-[#134e4a] transition hover:bg-white/90"
                  aria-label={showProfileEdit ? "Close profile settings" : "Edit profile"}
                  aria-expanded={showProfileEdit}
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400 text-[10px] font-bold text-emerald-950 ring-2 ring-[#134e4a]">
                  ✓
                </span>
              </div>

              {showProfileEdit && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute left-1/2 top-full z-20 mt-2 w-[min(100vw-3rem,16rem)] -translate-x-1/2 rounded-xl border border-white/25 bg-white/95 p-3 text-[var(--sn-ink)] shadow-xl backdrop-blur-sm sm:left-0 sm:translate-x-0 dark:bg-[var(--sn-card)]/95"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-soft">
                    Profile
                  </p>
                  <div className="mt-2.5 space-y-2">
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-soft">
                        Full name
                      </label>
                      <input
                        className="input input-bordered input-sm mt-1.5 w-full bg-white dark:bg-[var(--sn-card)]"
                        type="text"
                        value={nameValue}
                        onChange={(e) => setNameValue(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-soft">
                        Photo URL
                      </label>
                      <input
                        className="input input-bordered input-sm mt-1.5 w-full bg-white dark:bg-[var(--sn-card)]"
                        type="url"
                        placeholder="https://..."
                        value={photoValue}
                        onChange={handlePhotoUrlChange}
                      />
                    </div>
                  </div>
                  <div className="mt-2.5 flex gap-1.5">
                    <button
                      type="button"
                      onClick={handleProfileSave}
                      disabled={profileStatus === "saving"}
                      className="flex-1 rounded-full bg-[var(--sn-teal)] py-1.5 text-xs font-semibold text-white transition hover:bg-[var(--sn-teal-dark)] disabled:opacity-60"
                    >
                      {profileStatus === "saving" ? "…" : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowProfileEdit(false)}
                      className="rounded-full border border-[var(--sn-border)] px-3 py-1.5 text-xs text-soft transition hover:bg-[var(--sn-border)]"
                    >
                      ✕
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Name + actions */}
            <div className="flex flex-1 flex-col gap-3 text-center sm:text-left">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/70">
                  Member dashboard
                </p>
                <h1 className="heading-font mt-1 text-2xl font-semibold sm:text-3xl">
                  {displayName}
                </h1>
                <p className="mt-1 text-sm text-white/80">{profile?.email}</p>
                <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur">
                    {profile?.hasPassword ? "Email + Google" : "Google account"}
                  </span>
                  <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur">
                    StudyNook
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                <Link
                  href="/my-bookings"
                  className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-[var(--sn-teal-dark)] shadow-sm transition hover:bg-white/90"
                >
                  My bookings
                </Link>
                <Link
                  href="/my-listings"
                  className="inline-flex items-center justify-center rounded-full border border-white/35 bg-white/10 px-5 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20"
                >
                  My listings
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center rounded-full border border-white/35 bg-white/10 px-5 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Upcoming"
            value={stats.upcoming}
            hint="Confirmed future sessions"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
          <StatCard
            label="Total bookings"
            value={stats.total}
            hint={`${stats.confirmed} active · ${stats.cancelled} cancelled`}
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />
          <StatCard
            label="My listings"
            value={listingCount}
            hint="Rooms you host"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          />
          <StatCard
            label="Account"
            value={profile?.hasPassword ? "Secure" : "Google"}
            hint={profile?.hasPassword ? "Password enabled" : "Add password below"}
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
          />
        </div>

        <div className="mt-8 space-y-6">
          {!profile?.hasPassword && (
            <div className="glass-card rounded-3xl border border-[rgba(15,118,110,0.2)] p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="heading-font text-lg">Set password</h2>
                  <p className="mt-1 max-w-md text-sm text-soft">
                    Signed in with Google. Add a password to also log in with email.
                  </p>
                </div>
                <form
                  onSubmit={handleSetPassword}
                  className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:items-end"
                >
                  <input
                    className="input input-bordered flex-1 bg-[var(--sn-card)]"
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <input
                    className="input input-bordered flex-1 bg-[var(--sn-card)]"
                    type="password"
                    placeholder="Confirm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    disabled={passwordStatus === "saving"}
                    className="shrink-0 rounded-full bg-[var(--sn-teal)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--sn-teal-dark)] disabled:opacity-60"
                  >
                    {passwordStatus === "saving" ? "Saving…" : "Save"}
                  </button>
                </form>
              </div>
              {passwordError && (
                <p className="mt-3 text-sm text-red-600">{passwordError}</p>
              )}
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="heading-font text-xl text-[var(--sn-ink)]">
                Recent bookings
              </h2>
              <Link
                href="/my-bookings"
                className="text-sm font-semibold text-[var(--sn-teal)] hover:underline"
              >
                View all →
              </Link>
            </div>

            {recentBookings.length === 0 ? (
              <div className="glass-card rounded-3xl p-10 text-center">
                <p className="text-4xl">📅</p>
                <h3 className="heading-font mt-3 text-lg">No bookings yet</h3>
                <p className="mt-1 text-sm text-soft">
                  Browse study rooms and reserve your first focused session.
                </p>
                <Link
                  href="/rooms"
                  className="mt-6 inline-flex rounded-full bg-[var(--sn-teal)] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--sn-teal-dark)]"
                >
                  Explore rooms
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentBookings.map((booking, index) => {
                  const start = formatWhen(booking.startAt);
                  const end = formatWhen(booking.endAt);
                  return (
                    <motion.div
                      key={booking._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="glass-card flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center"
                    >
                      {booking.roomImage ? (
                        <img
                          src={booking.roomImage}
                          alt=""
                          className="h-16 w-16 shrink-0 rounded-xl object-cover border border-[var(--sn-border)]"
                        />
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[rgba(15,118,110,0.1)] text-lg font-semibold text-[var(--sn-teal)]">
                          SN
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="heading-font text-base font-semibold truncate">
                            {booking.roomName || "Study room"}
                          </h3>
                          <StatusPill status={booking.status} />
                        </div>
                        <p className="mt-1 text-sm text-soft">
                          {start.date} · {start.time} – {end.time}
                        </p>
                        {booking.purpose && (
                          <p className="mt-1 text-xs text-soft line-clamp-1">
                            Note: {booking.purpose}
                          </p>
                        )}
                      </div>
                      {booking.roomId && (
                        <Link
                          href={`/rooms/${booking.roomId}`}
                          className="shrink-0 rounded-full border border-[var(--sn-border)] bg-[var(--sn-card)] px-4 py-2 text-xs font-semibold text-[var(--sn-ink)] transition hover:border-[var(--sn-teal)] hover:text-[var(--sn-teal)]"
                        >
                          View room
                        </Link>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </RequireAuth>
  );
}
