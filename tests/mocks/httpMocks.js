/**
 * Creates a mock request object for testing API handlers
 */
export function createMockRequest({ method = 'GET', headers = {}, body = {}, query = {} } = {}) {
  return {
    method,
    headers: {
      'content-type': 'application/json',
      ...headers
    },
    body,
    query
  };
}

/**
 * Creates a mock response object for testing API handlers
 */
export function createMockResponse() {
  const res = {
    status: vi.fn(() => res),
    json: vi.fn(() => res),
    send: vi.fn(() => res),
    setHeader: vi.fn(() => res),
    end: vi.fn(() => res)
  };
  return res;
}