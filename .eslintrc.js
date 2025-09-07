/** @type {import("eslint").Linter.Config} */
module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint", "react", "react-hooks"],
    extends: [
        "next/core-web-vitals", // rule chuẩn của Next.js
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "prettier", // nếu bạn có dùng Prettier
    ],
    rules: {
        "semi": ["error", "always"],
        "quotes": ["error", "double"],
        "no-unused-vars": "warn",
        "react/jsx-uses-react": "off",
        "react/react-in-jsx-scope": "off" // Next.js không cần import React
    },
    env: {
        browser: true,
        node: true,
        es2021: true
    }
};
