/** @type {import('eslint').Linter.FlatConfig} */
module.exports = [
    {
        ignores: ["**/node_modules/**", "**/.next/**"],
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: "module",
            globals: {
                window: "readonly",
                document: "readonly",
                navigator: "readonly"
            }
        },
        plugins: {
            "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
            "react": require("eslint-plugin-react"),
            "react-hooks": require("eslint-plugin-react-hooks")
        },
        rules: {
            semi: ["error", "always"],
            quotes: ["error", "double"],
            "no-unused-vars": "warn",
            "react/jsx-uses-react": "off",
            "react/react-in-jsx-scope": "off"
        }
    }
];
