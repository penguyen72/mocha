import { FloralBackground } from "@/components/floral-background";
import { InvitationStage } from "@/components/invitation-stage";

export default function Home() {
  return (
    <div className="flex min-h-dvh justify-center bg-std-page">
      <main className="relative flex min-h-dvh w-full max-w-[560px] flex-col items-center justify-center overflow-x-hidden bg-std-stage">
        <FloralBackground />
        <InvitationStage />
        {/* A faint printed-paper tooth across the whole card. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] opacity-55 mix-blend-multiply [background:var(--std-paper-grain)]"
        />
      </main>
    </div>
  );
}
