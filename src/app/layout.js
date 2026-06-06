import { Space_Grotesk, Source_Sans_3 } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata = {
  title: "StudyNook – Home",
  description:
    "Discover and book private study rooms with real-time availability, conflict-free scheduling, and personalized dashboards.",
};

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("studynook-theme")?.value;
  const initialTheme = themeCookie === "dark" ? "dark" : "light";
  const themeClass = initialTheme === "dark" ? "dark" : "";

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-theme={initialTheme}
      className={`${spaceGrotesk.variable} ${sourceSans.variable} ${themeClass} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full bg-[var(--sn-bg)] text-[var(--sn-ink)] transition-colors duration-300">
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
