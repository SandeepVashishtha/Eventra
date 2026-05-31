import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import storybook from "eslint-plugin-storybook";
import testingLibrary from "eslint-plugin-testing-library";

export default [
  {
    ignores: ["build/**", "coverage/**", "dist/**", "node_modules/**"],
  },
  {
    files: ["**/*.{js,jsx,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "testing-library": testingLibrary,
      storybook,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "no-console": "warn",
      "no-unused-vars": "warn",
      "react/jsx-no-target-blank": "error",
      // apply react-hooks recommended rules but relax some strict checks
      ...reactHooks.configs.recommended.rules,
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "react-hooks/refs": "off",
      "react-hooks/immutability": "off",
      // Disable testing-library rule if plugin not available in some environments
      "testing-library/no-unnecessary-act": "off",
    },
  },
  ...storybook.configs["flat/recommended"],
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  {
    rules: {
      "react/prop-types": "off",
    },
  },
];
