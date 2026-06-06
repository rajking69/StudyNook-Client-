import Link from "next/link";

export const metadata = {
  title: "StudyNook – Page Not Found",
};

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center px-6 py-20 text-center">
      <p className="text-6xl font-semibold text-[var(--sn-teal)]">404</p>
      <h1 className="heading-font mt-4 text-3xl">Page not found</h1>
      <p className="mt-3 max-w-md text-sm text-soft">
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-full bg-[var(--sn-teal)] px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--sn-teal-dark)]"
      >
        Back to Home
      </Link>
    </section>
  );
}
