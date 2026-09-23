import type { Metadata } from "next";

import { AddressSection } from "@/components/address-section";

export const metadata: Metadata = {
  title: "Share your address — Peyton & Liane",
  description: "Send us your mailing address so the formal invitation can follow.",
};

export default function ShareYourAddressPage() {
  return (
    <div className="flex min-h-dvh justify-center bg-std-page">
      <main className="relative flex min-h-dvh w-full max-w-[560px] flex-col items-center overflow-x-hidden bg-std-stage [background-image:var(--std-bg-wash)]">
        {/* Placeholder pending the real floral background art. */}
        <AddressSection />
      </main>
    </div>
  );
}
