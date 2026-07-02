import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PermitPal — Know Your Permits & Project Costs Before You Build",
  description: "Get a municipality-specific permit checklist, cost estimates, inspector tips, and full material cost breakdown in under 60 seconds.",
  openGraph: {
    title: "PermitPal — Know Your Permits & Project Costs Before You Build",
    description: "Get a municipality-specific permit checklist, cost estimates, and full material cost breakdown in 60 seconds. First report free.",
    url: "https://permitpalapp.com",
    siteName: "PermitPal",
    images: [
      {
        url: "https://permitpalapp.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "PermitPal — Know Your Permits and Project Costs",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PermitPal — Know Your Permits & Project Costs",
    description: "Municipality-specific permit checklist + full cost estimate in 60 seconds.",
    images: ["https://permitpalapp.com/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}