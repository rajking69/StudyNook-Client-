import Link from "next/link";

const socialLinks = [
  {
    name: "Facebook",
    href: "https://facebook.com",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <path
          fill="currentColor"
          d="M13 9V7.2c0-.9.6-1.1 1-1.1h1.8V3.1C15.5 3 14.6 3 13.4 3 10.9 3 9 4.5 9 7.2V9H7v3h2v9h4v-9h2.7l.4-3H13z"
        />
      </svg>
    ),
  },
  {
    name: "X",
    href: "https://x.com",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <path
          fill="currentColor"
          d="M4 4h3.9l4.3 6.1L17.3 4H20l-6.2 8.6L20.5 20h-3.9l-4.8-6.6L6.4 20H4l6.6-9.1L4 4z"
        />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <path
          fill="currentColor"
          d="M4 8.5h3.7V20H4V8.5zM5.9 4a2.1 2.1 0 1 1 0 4.2A2.1 2.1 0 0 1 5.9 4zm5.2 4.5h3.6v1.6h.1c.5-.9 1.8-1.9 3.7-1.9 3.9 0 4.6 2.5 4.6 5.8V20H19v-4.9c0-1.2 0-2.8-1.8-2.8-1.8 0-2 1.3-2 2.7V20h-4.1V8.5z"
        />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <path
          fill="currentColor"
          d="M16.8 3H7.2A4.2 4.2 0 0 0 3 7.2v9.6A4.2 4.2 0 0 0 7.2 21h9.6a4.2 4.2 0 0 0 4.2-4.2V7.2A4.2 4.2 0 0 0 16.8 3zm2.3 13.8a2.3 2.3 0 0 1-2.3 2.3H7.2a2.3 2.3 0 0 1-2.3-2.3V7.2a2.3 2.3 0 0 1 2.3-2.3h9.6a2.3 2.3 0 0 1 2.3 2.3v9.6z"
        />
        <path
          fill="currentColor"
          d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 6.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zM17.4 6.1a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"
        />
      </svg>
    ),
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--sn-border)] bg-white/70">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <p className="heading-font text-xl">StudyNook</p>
          <p className="text-sm text-soft">
            A calm, modern booking system for campus libraries and focused students.
          </p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="heading-font text-base">Useful Links</p>
          <Link href="/" className="block hover:text-[var(--sn-teal)]">
            Home
          </Link>
          <Link href="/rooms" className="block hover:text-[var(--sn-teal)]">
            Rooms
          </Link>
          <Link href="/about" className="block hover:text-[var(--sn-teal)]">
            About
          </Link>
        </div>
        <div className="space-y-2 text-sm">
          <p className="heading-font text-base">Contact</p>
          <p className="text-soft">hello@studynook.com</p>
          <p className="text-soft">+1 (555) 218-4579</p>
        </div>
        <div className="space-y-3 text-sm">
          <p className="heading-font text-base">Follow</p>
          <div className="flex items-center gap-3">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                aria-label={link.name}
                className="rounded-full border border-[var(--sn-border)] bg-white p-2 text-[var(--sn-ink)] transition hover:-translate-y-0.5 hover:text-[var(--sn-teal)]"
                target="_blank"
                rel="noreferrer"
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--sn-border)] px-6 py-4 text-center text-xs text-soft">
        © {year} StudyNook. All rights reserved.
      </div>
    </footer>
  );
}
