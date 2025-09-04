// Flat config specifically for docs/LiftTrackerAI (stricter, but isolated)
import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import importPlugin from "eslint-plugin-import";
import globals from "globals";
import prettier from "eslint-config-prettier";

export default [
  // Scope to docs/LiftTrackerAI only
  {
    files: ["docs/LiftTrackerAI/**/*.{js,jsx,ts,tsx}"]
  },

  js.configs.recommended,

  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tsParser,
      globals: {
        ...globals.browser,
        ...globals.node,
        // Allow JSX runtime without explicit React import
        React: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      react,
      "react-hooks": reactHooks,
      import: importPlugin,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      // Keep core recommendations
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      // Stricter where feasible
      "no-empty": "error",
      // Unused vars: warn only in docs; TS rule supersedes base rule
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      // Pragmatic relaxations for demo code
      "no-undef": "off", // TS + demo globals (Chart, NodeJS types in comments)
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "react/no-unknown-property": "off", // allow custom cmdk-* props in demo
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  prettier,
];
