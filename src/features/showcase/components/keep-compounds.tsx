import { Fragment, type ReactNode } from "react";

/**
 * Keeps hyphenated compounds such as "Earth-to-Moon" on one line, so a
 * narrow column never breaks them at a hyphen. The text is unchanged.
 */
export function keepCompounds(text: string): ReactNode {
  return text.split(/(\S*\w-\w\S*)/).map((part, index) =>
    index % 2 === 1 ? (
      <span className="whitespace-nowrap" key={index}>
        {part}
      </span>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );
}
