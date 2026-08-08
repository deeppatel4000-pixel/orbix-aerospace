import { OrbixMark } from "@/components/brand/orbix-mark";
import { OrbixWordmark } from "@/components/brand/orbix-wordmark";

export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-label="ORBIX loading"
      aria-live="polite"
      className="orbix-light-field relative flex min-h-screen items-center justify-center overflow-hidden bg-orbital"
      role="status"
    >
      <div
        className="orbix-grid absolute inset-0 opacity-60"
        aria-hidden="true"
      />
      <div className="orbix-enter relative mx-auto w-full max-w-md px-6 text-center">
        <p className="orbix-kicker mb-[var(--space-stack-compact)]">
          ORBIX // Mission systems
        </p>
        <OrbixMark
          className="orbix-loading-mark orbix-signal-pulse mx-auto h-24 w-24"
          priority
        />
        <OrbixWordmark
          className="mx-auto mt-5 h-14 w-56"
          priority
          sizes="224px"
        />
        <div className="orbix-brand-rule mx-auto mt-[var(--space-stack-compact)] max-w-48" />
        <p className="mt-[var(--space-stack-compact)] font-mono tracking-[var(--tracking-technical)] text-[var(--type-label)] text-muted uppercase">
          Initializing engineering workspace
        </p>
      </div>
    </main>
  );
}
