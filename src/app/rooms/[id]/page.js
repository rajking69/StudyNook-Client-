"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api, { getErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/lib/ToastContext";

const AMENITY_OPTIONS = ["Whiteboard", "Projector", "Wi-Fi", "Power Outlets", "Quiet Zone", "Air Conditioning"];
const TIME_SLOTS = Array.from({ length: 13 }, (_, i) => ({ value: i + 8, label: `${String(i + 8).padStart(2, "0")}:00` }));
const todayStr = () => new Date().toISOString().split("T")[0];

function XIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );
}

function ModalShell({ title, subtitle, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="glass-card w-full max-w-md rounded-3xl p-8 space-y-5 animate-fade-up my-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="heading-font text-2xl">{title}</h2>
            {subtitle && <p className="text-sm text-soft mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-[var(--sn-border)] transition"><XIcon /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function BookingModal({ room, onClose, onBooked }) {
  const toast = useToast();
  const [date, setDate] = useState(todayStr());
  const [startHour, setStart] = useState(8);
  const [endHour, setEnd] = useState(9);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const rate = room?.pricePerHour || room?.hourlyRate || 0;
  const duration = endHour - startHour;
  const total = duration * rate;
  const endSlots = TIME_SLOTS.filter((s) => s.value > startHour);

  const handleStart = (h) => { setStart(h); if (endHour <= h) setEnd(h + 1); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setStatus("loading");
    const startAt = new Date(`${date}T${String(startHour).padStart(2, "0")}:00:00`).toISOString();
    const endAt = new Date(`${date}T${String(endHour).padStart(2, "0")}:00:00`).toISOString();
    try {
      await api.post("/api/bookings", { roomId: room._id, startAt, endAt, purpose: note });
      toast("Room booked successfully!");
      onBooked(); onClose();
    } catch (err) {
      setError(getErrorMessage(err, "Booking failed. Try a different slot."));
      setStatus("idle");
    }
  };

  return (
    <ModalShell title="Book Room" subtitle={room.name || room.roomName || "Study Room"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-soft mb-1.5">Date *</label>
          <input type="date" value={date} min={todayStr()} onChange={(e) => setDate(e.target.value)} required className="input input-bordered w-full bg-white" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-soft mb-1.5">Start *</label>
            <select value={startHour} onChange={(e) => handleStart(Number(e.target.value))} className="select select-bordered w-full bg-white">
              {TIME_SLOTS.slice(0, -1).map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-soft mb-1.5">End *</label>
            <select value={endHour} onChange={(e) => setEnd(Number(e.target.value))} className="select select-bordered w-full bg-white">
              {endSlots.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--sn-border)] bg-[var(--sn-amber-soft)] px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-soft">{duration}h {rate > 0 ? `× $${rate}/hr` : ""}</span>
          <span className="heading-font text-lg">{rate > 0 ? `$${total.toFixed(2)}` : "Free"}</span>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-soft mb-1.5">Special Note (optional)</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="e.g. Group project, quiet study…" className="textarea textarea-bordered w-full bg-white" />
        </div>
        {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={status === "loading"} className="flex-1 rounded-full bg-[var(--sn-teal)] py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--sn-teal-dark)] disabled:opacity-60 transition">
            {status === "loading" ? "Booking…" : "Confirm Booking"}
          </button>
          <button type="button" onClick={onClose} className="rounded-full border border-[var(--sn-border)] bg-white px-5 py-2.5 text-sm font-medium hover:bg-[var(--sn-border)] transition">Cancel</button>
        </div>
      </form>
    </ModalShell>
  );
}

function EditModal({ room, onClose, onUpdated }) {
  const toast = useToast();
  const [form, setForm] = useState({
    name: room.name || room.roomName || "",
    description: room.description || "",
    image: room.image || "",
    location: room.location || room.floor || "",
    capacity: room.capacity || "",
    pricePerHour: room.pricePerHour ?? room.hourlyRate ?? "",
    amenities: Array.isArray(room.amenities) ? room.amenities : [],
  });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const ch = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const tog = (a) => setForm((p) => ({ ...p, amenities: p.amenities.includes(a) ? p.amenities.filter(x => x !== a) : [...p.amenities, a] }));
  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setStatus("loading");
    try {
      await api.put(`/api/rooms/${room._id}`, { ...form, capacity: form.capacity ? Number(form.capacity) : null, pricePerHour: form.pricePerHour ? Number(form.pricePerHour) : null });
      toast("Room updated successfully"); onUpdated(); onClose();
    } catch (err) { setError(getErrorMessage(err, "Update failed.")); setStatus("idle"); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="glass-card w-full max-w-xl rounded-3xl p-8 space-y-4 animate-fade-up my-8">
        <div className="flex items-center justify-between">
          <h2 className="heading-font text-2xl">Edit Room</h2>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-[var(--sn-border)] transition"><XIcon /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-xs font-semibold uppercase tracking-[0.15em] text-soft mb-1.5">Room Name *</label><input name="name" value={form.name} onChange={ch} required className="input input-bordered w-full bg-white" /></div>
          <div><label className="block text-xs font-semibold uppercase tracking-[0.15em] text-soft mb-1.5">Description *</label><textarea name="description" value={form.description} onChange={ch} required rows={3} className="textarea textarea-bordered w-full bg-white" /></div>
          <div><label className="block text-xs font-semibold uppercase tracking-[0.15em] text-soft mb-1.5">Image URL</label><input name="image" value={form.image} onChange={ch} className="input input-bordered w-full bg-white" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold uppercase tracking-[0.15em] text-soft mb-1.5">Location *</label><input name="location" value={form.location} onChange={ch} required className="input input-bordered w-full bg-white" /></div>
            <div><label className="block text-xs font-semibold uppercase tracking-[0.15em] text-soft mb-1.5">Capacity</label><input name="capacity" value={form.capacity} onChange={ch} type="number" min={1} className="input input-bordered w-full bg-white" /></div>
            <div><label className="block text-xs font-semibold uppercase tracking-[0.15em] text-soft mb-1.5">Rate ($/hr)</label><input name="pricePerHour" value={form.pricePerHour} onChange={ch} type="number" min={0} step="0.01" className="input input-bordered w-full bg-white" /></div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-soft mb-2">Amenities</label>
            <div className="flex flex-wrap gap-2">
              {AMENITY_OPTIONS.map((a) => { const on = form.amenities.includes(a); return (<button key={a} type="button" onClick={() => tog(a)} className={`rounded-full border px-3 py-1 text-xs font-medium transition ${on ? "border-[var(--sn-teal)] bg-[rgba(15,118,110,0.10)] text-[var(--sn-teal)]" : "border-[var(--sn-border)] bg-white text-[var(--sn-ink)] hover:border-[var(--sn-teal)]"}`}>{on ? "✓ " : ""}{a}</button>); })}
            </div>
          </div>
          {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={status === "loading"} className="flex-1 rounded-full bg-[var(--sn-teal)] py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--sn-teal-dark)] disabled:opacity-60 transition">{status === "loading" ? "Saving…" : "Save Changes"}</button>
            <button type="button" onClick={onClose} className="rounded-full border border-[var(--sn-border)] bg-white px-5 py-2.5 text-sm font-medium hover:bg-[var(--sn-border)] transition">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ roomName, onClose, onConfirm, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="glass-card w-full max-w-sm rounded-3xl p-8 space-y-5 animate-fade-up text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
          <svg className="h-7 w-7 text-red-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
        </div>
        <div><h2 className="heading-font text-xl">Delete Room?</h2><p className="mt-1 text-sm text-soft"><strong>{roomName}</strong> will be permanently removed.</p></div>
        <div className="flex gap-3">
          <button onClick={onConfirm} disabled={loading} className="flex-1 rounded-full bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 transition">{loading ? "Deleting…" : "Yes, Delete"}</button>
          <button onClick={onClose} className="flex-1 rounded-full border border-[var(--sn-border)] bg-white py-2.5 text-sm font-medium hover:bg-[var(--sn-border)] transition">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function RoomDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();

  const [room, setRoom] = useState(null);
  const [status, setStatus] = useState("loading");
  const [loadError, setLoadError] = useState("");
  const [showBook, setShowBook] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadRoom = useCallback(() => {
    setStatus("loading");
    setLoadError("");
    api
      .get(`/api/rooms/${id}`)
      .then((r) => {
        setRoom(r.data);
        setStatus("ok");
      })
      .catch((err) => {
        setRoom(null);
        setLoadError(
          getErrorMessage(err, "Room not found or could not load.")
        );
        setStatus("error");
      });
  }, [id]);

  useEffect(() => {
    loadRoom();
  }, [loadRoom]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/api/rooms/${id}`);
      toast("Room deleted successfully");
      router.push("/rooms");
    } catch (err) {
      toast(getErrorMessage(err, "Delete failed."), "error");
      setDeleting(false); setShowDelete(false);
    }
  };

  const isOwner =
    user &&
    room &&
    String(user.id || user._id || "") === String(room.createdBy || "");

  if (status === "loading") return (
    <section className="mx-auto w-full max-w-4xl px-6 py-16">
      <div className="glass-card rounded-3xl p-8 animate-pulse space-y-4">
        <div className="h-64 rounded-2xl bg-[var(--sn-border)]" />
        <div className="h-6 w-1/2 rounded-full bg-[var(--sn-border)]" />
        <div className="h-4 w-3/4 rounded-full bg-[var(--sn-border)]" />
      </div>
    </section>
  );

  if (status === "error" || !room) return (
    <section className="mx-auto w-full max-w-4xl px-6 py-16 space-y-4">
      <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-700">
        {loadError || "Room not found or an error occurred."}
      </div>
      <Link href="/rooms" className="inline-flex rounded-full border border-[var(--sn-border)] bg-white px-5 py-2 text-sm font-medium hover:bg-[var(--sn-border)]">← Back to Rooms</Link>
    </section>
  );

  const amenities = Array.isArray(room.amenities) ? room.amenities : Array.isArray(room.features) ? room.features : [];
  const price = (room.pricePerHour || room.hourlyRate) ? `$${room.pricePerHour || room.hourlyRate}/hr` : "Free";
  const capacity = room.capacity ? `${room.capacity} people` : "Flexible";
  const roomName = room.name || room.roomName || "Study Room";
  const bookingCount = room.bookingCount ?? 0;

  const handleBookClick = () => {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(`/rooms/${id}`)}`);
      return;
    }
    setShowBook(true);
  };

  return (
    <>
      {showBook && <BookingModal room={room} onClose={() => setShowBook(false)} onBooked={loadRoom} />}
      {showEdit && <EditModal room={room} onClose={() => setShowEdit(false)} onUpdated={loadRoom} />}
      {showDelete && <DeleteConfirmModal roomName={roomName} onClose={() => setShowDelete(false)} onConfirm={handleDelete} loading={deleting} />}

      <section className="mx-auto w-full max-w-4xl px-6 py-12">
        <Link href="/rooms" className="inline-flex items-center gap-1.5 text-sm text-soft hover:text-[var(--sn-teal)] mb-6 transition">
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
          Back to All Rooms
        </Link>

        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="relative h-72 w-full bg-gradient-to-br from-[var(--sn-teal)] to-[var(--sn-teal-dark)]"
            style={room.image ? { backgroundImage: `url(${room.image})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between">
              <div>
                <span className="rounded-full bg-white/20 border border-white/30 backdrop-blur-sm px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white">{room.location || room.floor || "Main Floor"}</span>
                <h1 className="heading-font mt-2 text-3xl font-semibold text-white drop-shadow">{roomName}</h1>
              </div>
              <span className="rounded-full bg-white/20 border border-white/30 backdrop-blur-sm px-4 py-1.5 text-sm font-bold text-white">{price}</span>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 rounded-full border border-[var(--sn-border)] bg-[var(--sn-amber-soft)] px-4 py-1.5 text-sm font-medium">
                <svg className="h-4 w-4 text-[var(--sn-amber)]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a4 4 0 00-4-4H8a4 4 0 00-4 4v1h12z" /></svg>
                {capacity}
              </div>
              <div className="flex items-center gap-2 rounded-full border border-[var(--sn-border)] bg-white px-4 py-1.5 text-sm font-medium">
                <svg className="h-4 w-4 text-[var(--sn-teal)]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>
                {bookingCount} booking{bookingCount !== 1 ? "s" : ""}
              </div>
            </div>

            {room.description && <p className="text-sm leading-relaxed text-soft max-w-2xl">{room.description}</p>}

            {amenities.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-soft mb-3">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((a) => (
                    <span key={a} className="inline-flex items-center rounded-full bg-[rgba(15,118,110,0.08)] border border-[rgba(15,118,110,0.2)] px-3 py-1 text-xs font-medium text-[var(--sn-teal)]">{a}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-2 border-t border-[var(--sn-border)]">
              <button onClick={handleBookClick} className="rounded-full bg-[var(--sn-teal)] px-7 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--sn-teal-dark)] hover:shadow-md transition">
                {user ? "Book Now" : "Login to Book"}
              </button>
              {isOwner && (
                <>
                  <button onClick={() => setShowEdit(true)} className="rounded-full border border-[var(--sn-border)] bg-white px-6 py-2.5 text-sm font-medium hover:bg-[var(--sn-border)] transition">✏️ Edit</button>
                  <button onClick={() => setShowDelete(true)} className="rounded-full border border-red-200 bg-red-50 px-6 py-2.5 text-sm font-medium text-red-600 hover:bg-red-100 transition">🗑 Delete</button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
