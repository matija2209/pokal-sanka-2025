import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { getSiteBrandParts } from "@/lib/events";

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

export async function generateMetadata(): Promise<Metadata> {
  const { eventName, brand } = await getSiteBrandParts();
  return {
    title: {
      default: brand,
      template: `%s | ${brand}`,
    },
    description: `Tekmovanje v pitju — ${eventName}. Pokal Šanka.`,
  };
}

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
