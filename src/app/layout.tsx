export const instant = false
import type { Metadata } from "next";
import { connection } from "next/server";
import { Geist, Geist_Mono, Inter, Roboto_Slab } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { getSiteBrandParts } from "@/lib/events";

import { Luckiest_Guy, Roboto } from 'next/font/google'
import { cn } from "@/lib/utils";

const robotoSlabHeading = Roboto_Slab({subsets:['latin'],variable:'--font-heading'});

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

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
  await connection()

  const { eventName, brand } = await getSiteBrandParts();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  return {
    ...(appUrl ? { metadataBase: new URL(appUrl) } : {}),
    title: {
      default: brand,
      template: `%s | ${brand}`,
    },
    description: `Tekmovanje v pitju — ${eventName}. Pokal Šanka.`,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await connection();

  return (
    <html lang="sl" style={{ colorScheme: "light" }} className={cn("font-sans", inter.variable, robotoSlabHeading.variable)}>
      <body
        className={`${roboto.variable} ${lucky.variable} antialiased`}
        style={{ colorScheme: "light" }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
