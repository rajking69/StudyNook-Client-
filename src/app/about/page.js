export const metadata = {
  title: "StudyNook – About",
  description: "Learn about StudyNook library study room booking.",
};

export default function AboutPage() {
  return (
    <section className="mx-auto w-full max-w-4xl px-6 py-16">
      <div className="glass-card rounded-3xl p-8 sm:p-10 space-y-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--sn-teal)]">
          About StudyNook
        </p>
        <h1 className="heading-font text-3xl sm:text-4xl">
          Quiet rooms. Clear bookings. Less stress.
        </h1>
        <p className="text-sm leading-relaxed text-soft">
          StudyNook helps students and library members list private study rooms,
          browse availability, and reserve time slots without double-booking.
          Room owners manage listings; everyone else books in a few clicks.
        </p>
        <ul className="space-y-2 text-sm text-soft list-disc pl-5">
          <li>Search and filter by floor, amenities, and hourly rate</li>
          <li>Secure sign-in with email/password or Google</li>
          <li>Owner tools to add, edit, and delete listings</li>
          <li>Personal dashboard for bookings and profile</li>
        </ul>
        <p className="text-sm text-soft">
          Questions? Email{" "}
          <a className="text-[var(--sn-teal)] underline" href="mailto:hello@studynook.com">
            hello@studynook.com
          </a>
        </p>
      </div>
    </section>
  );
}
