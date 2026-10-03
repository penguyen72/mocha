import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat, Parisienne } from "next/font/google";

import "./globals.css";

// Three faces, one per role: Parisienne for every script flourish, Cormorant Garamond for the
// elegant serif display and labels, Montserrat for small caps controls, numerals and form text.
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-montserrat",
  display: "swap",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-cormorant-garamond",
  display: "swap",
});

const parisienne = Parisienne({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-parisienne",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Save the Date — Peyton & Liane",
  description:
    "Peyton and Liane are getting married. October 16, 2027, in Trenton, Georgia. Formal invitation to follow.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${cormorantGaramond.variable} ${parisienne.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
