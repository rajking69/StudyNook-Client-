"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api, { getErrorMessage } from "@/lib/api";
import RoomCard from "@/components/RoomCard";
import RequireAuth from "@/components/RequireAuth";

export default function MyListingsPage() {
  const [rooms, setRooms] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    api
      .get("/api/rooms/mine")
      .then((res) => {
        if (!alive) return;
        setRooms(Array.isArray(res.data) ? res.data : []);
        setStatus("ok");
      })
      .catch((err) => {
        if (!alive) return;
        setRooms([]);
        setError(getErrorMessage(err, "Could not load your listings."));
        setStatus("error");
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <RequireAuth>
      <section className="mx-auto w-full max-w-6xl px-6 pb-20 pt-12">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-soft">
              Owner
            </p>
            <h1 className="heading-font text-3xl sm:text-4xl">My Listings</h1>
            <p className="text-sm text-soft">
              Rooms you have listed on StudyNook.
            </p>
          </div>
          <Link
            href="/add-room"
            className="rounded-full bg-[var(--sn-teal)] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--sn-teal-dark)]"
          >
            Add Room
          </Link>
        </div>

        {status === "loading" && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="glass-card h-80 rounded-3xl animate-pulse bg-white/60"
              />
            ))}
          </div>
        )}

        {status === "error" && (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-700">
            {error}
          </div>
        )}

        {status === "ok" && rooms.length === 0 && (
          <div className="glass-card rounded-3xl p-12 text-center space-y-4">
            <p className="text-5xl">🏠</p>
            <h2 className="heading-font text-xl">No listings yet</h2>
            <p className="text-sm text-soft">
              Add your first study room to appear in the catalog.
            </p>
            <Link
              href="/add-room"
              className="inline-flex rounded-full bg-[var(--sn-teal)] px-6 py-2.5 text-sm font-semibold text-white"
            >
              Add Room
            </Link>
          </div>
        )}

        {status === "ok" && rooms.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room, i) => (
              <RoomCard key={room._id || i} room={room} index={i} />
            ))}
          </div>
        )}
      </section>
    </RequireAuth>
  );
}
