import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
	{
		ignores: ["prisma/**"],
	},
	...nextCoreWebVitals,
	...nextTypescript,
	{
		rules: {
			// Keep exhaustive-deps warnings, but disable stricter compiler-era rules
			// that would require broad refactors in existing components.
			"react-hooks/static-components": "off",
			"react-hooks/immutability": "off",
			"react-hooks/set-state-in-effect": "off",
		},
	},
];

export default eslintConfig;
