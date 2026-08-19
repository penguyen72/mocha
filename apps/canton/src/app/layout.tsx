import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Canton — Liane & Peyton",
  description: "The family wedding website for Liane and Peyton.",
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
