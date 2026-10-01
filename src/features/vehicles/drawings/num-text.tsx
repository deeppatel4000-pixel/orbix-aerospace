/** A decimal point or thousands comma between two digits. */
const SEPARATOR = /(?<=\d)([.,])(?=\d)/;

/**
 * A figure for an SVG `<text>`, with the decimal point and thousands comma
 * closed up. B612 Mono gives the point a full cell, which reads as
 * "124. 4 m" at drawing sizes; HTML figures fix this with `.orbix-num-sep`,
 * which SVG text cannot use. This applies the same correction as the large
 * readouts (`margin-inline: -0.02em -0.22em`) as `dx` shifts, in drawing
 * units, so it holds under any text anchor.
 */
export function NumText({ size, text }: { size: number; text: string }) {
  const parts = text.split(SEPARATOR);
  if (parts.length === 1) return <>{text}</>;
  return (
    <>
      {parts.map((part, index) => {
        if (index === 0) return part;
        const isSeparator = index % 2 === 1;
        return (
          <tspan
            data-num-sep={isSeparator ? "" : undefined}
            dx={round((isSeparator ? -0.02 : -0.22) * size)}
            key={index}
          >
            {part}
          </tspan>
        );
      })}
    </>
  );
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
