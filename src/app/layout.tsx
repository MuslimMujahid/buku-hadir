import type { Metadata, Viewport } from "next";
import { Fraunces, IBM_Plex_Mono, Karla } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
});

const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Buku Hadir — Catatan Kehadiran Kelas",
    template: "%s · Buku Hadir",
  },
  description:
    "Aplikasi absensi kelas untuk guru: kelola kelas dan siswa, catat kehadiran harian, dan lihat rekap bulanan.",
};

export const viewport: Viewport = {
  themeColor: "#f7f3ea",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${fraunces.variable} ${karla.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
