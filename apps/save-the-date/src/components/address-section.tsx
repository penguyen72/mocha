import { Reveal } from "@mocha/ui";

import { AddressForm } from "./address-form";
import { ADDRESS_PAGE_HEADING } from "./address-content";

export function AddressSection() {
  return (
    <div className="relative flex w-full max-w-[440px] flex-col items-center gap-[22px] px-5 pb-16 pt-[clamp(56px,18vh,190px)]">
      <Reveal trigger="mount" duration={0.26}>
        <h1 className="m-0 text-center font-script text-[clamp(32px,9vw,48px)] font-normal leading-[1.1] tracking-[0.04em] text-std-heading-ink">
          {ADDRESS_PAGE_HEADING}
        </h1>
      </Reveal>

      <AddressForm />
    </div>
  );
}
