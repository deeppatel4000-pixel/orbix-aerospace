import { Fragment } from "react";

/**
 * A browser storage key set as code. Each dot-separated part stays whole,
 * and the line may break after a dot, so a long key never forces a short
 * line of text before it and never splits at a hyphen.
 */
export function StorageKey({ value }: { readonly value: string }) {
  const parts = value.split(".");

  return (
    <code className="box-decoration-clone">
      {parts.map((part, index) => (
        <Fragment key={`${part}-${index}`}>
          <span className="whitespace-nowrap">
            {part}
            {index < parts.length - 1 ? "." : null}
          </span>
          {index < parts.length - 1 ? <wbr /> : null}
        </Fragment>
      ))}
    </code>
  );
}
