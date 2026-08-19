import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Blackberry — Liane & Peyton",
  description: "The friends wedding website for Liane and Peyton.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
