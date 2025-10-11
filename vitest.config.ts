import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,              // use describe, it, expect without imports
        environment: 'node',        // important for backend (not 'jsdom')
        include: ['tests/**/*.test.{js,ts}'], // where to look for test files
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
        },
        testTimeout: 10000,            // default timeout for tests
        setupFiles: ['./tests/setup.ts'], // optional: for DB connection or env setup
    },
});
