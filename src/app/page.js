"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import api, { getErrorMessage } from "@/lib/api";

function truncate(str, max = 95) {
  if (!str) return "A quiet, comfortable space perfect for focused study sessions.";
  return str.length <= max ? str : str.slice(0, max).trimEnd() + "…";
}

const FALLBACK_COVERS = [
  "linear-gradient(135deg,#0f766e 0%,#134e4a 100%)",
  "linear-gradient(135deg,#1d4ed8 0%,#0f766e 100%)",
  "linear-gradient(135deg,#7c3aed 0%,#0f766e 100%)",
  "linear-gradient(135deg,#b45309 0%,#0f766e 100%)",
  "linear-gradient(135deg,#0369a1 0%,#134e4a 100%)",
  "linear-gradient(135deg,#166534 0%,#0f766e 100%)",
];

function HomeRoomCard({ room, index = 0 }) {
  const name = room?.name || room?.roomName || "Study Room";
  const description = truncate(room?.description || room?.summary);
  const floor = room?.location || room?.floor || "Main Floor";
  const capacity = room?.capacityMin && room?.capacityMax
    ? `${room.capacityMin}–${room.capacityMax} people`
    : room?.capacity ? `${room.capacity} people` : "Flexible";
  const price = (room?.pricePerHour || room?.hourlyRate)
    ? `$${room.pricePerHour || room.hourlyRate}/hr`
    : "Free";
  const amenities = Array.isArray(room?.amenities) ? room.amenities
    : Array.isArray(room?.features) ? room.features
      : ["Wi-Fi", "Whiteboard", "Power Outlets"];
  const shown = amenities.slice(0, 3);
  const extra = amenities.length - shown.length;
  const image = room?.image || null;
  const id = room?._id != null ? String(room._id) : room?.id != null ? String(room.id) : "";
  const cover = FALLBACK_COVERS[index % FALLBACK_COVERS.length];

  return (
    <div className="room-card group flex h-full flex-col rounded-3xl overflow-hidden">
      <div
        className="relative h-48 w-full shrink-0 overflow-hidden"
        style={image
          ? { backgroundImage: `url(${image})`, backgroundSize: "cover", backgroundPosition: "center" }
          : { background: cover }}
      >
        <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/15" />
        <div className="card-shimmer absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <span className="absolute bottom-3 right-3 rounded-full bg-white/15 border border-white/30 backdrop-blur-sm px-3 py-1 text-xs font-bold text-white">
          {price}
        </span>
        <span className="absolute top-3 left-3 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white">
          {floor}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5 bg-white/85 backdrop-blur-md border border-t-0 border-[var(--sn-border)] rounded-b-3xl">
        <h3 className="heading-font text-lg font-semibold leading-snug">{name}</h3>
        <p className="mt-1.5 text-xs leading-relaxed text-soft line-clamp-2">{description}</p>

        <div className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-[var(--sn-border)] bg-[var(--sn-amber-soft)] px-3 py-1 text-xs font-medium">
          <svg className="h-3.5 w-3.5 text-[var(--sn-amber)]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a4 4 0 00-4-4H8a4 4 0 00-4 4v1h12z" />
          </svg>
          {capacity}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {shown.map((a) => (
            <span key={a} className="inline-flex items-center rounded-full bg-[rgba(15,118,110,0.08)] border border-[rgba(15,118,110,0.2)] px-2.5 py-0.5 text-[10px] font-medium text-[var(--sn-teal)]">
              {a}
            </span>
          ))}
          {extra > 0 && (
            <span className="inline-flex items-center rounded-full border border-[var(--sn-border)] bg-white px-2.5 py-0.5 text-[10px] font-semibold text-soft">
              +{extra} more
            </span>
          )}
        </div>

        <div className="mt-auto pt-5">
          <Link
            href={id ? `/rooms/${id}` : "/rooms"}
            className="view-details-btn group/btn relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl px-4 py-2.5 text-sm font-semibold text-white"
          >
            <span className="relative z-10">View Details</span>
            <svg className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="room-card flex flex-col rounded-3xl overflow-hidden animate-pulse">
      <div className="h-48 bg-gradient-to-br from-[var(--sn-border)] to-[rgba(15,118,110,0.08)]" />
      <div className="flex flex-col gap-3 p-5 border border-t-0 border-[var(--sn-border)] rounded-b-3xl bg-white/70">
        <div className="h-4 w-2/3 rounded-full bg-[var(--sn-border)]" />
        <div className="h-3 w-full rounded-full bg-[var(--sn-border)]" />
        <div className="h-3 w-4/5 rounded-full bg-[var(--sn-border)]" />
        <div className="mt-2 h-8 w-28 rounded-full bg-[var(--sn-border)]" />
        <div className="mt-auto h-10 rounded-2xl bg-[var(--sn-border)]" />
      </div>
    </div>
  );
}

export default function Home() {
  const [rooms, setRooms] = useState([]);
  const [roomStatus, setRoomStatus] = useState("loading");
  const [roomLoadError, setRoomLoadError] = useState("");

  useEffect(() => {
    document.title = "StudyNook – Home";
  }, []);

  useEffect(() => {
    let alive = true;
    setRoomStatus("loading");
    setRoomLoadError("");
    api
      .get("/api/rooms?limit=6&sort=latest")
      .then((res) => {
        if (!alive) return;
        setRooms(Array.isArray(res.data) ? res.data : []);
        setRoomStatus("ok");
      })
      .catch((err) => {
        if (!alive) return;
        setRooms([]);
        setRoomLoadError(
          getErrorMessage(
            err,
            "Could not connect to the room catalog. Make sure the backend is running on localhost:5000."
          )
        );
        setRoomStatus("error");
      });
    return () => { alive = false; };
  }, []);

  return (
    <div className="flex flex-col">

      <section className="relative mx-auto w-full max-w-6xl px-6 pb-20 pt-16 sm:pt-24">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">

          <div className="space-y-7 animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--sn-border)] bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--sn-teal)] ring-soft">
              <span className="h-2 w-2 rounded-full bg-[var(--sn-teal)] animate-pulse-dot" />
              Rooms available now
            </div>

            <h1 className="heading-font text-4xl font-semibold leading-tight sm:text-5xl lg:text-[3.25rem]">
              Find Your Perfect{" "}
              <span className="gradient-text">Study Room</span>
            </h1>

            <p className="max-w-lg text-base leading-7 text-soft sm:text-lg">
              Browse and book quiet, private study rooms in your library.
              List your own room and <strong className="text-[var(--sn-ink)] font-semibold">earn</strong>.
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href="/rooms"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--sn-teal)] px-7 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[var(--sn-teal-dark)] hover:shadow-lg"
              >
                Explore Rooms
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--sn-border)] bg-white/80 px-7 py-3 text-sm font-semibold text-[var(--sn-ink)] shadow-sm transition hover:bg-white hover:shadow-md"
              >
                List Your Room
              </Link>
            </div>

            <div className="flex flex-wrap gap-8 border-t border-[var(--sn-border)] pt-6">
              {[
                { value: "32+", label: "Study rooms" },
                { value: "98%", label: "Conflict-free" },
                { value: "2 min", label: "Avg. booking" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="heading-font text-2xl text-[var(--sn-ink)]">{s.value}</p>
                  <p className="text-xs text-soft mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden lg:block animate-fade-up animate-delay-150">
            <div className="glass-card rounded-3xl p-6 space-y-4 border border-[var(--sn-border)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-soft">Today</p>
                  <h2 className="heading-font text-2xl">Your Schedule</h2>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--sn-border)] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--sn-teal)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--sn-teal)] animate-pulse-dot" />
                  Live
                </span>
              </div>

              {[
                { name: "Quiet Focus Room", time: "10:00–12:00", info: "2 seats · Whiteboard" },
                { name: "Group Prep Studio", time: "14:00–16:00", info: "6 seats · Screen share" },
              ].map((b) => (
                <div key={b.name} className="rounded-2xl border border-[var(--sn-border)] bg-white/80 p-4">
                  <div className="flex items-center justify-between">
                    <p className="heading-font text-base">{b.name}</p>
                    <span className="text-xs font-semibold text-[var(--sn-teal)]">{b.time}</span>
                  </div>
                  <p className="text-xs text-soft mt-0.5">{b.info}</p>
                </div>
              ))}

              <div className="rounded-2xl bg-[var(--sn-amber-soft)] px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--sn-ink)]">Room alert</p>
                  <p className="text-sm font-medium">3 rooms open soon</p>
                </div>
                <span className="rounded-full border border-[var(--sn-border)] bg-white px-3 py-1 text-xs font-semibold">Reserve</span>
              </div>
            </div>

            <div className="absolute -bottom-8 -left-8 animate-float glass-card rounded-3xl border border-[var(--sn-border)] px-6 py-4 shadow-xl">
              <p className="text-[10px] uppercase tracking-[0.2em] text-soft">Live occupancy</p>
              <p className="heading-font text-3xl">68%</p>
              <p className="text-xs text-soft">Quiet wing running low</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--sn-border)] bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--sn-teal)]">
              Fresh listings
            </div>
            <h2 className="heading-font text-3xl sm:text-4xl">Available Study Rooms</h2>
            <p className="max-w-md text-sm text-soft">
              Live inventory from the library catalog. Pick a room and reserve your slot instantly.
            </p>
          </div>
          <Link href="/rooms" className="inline-flex shrink-0 items-center gap-1 self-start rounded-full border border-[var(--sn-border)] bg-white/70 px-5 py-2 text-sm font-medium text-[var(--sn-ink)] transition hover:bg-white sm:self-auto">
            View all →
          </Link>
        </div>

        {roomStatus === "loading" && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {roomStatus === "error" && (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-700">
            ⚠️ {roomLoadError}
          </div>
        )}

        {roomStatus === "ok" && rooms.length === 0 && (
          <div className="glass-card rounded-3xl p-10 text-center text-sm text-soft">
            No rooms have been added yet.{" "}
            <Link href="/register" className="text-[var(--sn-teal)] underline underline-offset-2">
              List your room
            </Link>{" "}to get started.
          </div>
        )}

        {roomStatus === "ok" && rooms.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room, i) => (
              <HomeRoomCard key={room._id || room.id || i} room={room} index={i} />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="overflow-hidden rounded-3xl border border-[var(--sn-border)] bg-white/80">
          <div className="grid md:grid-cols-[1.1fr_0.9fr] md:items-center gap-10 p-8 md:p-12">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--sn-teal)]">
                Simple 3-step flow
              </p>
              <h2 className="heading-font text-3xl sm:text-4xl">
                Book a room in{" "}
                <span className="gradient-text">under 2 minutes.</span>
              </h2>
              <p className="text-sm leading-relaxed text-soft max-w-xs">
                StudyNook handles conflict checking and confirmations so you
                can focus on your work, not the logistics.
              </p>
              <Link
                href="/rooms"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--sn-teal)] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--sn-teal-dark)]"
              >
                Browse Rooms →
              </Link>
            </div>

            <div className="space-y-6">
              {[
                { n: "01", title: "Browse rooms", desc: "Filter by floor, capacity, amenities, and hourly rate." },
                { n: "02", title: "Pick your slot", desc: "Select a date and time — conflicts blocked automatically." },
                { n: "03", title: "Manage sessions", desc: "Cancel or extend right from your personal dashboard." },
              ].map((s) => (
                <div key={s.n} className="flex gap-4 items-start group">
                  <div className="heading-font flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--sn-teal)] text-sm font-bold text-white shadow-sm transition group-hover:scale-105">
                    {s.n}
                  </div>
                  <div>
                    <p className="heading-font text-lg font-semibold">{s.title}</p>
                    <p className="text-sm text-soft mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-24">
        <div className="mb-10 text-center space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--sn-teal)]">
            Why StudyNook
          </p>
          <h2 className="heading-font text-3xl sm:text-4xl">
            Everything you need for a{" "}
            <span className="gradient-text">focused session.</span>
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: "🔒", color: "rgba(15,118,110,0.1)", title: "Conflict-proof booking", desc: "Our real-time validator prevents double-booking before it happens — every time." },
            { icon: "🪑", color: "rgba(249,115,22,0.1)", title: "Detailed room profiles", desc: "Capacity, noise level, floor, amenities, and photos in one glance." },
            { icon: "📊", color: "rgba(124,58,237,0.1)", title: "Personal dashboard", desc: "Track upcoming sessions, view history, and cancel or extend with one click." },
            { icon: "💡", color: "rgba(234,179,8,0.12)", title: "List & earn", desc: "Have a spare study room? List it on StudyNook and earn hourly from other students." },
            { icon: "🔔", color: "rgba(14,165,233,0.12)", title: "Smart alerts", desc: "Get notified when your favourite rooms open up or your session starts." },
            { icon: "🌐", color: "rgba(15,118,110,0.08)", title: "Works on any device", desc: "Fully responsive across mobile, tablet, and desktop with a fast interface." },
          ].map((f, i) => (
            <div
              key={f.title}
              className={`feature-card animate-fade-up ${i === 1 ? "animate-delay-150" : i === 2 ? "animate-delay-300" : i === 3 ? "animate-delay-150" : ""}`}
            >
              <div className="feature-icon" style={{ background: f.color }}>
                {f.icon}
              </div>
              <h3 className="heading-font text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-soft">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-5 rounded-3xl border border-[var(--sn-border)] bg-gradient-to-br from-[rgba(15,118,110,0.08)] to-[rgba(14,165,233,0.06)] p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="heading-font text-2xl">Ready to claim your space?</h3>
            <p className="mt-1 text-sm text-soft">Free to join — start booking in seconds.</p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--sn-amber)] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#ea6a10] hover:shadow-md"
            >
              Get Started Free
            </Link>
            <Link
              href="/rooms"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--sn-border)] bg-white/80 px-6 py-2.5 text-sm font-semibold text-[var(--sn-ink)] transition hover:bg-white hover:shadow-sm"
            >
              Browse Rooms
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
