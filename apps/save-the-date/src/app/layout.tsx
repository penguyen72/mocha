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

/**
 * Runs while the HTML is parsed, before the first paint: on a hard load of /#open (a reload,
 * or a link copied after opening) it marks the page so globals.css can hold back the
 * prerendered sealed envelope until React shows the opened invitation in its place.
 */
const OPEN_ON_LOAD_SCRIPT =
  'if(location.hash==="#open")document.documentElement.setAttribute("data-std-open","")';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${cormorantGaramond.variable} ${parisienne.variable}`}
      // The inline script below may add data-std-open before React hydrates.
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: OPEN_ON_LOAD_SCRIPT }} />
        {children}
      </body>
    </html>
  );
}
