"use client";

import { useEffect, useState } from "react";
import api, { getErrorMessage } from "@/lib/api";
import RoomCard from "@/components/RoomCard";

const AMENITY_OPTIONS = [
  "Whiteboard",
  "Projector",
  "Wi-Fi",
  "Power Outlets",
  "Quiet Zone",
  "Air Conditioning",
];

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [floor, setFloor] = useState("");
  const [minRate, setMinRate] = useState("");
  const [maxRate, setMaxRate] = useState("");

  const toggleAmenity = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((item) => item !== amenity)
        : [...prev, amenity]
    );
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedAmenities([]);
    setFloor("");
    setMinRate("");
    setMaxRate("");
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let alive = true;
    setStatus("loading");
    setError("");

    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (selectedAmenities.length) params.set("amenities", selectedAmenities.join(","));
    if (floor.trim()) params.set("floor", floor.trim());
    if (minRate) params.set("minRate", minRate);
    if (maxRate) params.set("maxRate", maxRate);

    const query = params.toString();
    const url = query ? `/api/rooms?${query}` : "/api/rooms";

    api.get(url)
      .then((res) => {
        if (!alive) return;
        setRooms(Array.isArray(res.data) ? res.data : []);
        setStatus("success");
      })
      .catch((err) => {
        if (!alive) return;
        setRooms([]);
        setError(
          getErrorMessage(err, "Unable to load rooms. Please try again.")
        );
        setStatus("error");
      });
    return () => { alive = false; };
  }, [debouncedSearch, selectedAmenities, floor, minRate, maxRate]);

  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-20 pt-12">
      <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--sn-border)] bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--sn-teal)]">
            All Rooms
          </div>
          <h1 className="heading-font text-3xl sm:text-4xl">Explore every study space</h1>
          <p className="max-w-lg text-sm text-soft">
            Browse availability in real time and reserve a room that matches your focus style.
          </p>
        </div>
        <span className="text-sm text-soft self-start sm:self-auto shrink-0">
          {status === "success" ? `${rooms.length} room${rooms.length !== 1 ? "s" : ""} available` : ""}
        </span>
      </div>

      <div className="glass-card rounded-3xl p-6 mb-8">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-soft">
              Search rooms
            </label>
            <input
              className="input input-bordered mt-2 w-full bg-white"
              type="text"
              placeholder="Search by name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-soft">
              Floor or location
            </label>
            <input
              className="input input-bordered mt-2 w-full bg-white"
              type="text"
              placeholder="e.g. 3rd Floor"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-soft">
              Hourly rate (USD)
            </label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <input
                className="input input-bordered w-full bg-white"
                type="number"
                min={0}
                placeholder="Min"
                value={minRate}
                onChange={(e) => setMinRate(e.target.value)}
              />
              <input
                className="input input-bordered w-full bg-white"
                type="number"
                min={0}
                placeholder="Max"
                value={maxRate}
                onChange={(e) => setMaxRate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-soft mb-3">
            Amenities
          </p>
          <div className="flex flex-wrap gap-2">
            {AMENITY_OPTIONS.map((amenity) => {
              const selected = selectedAmenities.includes(amenity);
              return (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${selected
                      ? "border-[var(--sn-teal)] bg-[rgba(15,118,110,0.10)] text-[var(--sn-teal)]"
                      : "border-[var(--sn-border)] bg-white text-[var(--sn-ink)] hover:border-[var(--sn-teal)]"
                    }`}
                >
                  {amenity}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-soft">
            {selectedAmenities.length > 0 || debouncedSearch || floor || minRate || maxRate
              ? "Filters applied"
              : "Showing all rooms"}
          </p>
          <button
            type="button"
            className="rounded-full border border-[var(--sn-border)] bg-white px-4 py-1.5 text-xs font-medium text-[var(--sn-ink)] transition hover:bg-[var(--sn-border)]"
            onClick={clearFilters}
            disabled={!selectedAmenities.length && !search && !floor && !minRate && !maxRate}
          >
            Clear filters
          </button>
        </div>
      </div>

      {status === "loading" && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="room-card flex flex-col rounded-3xl overflow-hidden animate-pulse">
              <div className="h-48 bg-gradient-to-br from-[var(--sn-border)] to-[rgba(15,118,110,0.08)]" />
              <div className="flex flex-col gap-3 p-5 border border-t-0 border-[var(--sn-border)] rounded-b-3xl bg-white/70">
                <div className="h-4 w-2/3 rounded-full bg-[var(--sn-border)]" />
                <div className="h-3 w-full rounded-full bg-[var(--sn-border)]" />
                <div className="mt-auto h-10 rounded-2xl bg-[var(--sn-border)]" />
              </div>
            </div>
          ))}
        </div>
      )}

      {status === "error" && (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      {status === "success" && rooms.length === 0 && (
        <div className="glass-card rounded-3xl p-10 text-center text-sm text-soft">
          No rooms found. Be the first to add one!
        </div>
      )}

      {status === "success" && rooms.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room, i) => (
            <RoomCard key={room._id || i} room={room} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
