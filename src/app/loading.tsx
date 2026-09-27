import { LoadingIndicator } from "@/components/ui/loading-indicator";

/**
 * Route loading state (spec 11, 14): the ring spinner beside the word
 * "Loading", centred in the main area. No wordmark, glow or pulse.
 */
export default function Loading() {
  return (
    <main
      aria-busy="true"
      className="flex min-h-[50vh] flex-1 items-center justify-center px-4"
    >
      <LoadingIndicator />
    </main>
  );
}
