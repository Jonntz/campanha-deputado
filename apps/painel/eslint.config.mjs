import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

/**
 * Flat config nativo. A partir do Next 16 o `eslint-config-next` já exporta
 * arrays de flat config, então não é preciso o adaptador FlatCompat.
 * O comando `next lint` foi removido: use `npm run lint`.
 */
const config = [
  {
    ignores: [".next/**", "out/**", "node_modules/**", "next-env.d.ts"],
  },
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    // Em .d.ts os parâmetros de tipo precisam manter o nome original para o
    // merge de interfaces funcionar, mesmo quando não são referenciados.
    files: ["**/*.d.ts"],
    rules: { "@typescript-eslint/no-unused-vars": "off" },
  },
];

export default config;
