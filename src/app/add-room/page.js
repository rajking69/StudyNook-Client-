"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/lib/ToastContext";
import api, { getErrorMessage } from "@/lib/api";
import Link from "next/link";
import RequireAuth from "@/components/RequireAuth";

const AMENITY_OPTIONS = [
  "Whiteboard",
  "Projector",
  "Wi-Fi",
  "Power Outlets",
  "Quiet Zone",
  "Air Conditioning",
];

const EMPTY = {
  name: "",
  description: "",
  image: "",
  location: "",
  capacity: "",
  pricePerHour: "",
  amenities: [],
};

export default function AddRoomPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleAmenity = (a) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(a)
        ? prev.amenities.filter((x) => x !== a)
        : [...prev.amenities, a],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("loading");

    try {
      await api.post("/api/rooms", {
        name: form.name,
        description: form.description,
        image: form.image,
        location: form.location,
        capacity: form.capacity ? Number(form.capacity) : null,
        pricePerHour: form.pricePerHour ? Number(form.pricePerHour) : null,
        amenities: form.amenities,
      });
      toast("Room added successfully");
      router.push("/my-listings");
    } catch (err) {
      const message = getErrorMessage(err, "Failed to add room. Try again.");
      setError(message);
      toast(message, "error");
      setStatus("idle");
    }
  };

  return (
    <RequireAuth>
      <section className="mx-auto w-full max-w-3xl px-6 py-16">
        <div className="mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--sn-border)] bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--sn-teal)]">
            List a Space
          </div>
          <h1 className="heading-font text-3xl sm:text-4xl">Add a Study Room</h1>
          <p className="text-sm text-soft">
            Fill in the details below and your room will appear in the public catalog immediately.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-8 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-soft mb-1.5">
                Room Name <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="e.g. Quiet Focus Room A"
                className="input input-bordered w-full bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-soft mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={3}
                placeholder="Describe the room, atmosphere, rules…"
                className="textarea textarea-bordered w-full bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-soft mb-1.5">
                Image URL <span className="text-red-500">*</span>
              </label>
              <input
                name="image"
                value={form.image}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/…"
                className="input input-bordered w-full bg-white"
                required
              />
              {form.image && (
                <div className="mt-3 h-40 w-full overflow-hidden rounded-2xl border border-[var(--sn-border)]">
                  <img
                    src={form.image}
                    alt="Preview"
                    className="h-full w-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-soft mb-1.5">
                Floor / Location <span className="text-red-500">*</span>
              </label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                required
                placeholder="e.g. 3rd Floor, East Wing"
                className="input input-bordered w-full bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-soft mb-1.5">
                Seat Capacity
              </label>
              <input
                name="capacity"
                value={form.capacity}
                onChange={handleChange}
                type="number"
                min={1}
                placeholder="e.g. 4"
                className="input input-bordered w-full bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-soft mb-1.5">
                Hourly Rate (USD) <span className="text-red-500">*</span>
              </label>
              <input
                name="pricePerHour"
                value={form.pricePerHour}
                onChange={handleChange}
                type="number"
                min={0}
                step="0.01"
                required
                placeholder="e.g. 5"
                className="input input-bordered w-full bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-soft mb-3">
              Amenities
            </label>
            <div className="grid gap-2 sm:grid-cols-2">
              {AMENITY_OPTIONS.map((a) => {
                const checked = form.amenities.includes(a);
                return (
                  <label
                    key={a}
                    className={`flex items-center gap-3 rounded-full border px-4 py-2 text-sm font-medium transition ${checked
                        ? "border-[var(--sn-teal)] bg-[rgba(15,118,110,0.10)] text-[var(--sn-teal)]"
                        : "border-[var(--sn-border)] bg-white text-[var(--sn-ink)] hover:border-[var(--sn-teal)]"
                      }`}
                  >
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={checked}
                      onChange={() => toggleAmenity(a)}
                    />
                    <span>{a}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={status === "loading"}
              className="rounded-full bg-[var(--sn-teal)] px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--sn-teal-dark)] disabled:opacity-60"
            >
              {status === "loading" ? "Adding…" : "Add Room"}
            </button>
            <Link
              href="/rooms"
              className="rounded-full border border-[var(--sn-border)] bg-white/70 px-6 py-2.5 text-sm font-medium text-[var(--sn-ink)] transition hover:bg-white"
            >
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </RequireAuth>
  );
}
