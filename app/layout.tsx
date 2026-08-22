import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Delhi Service Network | Delhi NCR Doorstep Services",
  description:
    "Book Delhi NCR doorstep services, onboard verified vendors, track leads, and receive customer queries by email.",
  openGraph: {
    title: "Delhi Service Network | Delhi NCR Doorstep Services",
    description:
      "A launch-ready local services lead platform with booking, vendor onboarding, admin tracking, and email alerts.",
    images: ["/hero-service-network.png"],
  },
  icons: {
    icon: "/logo-dsn.svg",
    shortcut: "/logo-dsn.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
