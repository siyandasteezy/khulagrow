import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { SWRegister } from "@/components/SWRegister";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KhulaGrow — Cannabis Cultivation Management",
  description:
    "Seed-to-harvest traceability, SAHPRA compliance and farm management for licensed cannabis cultivators.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KhulaGrow",
  },
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
      <body className={`${geistSans.variable} antialiased`}>
        {children}
        <SWRegister />
      </body>
    </html>
  );
}
