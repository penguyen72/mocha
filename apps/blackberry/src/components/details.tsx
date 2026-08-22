import { Reveal } from "@mocha/ui";

import {
  DETAILS_DRESS_BODY,
  DETAILS_DRESS_EMPHASIS,
  DETAILS_DRESS_EYEBROW,
  DETAILS_DRESS_FOOTNOTE,
  DETAILS_DRESS_HEADING,
  DETAILS_DRESS_SWATCHES,
  DETAILS_REGISTRY_BODY,
  DETAILS_REGISTRY_EYEBROW,
  DETAILS_REGISTRY_HEADING,
  DETAILS_REGISTRY_LINKS,
} from "./details-content";

export function Details() {
  return (
    <section id="details" className="bg-bb-peach px-6 py-24 sm:px-12">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
        <Reveal>
          <div className="h-full rounded-lg bg-surface p-10">
            <p className="text-xs uppercase tracking-[0.28em] text-bb-clay">
              {DETAILS_DRESS_EYEBROW}
            </p>
            <h2 className="mt-3 font-serif text-3xl text-foreground sm:text-4xl">
              {DETAILS_DRESS_HEADING}
            </h2>
            <p className="mt-4 font-serif text-2xl text-foreground">{DETAILS_DRESS_EMPHASIS}</p>
            <p className="mt-4 text-sm text-muted">{DETAILS_DRESS_BODY}</p>
            <div className="mt-6 flex gap-3">
              {DETAILS_DRESS_SWATCHES.map((hex) => (
                <span
                  key={hex}
                  aria-hidden="true"
                  className="size-10 rounded-full border border-border"
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
            <p className="mt-6 font-serif text-sm text-muted italic">{DETAILS_DRESS_FOOTNOTE}</p>
          </div>
        </Reveal>

        <Reveal delay={0.085}>
          <div className="h-full rounded-lg bg-surface p-10">
            <p className="text-xs uppercase tracking-[0.28em] text-bb-clay">
              {DETAILS_REGISTRY_EYEBROW}
            </p>
            <h2 className="mt-3 font-serif text-3xl text-foreground sm:text-4xl">
              {DETAILS_REGISTRY_HEADING}
            </h2>
            <p className="mt-4 text-sm text-muted">{DETAILS_REGISTRY_BODY}</p>
            <ul className="mt-6 divide-y divide-border">
              {DETAILS_REGISTRY_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="flex items-center justify-between py-4 text-sm uppercase tracking-[0.12em] text-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                    <span aria-hidden="true">→</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
