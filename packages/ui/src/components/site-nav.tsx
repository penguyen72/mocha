"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

import { Button } from "./ui/button";
import { cn } from "../lib/utils";

export type SiteLink = { label: string; href: string };
export type SiteNavLink = SiteLink;

export type SiteNavProps = {
  brand: ReactNode;
  links: SiteNavLink[];
  cta: SiteNavLink;
  scrollThreshold?: number;
  mobileBreakpoint?: number;
};

export function SiteNav({
  brand,
  links,
  cta,
  scrollThreshold = 0.7,
  mobileBreakpoint = 860,
}: SiteNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * scrollThreshold);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [scrollThreshold]);

  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${mobileBreakpoint}px)`);
    const onChange = () => setIsMobile(query.matches);
    onChange();
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [mobileBreakpoint]);

  const closeMobile = () => setMobileOpen(false);
  const ctaClassName = scrolled
    ? "bg-primary text-primary-foreground"
    : "bg-white text-foreground hover:bg-white/90";

  return (
    <nav
      className={cn(
        "fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 transition-colors duration-300 sm:px-12",
        scrolled
          ? "bg-background/94 py-4 text-foreground shadow-md backdrop-blur-md"
          : "bg-transparent py-[22px] text-white",
      )}
    >
      <a href="#home" className="font-serif text-2xl tracking-widest">
        {brand}
      </a>

      {!isMobile && (
        <div className="flex items-center gap-8">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="text-sm uppercase tracking-widest">
              {link.label}
            </a>
          ))}
          <Button asChild size="sm" className={ctaClassName}>
            <a href={cta.href}>{cta.label}</a>
          </Button>
        </div>
      )}

      {isMobile && (
        <button
          type="button"
          aria-label="Menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
          className="flex flex-col gap-1.5 p-1.5"
        >
          <span className="block h-0.5 w-6 bg-current" />
          <span className="block h-0.5 w-6 bg-current" />
          <span className="block h-0.5 w-6 bg-current" />
        </button>
      )}

      <AnimatePresence>
        {isMobile && mobileOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="absolute inset-x-0 top-full flex flex-col gap-4 overflow-hidden bg-background px-8 py-6 text-foreground shadow-lg"
          >
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={closeMobile}
                className="text-sm uppercase tracking-widest"
              >
                {link.label}
              </a>
            ))}
            <a
              href={cta.href}
              onClick={closeMobile}
              className="text-sm uppercase tracking-widest text-primary"
            >
              {cta.label}
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
