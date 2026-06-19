import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "jsdom",
  roots: ["<rootDir>/__tests__"],
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.ts"],
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  collectCoverageFrom: [
    "src/auth/**/*.{ts,tsx}",
    "src/services/**/*.{ts,tsx}",
    "src/data-validation/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
  ],
  coverageThreshold: {
    global: {
      statements: 0,
    },
    "./src/auth/": {
      statements: 80,
    },
    "./src/services/": {
      statements: 80,
    },
    "./src/data-validation/": {
      statements: 80,
    },
  },
  testMatch: [
    "<rootDir>/__tests__/unit/**/*.test.ts",
    "<rootDir>/__tests__/unit/**/*.test.tsx",
  ],
};

export default config;
