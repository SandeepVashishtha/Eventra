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
      // Relax rules that produce many repo-wide errors when enabling flat config
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/globals": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/exhaustive-deps": "warn",
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