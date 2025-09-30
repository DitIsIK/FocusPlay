import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: "FocusPlay — Minder doom. Meer doén.",
  description: "Scroll slim, niet dom. Micro-challenges met vrienden, XP en streaks.",
  robots: {
    index: false,
    follow: false
  },
  openGraph: {
    title: "FocusPlay",
    description: "Minder doom. Meer doén.",
    type: "website"
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="nl" className="dark">
      <body className={`${inter.className} bg-background text-foreground`}>{children}</body>
    </html>
  );
}
