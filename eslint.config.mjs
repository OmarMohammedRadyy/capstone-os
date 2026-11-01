import next from "eslint-config-next";

const config = [
  {
    ignores: [
      "**/src/generated/**",
      "**/.next/**",
      "**/node_modules/**",
      "**/dist/**",
      "**/.pgdata/**",
      "**/coverage/**",
    ],
  },
  ...next,
  {
    rules: {
      "import/no-anonymous-default-export": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];

export default config;
