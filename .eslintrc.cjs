/** @type {import("@types/eslint").Linter.Config} */
module.exports = {
  "env": {
    "browser": true,
    "es2021": true,
    "node": true,
  },
  extends: ["eslint:recommended", "prettier"],
  "overrides": [
    {
      "files": [".eslintrc.{js,cjs}"],
      "parserOptions": {
        "sourceType": "script",
      },
    },
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  reportUnusedDisableDirectives: true,
  root: true,
  rules: {
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "error",
  },
};
