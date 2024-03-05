/// <reference types="vitest" />
import { defineConfig } from "vite";
import { configDefaults } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
    resolve: {
        alias: {
            lib: resolve(__dirname, "./src/lib")
        }
    },
    test: {
        clearMocks: true,
        watch: true,
        coverage: {
            reporter: ["lcov", "html"],
            provider: "v8",
            exclude: [...configDefaults.exclude, "**/test/**", "**/test/**"],
            thresholds: {
                functions: 90,
                branches: 70,
                lines: 90,
                perFile: true,
                statements: 90
            },
            skipFull: true
        },
        globals: true,
        include: ["test/**/*.test.{ts,js}"]
    }
});
