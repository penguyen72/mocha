import { InvitationStage } from "@/components/invitation-stage";

export default function Home() {
  return (
    <div className="flex min-h-dvh justify-center bg-std-page">
      <main className="relative flex min-h-dvh w-full max-w-[560px] flex-col items-center justify-center overflow-x-hidden bg-std-stage [background-image:var(--std-bg-wash)]">
        {/* Placeholder pending the real floral background art. */}
        <InvitationStage />
      </main>
    </div>
  );
}
