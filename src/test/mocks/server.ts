import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// 테스트 환경용 MSW Node 서버
export const server = setupServer(...handlers)
