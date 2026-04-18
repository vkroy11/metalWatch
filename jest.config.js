/** Adapters are pure TS — use ts-jest in a plain node env. Component tests
 * can be added later in a separate jest project with the jest-expo preset. */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/src/**/__tests__/**/*.test.ts', '**/src/**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '\\.tsx$'],
};
