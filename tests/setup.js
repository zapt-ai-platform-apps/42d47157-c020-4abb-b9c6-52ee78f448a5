// Mock global BigInt if not available in test environment
global.BigInt = global.BigInt || ((value) => {
  return Number(value);
});

// Export for tests to spy on
export const BigInt = global.BigInt;