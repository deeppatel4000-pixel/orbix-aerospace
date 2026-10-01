"use client";

import { createContext, useContext, type ReactNode } from "react";

import { EquationBlock, type EquationBlockProps } from "@/components/ui";

/**
 * The tool ID of the lab module around a tool ("03"), so each tool's
 * display equations can be numbered after it (spec 6: "(3.1)" at the right
 * margin). The module frame provides it; without a provider an equation
 * simply carries no number.
 */
const LabToolNumberContext = createContext<string | undefined>(undefined);

export function LabToolNumberProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: string | undefined;
}) {
  return (
    <LabToolNumberContext.Provider value={value}>
      {children}
    </LabToolNumberContext.Provider>
  );
}

/**
 * The equation number for the `index`th equation of a tool: tool "03",
 * index 1 gives "3.1". Undefined when the tool ID is unknown.
 */
export function labEquationNumber(
  toolNumber: string | undefined,
  index = 1,
): string | undefined {
  if (toolNumber === undefined) return undefined;
  const tool = Number.parseInt(toolNumber, 10);
  if (!Number.isFinite(tool) || tool < 1) return undefined;
  return tool + "." + index;
}

/**
 * `EquationBlock` numbered after the tool it sits in (spec 6). `index` is
 * the equation's place within the tool, 1 unless a tool shows several.
 */
export function LabEquation({
  index = 1,
  ...props
}: Omit<EquationBlockProps, "number"> & { index?: number }) {
  const toolNumber = useContext(LabToolNumberContext);
  return (
    <EquationBlock {...props} number={labEquationNumber(toolNumber, index)} />
  );
}
