module.exports = {
    env: {
        node: true,
        es2022: true,
        "vitest-globals/env": true
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:prettier/recommended",
        "plugin:vitest-globals/recommended"
    ],
    overrides: [
        {
            env: {
                node: true
            },
            files: [".eslintrc.{js,cjs}"],
            parserOptions: {
                sourceType: "script"
            }
        }
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module"
    },
    plugins: ["@typescript-eslint", "simple-import-sort"],
    rules: {
        complexity: ["error", { max: 10 }],
        "import/no-duplicates": "error",
        "@typescript-eslint/no-explicit-any": "off",
        "import/first": "error",
        "import/newline-after-import": "error",
        "sort-imports": "off",
        "simple-import-sort/imports": "error"
    },
    settings: {
        "import/resolver": {
            typescript: {},
            node: {
                extensions: [".js", ".ts", ".d.ts"]
            }
        }
    }
};
