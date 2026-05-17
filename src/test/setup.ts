import '@testing-library/jest-dom'
import { server } from './mocks/server'

// MSW 서버 라이프사이클 연결
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
