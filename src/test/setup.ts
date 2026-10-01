import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from './server'

// Mock Service Worker intercepts fetch calls so tests never hit the real API
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  cleanup()
  localStorage.clear()
})
afterAll(() => server.close())

// jsdom doesn't implement these browser APIs that MUI / Recharts / TanStack Virtual use
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver

if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}

window.scrollTo = (() => {}) as typeof window.scrollTo

// jsdom swaps in its own AbortSignal class, but Node's fetch/Request only accept Node's AbortSignal.
// React Query and React Router pass jsdom signals, so we drop them in tests
// (every request is mocked by MSW and never needs cancelling).
const NodeRequest = globalThis.Request
class TestRequest extends NodeRequest {
  constructor(input: RequestInfo | URL, init?: RequestInit) {
    if (init?.signal) {
      const withoutSignal: RequestInit = { ...init }
      delete withoutSignal.signal
      super(input, withoutSignal)
    } else {
      super(input, init)
    }
  }
}
globalThis.Request = TestRequest as typeof Request

const nodeFetch = globalThis.fetch
globalThis.fetch = (input: RequestInfo | URL, init?: RequestInit) =>
  nodeFetch(new TestRequest(input, init))
