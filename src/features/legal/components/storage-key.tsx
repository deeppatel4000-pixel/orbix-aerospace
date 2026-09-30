import { formatCode } from "@/components/ui/readout";

/**
 * A browser storage key set as code. The key never breaks across lines:
 * the longest key is about 220px wide in mono, so it fits a 320px screen.
 * formatCode centres each `.` in its B612 Mono cell, so
 * "orbix.mission-scenarios.v1" does not read as if it had spaces; the text
 * content (copy, search, screen readers) is unchanged.
 */
export function StorageKey({ value }: { readonly value: string }) {
  return (
    <code className="whitespace-nowrap">
      {formatCode(value, { breakAfterSlash: false })}
    </code>
  );
}
