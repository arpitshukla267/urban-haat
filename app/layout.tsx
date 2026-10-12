import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const sans = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Urban Haat",
  description: "Your neighbourhood market, now a tap away.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sans.variable}>
      <body className="overflow-x-hidden font-[family-name:var(--font-sans)] text-stone-900 antialiased">
        {children}
      </body>
    </html>
  );
}