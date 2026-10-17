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
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={sans.variable}>
      <head>
        <link rel="preconnect" href="https://www.instagram.com" />
        <link
          rel="preload"
          href="/background.webp"
          as="image"
          type="image/webp"
          // @ts-expect-error fetchPriority is supported in HTML
          fetchpriority="high"
        />
        <link rel="preload" href="/logo.webp" as="image" type="image/webp" />
      </head>
      <body className="overflow-x-hidden font-[family-name:var(--font-sans)] text-stone-900 antialiased">
        {children}
      </body>
    </html>
  );
}
