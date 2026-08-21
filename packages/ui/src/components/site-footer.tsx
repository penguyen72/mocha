import type { ReactNode } from "react";

export type SiteFooterProps = {
  heading: ReactNode;
  subline: ReactNode;
  tagline: ReactNode;
};

export function SiteFooter({ heading, subline, tagline }: SiteFooterProps) {
  return (
    <footer className="bg-inverted-background px-6 py-20 text-center text-inverted-foreground">
      <p className="font-serif text-5xl sm:text-6xl">{heading}</p>
      <p className="mt-5 text-xs uppercase tracking-[0.28em] opacity-60">{subline}</p>
      <p className="mt-7 text-xs tracking-[0.1em] opacity-40">{tagline}</p>
    </footer>
  );
}
