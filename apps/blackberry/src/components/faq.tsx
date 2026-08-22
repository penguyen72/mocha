import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Reveal } from "@mocha/ui";

import { FAQ_EYEBROW, FAQ_HEADING, FAQ_ITEMS } from "./faq-content";

export function Faq() {
  return (
    <section id="faq" className="bg-background px-6 py-24 sm:px-12">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.28em] text-bb-clay">{FAQ_EYEBROW}</p>
            <h2 className="mt-3 font-serif text-4xl text-foreground sm:text-5xl">{FAQ_HEADING}</h2>
          </div>
        </Reveal>

        <Reveal delay={0.085}>
          <Accordion type="single" collapsible className="mt-14">
            {FAQ_ITEMS.map((item) => (
              <AccordionItem key={item.question} value={item.question}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
