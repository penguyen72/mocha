import { Reveal } from "@mocha/ui";

import { PARTY_EYEBROW, PARTY_HEADING, PARTY_INTRO, PARTY_MEMBERS } from "./party-content";

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return `${first}${last}`.toUpperCase();
}

const STAGGER_STEP = 0.085;
const STAGGER_COLUMNS = 4;

export function Party() {
  return (
    <section id="party" className="bg-bb-blush px-6 py-24 sm:px-12">
      <div className="mx-auto max-w-2xl text-center">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.28em] text-bb-clay">{PARTY_EYEBROW}</p>
        </Reveal>
        <Reveal>
          <h2 className="mt-3 font-serif text-4xl sm:text-5xl">{PARTY_HEADING}</h2>
        </Reveal>
        <Reveal>
          <p className="mt-6 text-base text-muted">{PARTY_INTRO}</p>
        </Reveal>
      </div>

      <div className="mx-auto mt-16 grid max-w-5xl grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
        {PARTY_MEMBERS.map((member, index) => (
          <Reveal key={member.name} delay={(index % STAGGER_COLUMNS) * STAGGER_STEP}>
            <article aria-label={member.name} className="text-center">
              <div className="mx-auto flex aspect-[3/4] w-full max-w-[180px] items-center justify-center rounded-2xl bg-bb-peach">
                <span className="font-serif text-4xl text-bb-clay">{initialsFor(member.name)}</span>
              </div>
              <p className="mt-4 font-serif text-xl">{member.name}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-bb-clay">{member.role}</p>
              <p className="mt-1 font-serif text-sm italic text-muted">For {member.for}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
