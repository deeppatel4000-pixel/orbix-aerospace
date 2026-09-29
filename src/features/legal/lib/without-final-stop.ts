/**
 * Drops one trailing full stop, so a name that ends in an abbreviation
 * ("Vercel Inc.") can close a sentence without printing "Inc..".
 */
export function withoutFinalStop(text: string): string {
  return text.endsWith(".") ? text.slice(0, -1) : text;
}
