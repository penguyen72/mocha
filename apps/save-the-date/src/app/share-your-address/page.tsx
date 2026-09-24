import type { Metadata } from "next";

import { AddressSection } from "@/components/address-section";
import { FloralBackground } from "@/components/floral-background";

export const metadata: Metadata = {
  title: "Share your address — Peyton & Liane",
  description: "Send us your mailing address so the formal invitation can follow.",
};

export default function ShareYourAddressPage() {
  return (
    <div className="flex min-h-dvh justify-center bg-std-page">
      <main className="relative flex min-h-dvh w-full max-w-[560px] flex-col items-center overflow-x-hidden bg-std-stage">
        <FloralBackground />
        <AddressSection />
      </main>
    </div>
  );
}
