"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import ProfileMenu from "@/components/ProfileMenu";
import ThemeToggle from "@/components/ThemeToggle";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/rooms", label: "Rooms" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onDocClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <header
      className="sticky top-0 z-30 border-b border-[var(--sn-border)] bg-[var(--sn-bg)]/90 backdrop-blur-md"
      ref={menuRef}
    >
      <nav
        className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6"
      >

        <div className="flex items-center gap-4">
          <Link href="/" className="heading-font flex items-center gap-2 text-xl font-semibold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--sn-teal)] text-white shadow-sm text-sm">
              📚
            </span>
            <span className="text-[var(--sn-ink)]">Study</span>
            <span className="text-[var(--sn-teal)]">Nook</span>
          </Link>
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-[var(--sn-border)] bg-white/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--sn-teal)]">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[var(--sn-teal)] animate-pulse-dot" />
            Live
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${pathname === link.href ? "bg-[rgba(15,118,110,0.09)] text-[var(--sn-teal)]" : ""}`}
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <>
              <Link
                href="/my-listings"
                className={`nav-link ${pathname === "/my-listings" ? "bg-[rgba(15,118,110,0.09)] text-[var(--sn-teal)]" : ""}`}
              >
                My Listings
              </Link>
              <Link
                href="/my-bookings"
                className={`nav-link ${pathname === "/my-bookings" ? "bg-[rgba(15,118,110,0.09)] text-[var(--sn-teal)]" : ""}`}
              >
                My Bookings
              </Link>
              <Link
                href="/add-room"
                className={`nav-link ${pathname === "/add-room" ? "bg-[rgba(15,118,110,0.09)] text-[var(--sn-teal)]" : ""}`}
              >
                Add Room
              </Link>
            </>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <ProfileMenu />
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full border border-[var(--sn-border)] bg-white/70 px-4 py-1.5 text-sm font-medium text-[var(--sn-ink)] transition hover:bg-white hover:shadow-sm"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-[var(--sn-teal)] px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--sn-teal-dark)] hover:shadow-md"
              >
                Register
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 sm:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--sn-border)] bg-white/80 text-[var(--sn-ink)] shadow-sm transition hover:bg-white ring-soft"
          >
            {menuOpen ? (
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M3 5.5A1.5 1.5 0 014.5 4h11a1.5 1.5 0 010 3h-11A1.5 1.5 0 013 5.5zm0 4A1.5 1.5 0 014.5 8h11a1.5 1.5 0 010 3h-11A1.5 1.5 0 013 9.5zm1.5 4.5a1.5 1.5 0 000 3h11a1.5 1.5 0 000-3h-11z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="sm:hidden border-t border-[var(--sn-border)] bg-[var(--sn-bg)]/95 backdrop-blur-md">
          <div className="mx-auto w-full max-w-6xl px-4 py-4">
            <div className="glass-card rounded-3xl p-4 space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`nav-link ${pathname === link.href ? "bg-[rgba(15,118,110,0.09)] text-[var(--sn-teal)]" : ""}`}
                  >
                    {link.label}
                  </Link>
                ))}
                {user && (
                  <>
                    <Link
                      href="/my-listings"
                      className={`nav-link ${pathname === "/my-listings" ? "bg-[rgba(15,118,110,0.09)] text-[var(--sn-teal)]" : ""}`}
                    >
                      My Listings
                    </Link>
                    <Link
                      href="/my-bookings"
                      className={`nav-link ${pathname === "/my-bookings" ? "bg-[rgba(15,118,110,0.09)] text-[var(--sn-teal)]" : ""}`}
                    >
                      My Bookings
                    </Link>
                    <Link
                      href="/add-room"
                      className={`nav-link ${pathname === "/add-room" ? "bg-[rgba(15,118,110,0.09)] text-[var(--sn-teal)]" : ""}`}
                    >
                      Add Room
                    </Link>
                  </>
                )}
              </div>

              {user ? (
                <Link
                  href="/dashboard"
                  className="inline-flex rounded-full border border-[var(--sn-border)] bg-white/80 px-4 py-2 text-sm font-medium text-[var(--sn-ink)] transition hover:bg-white"
                >
                  Dashboard
                </Link>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/login"
                    className="rounded-full border border-[var(--sn-border)] bg-white/80 px-4 py-2 text-sm font-medium text-[var(--sn-ink)] transition hover:bg-white"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-full bg-[var(--sn-teal)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--sn-teal-dark)]"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
