import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";

import { Button } from "./ui/button";
import { Reveal } from "./reveal";
import { ScrollCue } from "./scroll-cue";
import type { SiteLink } from "./site-nav";

export type HeroProps = {
  eyebrow: ReactNode;
  heading: ReactNode;
  dateLabel: ReactNode;
  locationLabel: ReactNode;
  cta: SiteLink;
  backgroundImage: { src: StaticImageData; alt: string };
  scrollCueLabel?: string;
};

const STAGGER_BASE_MS = 250;
const STAGGER_STEP_MS = 220;
const delayFor = (index: number) => (STAGGER_BASE_MS + index * STAGGER_STEP_MS) / 1000;
const HERO_MOTION = { trigger: "mount" as const, duration: 1.1, distanceY: 24 };

export function Hero({
  eyebrow,
  heading,
  dateLabel,
  locationLabel,
  cta,
  backgroundImage,
  scrollCueLabel = "Scroll",
}: HeroProps) {
  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden py-24"
    >
      <Image
        src={backgroundImage.src}
        alt={backgroundImage.alt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(color-mix(in srgb, var(--site-foreground) 55%, transparent) 0%, color-mix(in srgb, var(--site-foreground) 34%, transparent) 32%, color-mix(in srgb, var(--site-foreground) 40%, transparent) 66%, color-mix(in srgb, var(--site-foreground) 68%, transparent) 100%)",
        }}
      />

      <div className="relative z-10 px-6 text-center text-white">
        <Reveal {...HERO_MOTION} delay={delayFor(0)}>
          <p className="font-script text-4xl">{eyebrow}</p>
        </Reveal>
        <Reveal {...HERO_MOTION} delay={delayFor(1)}>
          <h1 className="my-2 font-serif text-7xl leading-none sm:text-8xl">{heading}</h1>
        </Reveal>
        <Reveal {...HERO_MOTION} delay={delayFor(2)}>
          <div className="mx-auto mt-6 flex max-w-xl items-center gap-5">
            <span className="h-px flex-1 bg-white/55" />
            <span className="whitespace-nowrap text-sm uppercase tracking-[0.32em]">
              {dateLabel}
            </span>
            <span className="h-px flex-1 bg-white/55" />
          </div>
        </Reveal>
        <Reveal {...HERO_MOTION} delay={delayFor(3)}>
          <p className="mt-4 text-sm uppercase tracking-[0.18em]">{locationLabel}</p>
        </Reveal>
        <Reveal {...HERO_MOTION} delay={delayFor(4)}>
          <Button asChild size="lg" className="mt-10 bg-white text-foreground hover:bg-white/90">
            <a href={cta.href}>{cta.label}</a>
          </Button>
        </Reveal>
      </div>

      <ScrollCue label={scrollCueLabel} />
    </section>
  );
}
