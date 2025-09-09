// Flat ESLint config for Lift Legends
import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import importPlugin from "eslint-plugin-import";
import globals from "globals";
import prettier from "eslint-config-prettier";

export default [
  // Ignore patterns (merged from .eslintrc + .eslintignore)
  {
    ignores: [
      "dist/**",
      "build/**",
      "node_modules/**",
      "public/**",
      "docs/**",
      "LiftTrackerAI/**",
      "src-tauri/**",
      "src/assets/**",
      "src/components/**",
      "src/config/**",
      "src/data/**",
      "src/hooks/**",
      "src/pages/**",
      "src/shared/**",
      "src/styles/**",
      "src/targets/**",
      "capacitor.config.ts",
    ],
  },

  // Base JS recommended
  js.configs.recommended,

  // TS/React setup
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tsParser,
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
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
      // Recommended sets
      ...tsPlugin.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      // Project-specific disables matching old .eslintrc
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "import/order": "off",
      "import/newline-after-import": "off",
      "import/no-unresolved": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },

  // Disable stylistic rules that conflict with Prettier
  prettier,

  // Test files: enable test globals (describe/it/expect)
  {
    files: ["**/*.{test,spec}.{js,jsx,mjs,cjs,ts,tsx}", "tests/**/*"],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.node,
      },
    },
  },
];
