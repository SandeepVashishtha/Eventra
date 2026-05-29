import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import storybook from "eslint-plugin-storybook";

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
      ...reactHooks.configs.recommended.rules,
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