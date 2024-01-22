module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ["standard-with-typescript", "plugin:prettier/recommended"],
  ignorePatterns: ["node_modules", "dist"],
  rules: {
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/consistent-type-definitions": ["error", "type"],
  },
};
