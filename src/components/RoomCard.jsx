"use client";

import Link from "next/link";
import { motion } from "framer-motion";

function truncate(str, max = 100) {
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

export default function RoomCard({ room, index = 0 }) {
  const name        = room?.name        || room?.roomName    || "Study Room";
  const description = truncate(room?.description || room?.summary);
  const floor       = room?.location    || room?.floor       || "Main Floor";
  const capacity    = room?.capacityMin && room?.capacityMax
                    ? `${room.capacityMin}–${room.capacityMax} people`
                    : room?.capacity ? `${room.capacity} people` : "Flexible";
  const price       = (room?.pricePerHour || room?.hourlyRate)
                    ? `$${room.pricePerHour || room.hourlyRate}/hr`
                    : "Free";
  const amenities   = Array.isArray(room?.amenities) ? room.amenities
                    : Array.isArray(room?.features)  ? room.features
                    : [];
  const shown       = amenities.slice(0, 3);
  const extra       = amenities.length - shown.length;
  const image       = room?.image || null;
  const id          = room?._id != null ? String(room._id) : room?.id != null ? String(room.id) : "";
  const cover       = FALLBACK_COVERS[index % FALLBACK_COVERS.length];

  return (
    <motion.div
      className="room-card group flex h-full flex-col rounded-3xl overflow-hidden"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
    >
      <div
        className="relative h-48 w-full shrink-0 overflow-hidden"
        style={image
          ? { backgroundImage: `url(${image})`, backgroundSize: "cover", backgroundPosition: "center" }
          : { background: cover }}
      >
        <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/15" />
        <div className="card-shimmer absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      <div className="flex flex-1 flex-col p-5 bg-[var(--sn-card)]/90 backdrop-blur-md border border-t-0 border-[var(--sn-border)] rounded-b-3xl">
        <h3 className="heading-font text-lg font-semibold leading-snug text-[var(--sn-ink)]">{name}</h3>

        <p className="mt-1.5 text-xs leading-relaxed text-soft line-clamp-2">{description}</p>

        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
          <div className="flex flex-col gap-0.5 rounded-xl bg-[rgba(15,118,110,0.06)] border border-[rgba(15,118,110,0.12)] px-2.5 py-2">
            <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-soft">Floor</span>
            <span className="font-semibold text-[var(--sn-ink)] truncate">{floor}</span>
          </div>
          <div className="flex flex-col gap-0.5 rounded-xl bg-[var(--sn-amber-soft)] border border-[rgba(249,115,22,0.15)] px-2.5 py-2">
            <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-soft">Seats</span>
            <span className="font-semibold text-[var(--sn-ink)] truncate">{capacity}</span>
          </div>
          <div className="flex flex-col gap-0.5 rounded-xl bg-[rgba(14,165,233,0.07)] border border-[rgba(14,165,233,0.15)] px-2.5 py-2">
            <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-soft">Rate</span>
            <span className="font-semibold text-[var(--sn-teal)] truncate">{price}</span>
          </div>
        </div>

        {amenities.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {shown.map((a) => (
              <span key={a} className="inline-flex items-center rounded-full bg-[rgba(15,118,110,0.08)] border border-[rgba(15,118,110,0.2)] px-2.5 py-0.5 text-[10px] font-medium text-[var(--sn-teal)]">
                {a}
              </span>
            ))}
            {extra > 0 && (
              <span className="inline-flex items-center rounded-full border border-[var(--sn-border)] bg-[var(--sn-card)] px-2.5 py-0.5 text-[10px] font-semibold text-soft">
                +{extra} more
              </span>
            )}
          </div>
        )}

        <div className="mt-auto pt-4">
          <Link
            href={id ? `/rooms/${id}` : "/rooms"}
            className="view-details-btn group/btn relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300"
          >
            <span className="relative z-10">View Details</span>
            <svg className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
