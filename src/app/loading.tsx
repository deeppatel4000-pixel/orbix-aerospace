import { LoadingIndicator } from "@/components/ui/loading-indicator";

/**
 * Route loading state. A static outline of a page hero (eyebrow rule,
 * two-line heading, lead) on the hero's minor blueprint grid, with the
 * spinner and the word "Loading" for everyone who cannot see the outline.
 * No shimmer and no pulse; the spinner is the only moving part and it stops
 * under reduced motion.
 */
export default function Loading() {
  return (
    <main
      aria-busy="true"
      className="orbix-blueprint-minor relative flex min-h-[60vh] flex-1 border-b border-border"
    >
      <div className="mx-auto flex w-full max-w-[72rem] flex-col justify-end px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        <div aria-hidden="true" className="flex items-center gap-3">
          <span className="block h-px w-6 bg-accent" />
          <span className="orbix-skeleton h-3 w-28" />
        </div>
        <div aria-hidden="true" className="mt-6 flex flex-col gap-3">
          <span className="orbix-skeleton h-12 w-[min(34rem,85%)] sm:h-16" />
          <span className="orbix-skeleton h-12 w-[min(22rem,60%)] sm:h-16" />
        </div>
        <div aria-hidden="true" className="mt-8 flex flex-col gap-2">
          <span className="orbix-skeleton h-4 w-[min(36rem,90%)]" />
          <span className="orbix-skeleton h-4 w-[min(28rem,70%)]" />
        </div>
        <LoadingIndicator className="mt-10" />
      </div>
    </main>
  );
}
