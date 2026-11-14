import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
      "react-hooks/static-components": "off",
      "react-hooks/refs": "off",
      "react-hooks/incompatible-library": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist-server/**",
    "prisma/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
