import { OrbixMark } from "@/components/brand/orbix-mark";
import { OrbixWordmark } from "@/components/brand/orbix-wordmark";

export default function Loading() {
  return (
    <main
      aria-label="ORBIX loading"
      className="orbix-light-field relative flex min-h-screen items-center justify-center overflow-hidden bg-orbital"
    >
      <div
        className="orbix-grid absolute inset-0 opacity-60"
        aria-hidden="true"
      />
      <div className="orbix-enter relative text-center">
        <OrbixMark
          className="orbix-loading-mark orbix-signal-pulse mx-auto h-24 w-24"
          priority
        />
        <OrbixWordmark className="mx-auto mt-5 h-14 w-56" priority />
        <p className="mt-3 font-mono text-[0.65rem] tracking-[0.2em] text-muted uppercase">
          Initializing engineering workspace
        </p>
      </div>
    </main>
  );
}
