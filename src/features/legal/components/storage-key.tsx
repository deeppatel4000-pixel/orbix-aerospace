/**
 * A browser storage key set as code. The key never breaks across lines:
 * the longest key is about 220px wide in mono, so it fits a 320px screen.
 */
export function StorageKey({ value }: { readonly value: string }) {
  return <code className="whitespace-nowrap">{value}</code>;
}
