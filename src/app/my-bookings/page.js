"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api, { getErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/lib/ToastContext";
import RequireAuth from "@/components/RequireAuth";

function CancelModal({ booking, onClose, onCancelled }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const confirm = async () => {
    setLoading(true);
    try {
      await api.patch(`/api/bookings/${booking._id}/cancel`);
      toast("Booking cancelled");
      onCancelled();
      onClose();
    } catch (err) {
      toast(getErrorMessage(err, "Could not cancel booking."), "error");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="glass-card w-full max-w-sm rounded-3xl p-8 space-y-5 animate-fade-up text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
          <svg className="h-7 w-7 text-red-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <h2 className="heading-font text-xl">Cancel Booking?</h2>
          <p className="mt-1 text-sm text-soft">
            <strong>{booking.roomName}</strong> on{" "}
            {new Date(booking.startAt).toLocaleDateString()} will be released.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={confirm}
            disabled={loading}
            className="flex-1 rounded-full bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 transition"
          >
            {loading ? "Cancelling…" : "Yes, Cancel"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-full border border-[var(--sn-border)] bg-white py-2.5 text-sm font-medium hover:bg-[var(--sn-border)] transition"
          >
            Keep It
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === "confirmed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Confirmed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-semibold text-red-600">
      <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
      Cancelled
    </span>
  );
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function isFuture(iso) {
  return new Date(iso) > new Date();
}

export default function MyBookingsPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState("loading");
  const [loadError, setLoadError] = useState("");
  const [cancelTarget, setCancelTarget] = useState(null);

  const loadBookings = () => {
    setStatus("loading");
    setLoadError("");
    api
      .get("/api/bookings/my")
      .then((r) => {
        setBookings(Array.isArray(r.data) ? r.data : []);
        setStatus("ok");
      })
      .catch((err) => {
        setBookings([]);
        setLoadError(
          getErrorMessage(
            err,
            "Could not load your bookings. Make sure the backend is running."
          )
        );
        setStatus("error");
      });
  };

  useEffect(() => {
    loadBookings();
  }, []);

  return (
    <RequireAuth>
      <>
        {cancelTarget && (
          <CancelModal
            booking={cancelTarget}
            onClose={() => setCancelTarget(null)}
            onCancelled={loadBookings}
          />
        )}

        {status === "loading" && (
          <section className="mx-auto w-full max-w-4xl px-6 py-16">
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="glass-card rounded-3xl p-6 animate-pulse flex gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-[var(--sn-border)] shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 w-1/2 rounded-full bg-[var(--sn-border)]" />
                    <div className="h-3 w-3/4 rounded-full bg-[var(--sn-border)]" />
                    <div className="h-3 w-1/3 rounded-full bg-[var(--sn-border)]" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {status === "error" && (
          <section className="mx-auto w-full max-w-4xl px-6 py-16">
            <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-700">
              ⚠️ {loadError}
            </div>
          </section>
        )}

        {status === "ok" && (
          <section className="mx-auto w-full max-w-4xl px-6 py-12">
            <div className="mb-8 space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--sn-border)] bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--sn-teal)]">
                My Account
              </div>
              <h1 className="heading-font text-3xl sm:text-4xl">My Bookings</h1>
              <p className="text-sm text-soft">
                {bookings.length} booking{bookings.length !== 1 ? "s" : ""} found
              </p>
            </div>

            {bookings.length === 0 ? (
              <div className="glass-card rounded-3xl p-12 text-center space-y-4">
                <div className="text-5xl">📅</div>
                <h2 className="heading-font text-xl">You have no bookings yet.</h2>
                <p className="text-sm text-soft">Browse available rooms and reserve your first study session.</p>
                <Link
                  href="/rooms"
                  className="inline-flex rounded-full bg-[var(--sn-teal)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--sn-teal-dark)] transition"
                >
                  Browse Rooms
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((b) => {
                  const canCancel = b.status === "confirmed" && isFuture(b.startAt);
                  const start = new Date(b.startAt);
                  const end = new Date(b.endAt);
                  const hours = Math.round((end - start) / 3600000);

                  return (
                    <div key={b._id} className="glass-card rounded-3xl p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex gap-4 items-start">
                        {b.roomImage ? (
                          <img
                            src={b.roomImage}
                            alt=""
                            className="h-14 w-14 shrink-0 rounded-2xl object-cover border border-[var(--sn-border)]"
                          />
                        ) : (
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--sn-teal)]/10 text-lg font-semibold text-[var(--sn-teal)]">
                            SN
                          </div>
                        )}
                        <div className="space-y-1">
                          <h3 className="heading-font text-lg font-semibold leading-snug">
                            {b.roomName || "Study Room"}
                          </h3>
                          <p className="text-sm text-soft">
                            {formatDate(b.startAt)} &nbsp;·&nbsp; {formatTime(b.startAt)} – {formatTime(b.endAt)}
                            <span className="ml-2 text-xs">({hours}h)</span>
                          </p>
                          {b.purpose && (
                            <p className="text-xs text-soft italic">Note: {b.purpose}</p>
                          )}
                          <div className="pt-1">
                            <StatusBadge status={b.status} />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 sm:flex-col sm:items-end">
                        <Link
                          href={`/rooms/${b.roomId}`}
                          className="rounded-full border border-[var(--sn-border)] bg-white px-4 py-1.5 text-xs font-medium hover:bg-[var(--sn-border)] transition"
                        >
                          View Room
                        </Link>
                        {canCancel && (
                          <button
                            onClick={() => setCancelTarget(b)}
                            className="rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </>
    </RequireAuth>
  );
}
