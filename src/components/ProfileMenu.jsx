"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

export default function ProfileMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  if (!user) return null;

  const initials =
    user.name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join("") || "U";

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    router.push("/");
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-[var(--sn-border)] bg-white/80 py-1 pl-1 pr-3 text-sm font-medium text-[var(--sn-ink)] shadow-sm transition hover:bg-white"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt=""
            className="h-8 w-8 rounded-full object-cover border border-[var(--sn-border)]"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--sn-teal)] text-xs font-semibold text-white">
            {initials}
          </span>
        )}
        <span className="max-w-[120px] truncate">{user.name?.split(" ")[0]}</span>
        <svg
          className={`h-4 w-4 text-soft transition ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-52 rounded-2xl border border-[var(--sn-border)] bg-white py-2 shadow-lg"
        >
          <p className="px-4 py-2 text-xs text-soft truncate">{user.email}</p>
          <div className="my-1 border-t border-[var(--sn-border)]" />
          <Link
            href="/dashboard"
            role="menuitem"
            className="block px-4 py-2 text-sm hover:bg-[rgba(15,118,110,0.08)]"
            onClick={() => setOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            href="/my-listings"
            role="menuitem"
            className="block px-4 py-2 text-sm hover:bg-[rgba(15,118,110,0.08)]"
            onClick={() => setOpen(false)}
          >
            My Listings
          </Link>
          <Link
            href="/my-bookings"
            role="menuitem"
            className="block px-4 py-2 text-sm hover:bg-[rgba(15,118,110,0.08)]"
            onClick={() => setOpen(false)}
          >
            My Bookings
          </Link>
          <div className="my-1 border-t border-[var(--sn-border)]" />
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
