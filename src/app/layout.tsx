import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

import { Luckiest_Guy, Roboto } from 'next/font/google'
 
const lucky = Luckiest_Guy({
  weight: ["400"],
  subsets: ["latin"],
  variable: '--font-lucky',
})

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: '--font-roboto',
})

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pokal Šanka — Matija 2025 Edition2025",
  description: "Tekmovanje v pitju piva - Pokal Šanka — Matija 2025 Edition2025",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sl" className="dark">
      <body
        className={`${roboto.variable} ${lucky.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
