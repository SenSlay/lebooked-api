/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: "node",
  transform: {
    "^.+\.tsx?$": ["ts-jest",{}],
  },
  preset: "ts-jest",
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
};
