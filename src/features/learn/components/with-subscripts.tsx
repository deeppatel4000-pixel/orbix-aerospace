import { Fragment, type ReactNode } from "react";

/**
 * Subscripts and superscripts share one scale (0.62em) and sit on fixed
 * offsets, so "V² S C_L" reads as a power and an index of the same size,
 * not the browser's near-full-size <sub> beside a tiny Unicode ².
 */
const SUB_CLASS = "text-[0.62em] leading-none align-[-0.3em]";
const SUP_CLASS = "text-[0.62em] leading-none align-[0.55em]";

/**
 * The Unicode ² and ³ are drawn as the same raised digit as `^2`, but a
 * screen reader would read a bare <sup>2</sup> in running text as "V 2".
 * The digit is hidden from assistive technology and the power is spoken
 * as a word instead. Equations are unaffected: they carry `spokenAs`.
 */
const UNICODE_SUPERSCRIPTS: Record<string, { digit: string; spoken: string }> =
  {
    "²": { digit: "2", spoken: " squared" },
    "³": { digit: "3", spoken: " cubed" },
  };

/**
 * `_x` (letters and digits) is a subscript; `^x` (digits, an optional
 * minus and an optional digit fraction) and the Unicode ² and ³ are
 * superscripts.
 */
const SCRIPT_SPLIT = /(_[A-Za-z0-9]+|\^-?[0-9]+(?:\/[0-9]+)?|[²³])/;

/**
 * Terms that must not break across a line on a phone: an inline formula
 * and hyphenated compounds. U+2011 is not used instead because IBM Plex
 * may fall back for it.
 */
const NOWRAP_SPLIT =
  /(½ ρ V²|\bdelta-v\b|\bSutton-Graves\b|\bthrust-to-weight\b)/i;

function renderScripts(value: string, key: string): ReactNode {
  const parts = value.split(SCRIPT_SPLIT);
  if (parts.length === 1) return value;

  return parts.map((part, index) => {
    const partKey = `${key}-${index}`;
    if (index % 2 === 0) return <Fragment key={partKey}>{part}</Fragment>;
    if (part.startsWith("_")) {
      return (
        <sub className={SUB_CLASS} key={partKey}>
          {part.slice(1)}
        </sub>
      );
    }
    const unicode = UNICODE_SUPERSCRIPTS[part];
    if (unicode) {
      return (
        <sup className={SUP_CLASS} key={partKey}>
          <span aria-hidden="true">{unicode.digit}</span>
          <span className="sr-only">{unicode.spoken}</span>
        </sup>
      );
    }
    return (
      <sup className={SUP_CLASS} key={partKey}>
        {part.slice(1).replace("-", "−")}
      </sup>
    );
  });
}

/**
 * Renders `_x` in a string as a subscript, so "C_L" reads as C with a
 * subscript L, and ², ³ and `^x` as superscripts at the same scale, so
 * "kg^1/2/m" reads as kg with a superscript 1/2, per meter. Inline
 * formulas and hyphenated compounds are kept on one line. Everything
 * else is returned as text.
 */
export function withSubscripts(value: string): ReactNode {
  const parts = value.split(NOWRAP_SPLIT);
  if (parts.length === 1) return renderScripts(value, "s");

  return parts.map((part, index) =>
    index % 2 === 0 ? (
      <Fragment key={index}>{renderScripts(part, `s${index}`)}</Fragment>
    ) : (
      <span className="whitespace-nowrap" key={index}>
        {renderScripts(part, `n${index}`)}
      </span>
    ),
  );
}

const NBSP = " ";

/**
 * A relation (`=` or `≈`) keeps a full space each side, bound to the term
 * before it so a wrapped line never starts with it. A quotient (`/`) is set
 * tight, with a hair of side bearing, so a monospaced equation does not
 * read letter-spaced.
 *
 * A product (`·`) is set the textbook way, by juxtaposition: a narrow
 * spacer and no visible operator. B612 Mono draws its middle dot left of
 * the cell center, so a dot hugs the term before it whatever the margins.
 * Every equation carries a `spokenAs` that says "times".
 */
/**
 * B612 Mono draws ( and ) nearly square, so "ln(m0/mf)" reads as
 * "ln[m0/mf]". Parentheses are set in Plex Sans, the textbook shape.
 */
const PAREN_SPLIT = /([()])/;

function setParentheses(value: string, key: string): ReactNode {
  const parts = value.split(PAREN_SPLIT);
  if (parts.length === 1) return withSubscripts(value);
  return parts.map((part, index) =>
    index % 2 === 0 ? (
      <Fragment key={`${key}-p${index}`}>{withSubscripts(part)}</Fragment>
    ) : (
      <span className="orbix-equation__paren" key={`${key}-p${index}`}>
        {part}
      </span>
    ),
  );
}

const OPERATOR_SPLIT = / ([=≈]) | ([·/]) /;

function setOperators(value: string, key: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const parts = value.split(OPERATOR_SPLIT);
  // split with two capture groups yields [text, relation, operator, text, ...]
  for (let index = 0; index < parts.length; index += 3) {
    const text = parts[index];
    if (text) {
      nodes.push(
        <Fragment key={`${key}-t${index}`}>
          {setParentheses(text, `${key}-t${index}`)}
        </Fragment>,
      );
    }
    const relation = parts[index + 1];
    const operator = parts[index + 2];
    if (relation) {
      nodes.push(`${NBSP}${relation} `);
    } else if (operator === "·") {
      nodes.push(
        <span
          aria-hidden="true"
          className="inline-block w-[0.35em]"
          key={`${key}-o${index}`}
        />,
      );
    } else if (operator) {
      nodes.push(
        <span className="mx-[0.12em]" key={`${key}-o${index}`}>
          {operator}
        </span>,
      );
    }
  }
  return nodes;
}

/**
 * Formats an equation string for `EquationBlock`: juxtaposed products,
 * tight quotients, spaced relations, `_x` subscripts, and each
 * newline-separated relation on its own line. A radical keeps its
 * parentheses, `√(μ / r)`: the √ glyph comes from a fallback face, so a
 * rule drawn over the argument cannot be made to meet it.
 */
export function formatEquation(value: string): ReactNode {
  const lines = value.split("\n");
  if (lines.length === 1) return setOperators(value, "l0");

  return lines.map((line, index) => (
    <span className="block leading-[1.5]" key={index}>
      {setOperators(line, `l${index}`)}
    </span>
  ));
}
