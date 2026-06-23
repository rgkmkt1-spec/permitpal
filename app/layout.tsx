import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PermitPal — Know Your Permits Before You Build",
  description: "Get a municipality-specific permit checklist, cost estimates, and inspector tips for your home renovation project in under 60 seconds.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}