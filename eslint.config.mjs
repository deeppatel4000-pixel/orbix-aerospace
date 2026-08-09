import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

/**
 * Migrated from the previous `FlatCompat` + `compat.extends("next/...")`
 * shim during the Next.js 16.3.0 upgrade.
 *
 * `eslint-config-next@16` ships native flat configs on its `./core-web-vitals`
 * and `./typescript` subpaths, and routing them back through the eslintrc
 * compatibility layer now throws:
 *
 *   Converting circular structure to JSON ... property 'react' closes the circle
 *       at ConfigValidator.formatErrors (@eslint/eslintrc/lib/shared/config-validator.js)
 *
 * The shim serialises the config for schema validation, and the v16 configs
 * contain a self-referential plugin object it cannot stringify. Importing the
 * flat configs directly is both the documented approach for v16 and simpler —
 * no compat layer, no `__dirname` plumbing.
 *
 * Rule coverage is intentionally unchanged: the same two Next config sets are
 * applied in the same order, still followed by `eslint-config-prettier` (a
 * single flat object, not an array) so formatting rules stay disabled last.
 */
const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypeScript,
  prettier,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "output/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
