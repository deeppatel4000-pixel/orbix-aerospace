import { LoadingIndicator } from "@/components/ui/loading-indicator";

/**
 * Route loading state: a static outline of a page heading and lead on the
 * page ground, with the spinner and the word "Loading" for everyone who
 * cannot see the outline. No grid, no shimmer, no pulse; the spinner is the
 * only moving part and it stops under reduced motion.
 */
export default function Loading() {
  return (
    <main aria-busy="true" className="flex min-h-[60vh] flex-1">
      <div className="mx-auto flex w-full max-w-[72rem] flex-col justify-end px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        <div aria-hidden="true" className="flex flex-col gap-3">
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
