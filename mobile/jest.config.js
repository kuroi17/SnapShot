/** @type {import('jest').Config} */
module.exports = {
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: "tsconfig.json" }],
  },
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "js"],
};
