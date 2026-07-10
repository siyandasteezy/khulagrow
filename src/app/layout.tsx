import type { Metadata, Viewport } from "next";
import { Geist, Fraunces } from "next/font/google";
import { SWRegister } from "@/components/SWRegister";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Editorial display serif for headlines — pairs with Geist for UI/body.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const SITE_URL = process.env.APP_URL ?? "https://khulagrow.smartpick.co.za";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "KhulaGrow — Cannabis Cultivation Management",
    template: "%s · KhulaGrow",
  },
  description:
    "Seed-to-harvest traceability, SAHPRA compliance and farm management for licensed cannabis cultivators.",
  applicationName: "KhulaGrow",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KhulaGrow",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#215c24",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${fraunces.variable} antialiased`}>
        {children}
        <SWRegister />
      </body>
    </html>
  );
}
