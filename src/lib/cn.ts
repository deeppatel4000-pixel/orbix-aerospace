type ClassNameValue = false | null | string | undefined;

export function cn(...values: ClassNameValue[]) {
  return values.filter(Boolean).join(" ");
}
