import { CountdownStrip, Hero, SiteFooter, SiteNav } from "@mocha/ui";

import { Details } from "@/components/details";
import { Explore } from "@/components/explore";
import { Faq } from "@/components/faq";
import { Party } from "@/components/party";
import { RsvpSection } from "@/components/rsvp-section";
import { Schedule } from "@/components/schedule";
import { Stay } from "@/components/stay";
import { Travel } from "@/components/travel";

import heroPhoto from "@/assets/hero.jpeg";

const NAV_LINKS = [
  { label: "Schedule", href: "#schedule" },
  { label: "Travel", href: "#travel" },
  { label: "Stay", href: "#stay" },
  { label: "Explore", href: "#explore" },
  { label: "Details", href: "#details" },
  { label: "FAQ", href: "#faq" },
];

const RSVP_CTA = { label: "RSVP", href: "#rsvp" };

export default function Home() {
  return (
    <>
      <SiteNav
        brand={
          <>
            L <span className="font-script text-2xl">&amp;</span> P
          </>
        }
        links={NAV_LINKS}
        cta={RSVP_CTA}
      />

      <main>
        <Hero
          eyebrow="together with their families"
          heading={
            <>
              Liane
              <span className="block font-script text-5xl font-normal sm:text-6xl">&amp;</span>
              Peyton
            </>
          }
          dateLabel="Oct 1–3, 2027"
          locationLabel="The Villa at Blackberry Ridge · Trenton, Georgia"
          cta={{ label: "RSVP Now", href: "#rsvp" }}
          backgroundImage={{ src: heroPhoto, alt: "Liane and Peyton" }}
        />

        <CountdownStrip
          tagline="We can't wait to celebrate with you"
          targetDate="2027-10-02T16:00:00-04:00"
        />

        <Schedule />
        <Party />

        <Travel />

        <Stay />

        <Explore />
        <Details />
        <Faq />

        <RsvpSection />
      </main>

      <SiteFooter
        heading={
          <>
            Liane <span className="font-script font-normal">&amp;</span> Peyton
          </>
        }
        subline="October 1–3, 2027 · Trenton, Georgia"
        tagline="Made with love for our favorite people."
      />
    </>
  );
}
