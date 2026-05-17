import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { User, Session } from '@supabase/supabase-js'

// Supabase 모듈 모킹: 환경변수 없이도 동작하도록 전체 대체
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signOut: vi.fn().mockResolvedValue({ error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { nickname: '테스트유저' }, error: null }),
    })),
  },
}))

import { useAuthStore } from '../authStore'

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00.000Z',
} as unknown as User

const mockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: mockUser,
} as unknown as Session

// 각 테스트 전 스토어를 초기 상태로 리셋
function resetStore() {
  useAuthStore.setState({
    user: null,
    session: null,
    nickname: null,
    loading: false,
  })
}

describe('authStore', () => {
  beforeEach(() => {
    resetStore()
    vi.clearAllMocks()
  })

  describe('setUser', () => {
    it('user를 설정하면 store에 반영된다 (로그인 상태)', () => {
      useAuthStore.getState().setUser(mockUser)
      const { user } = useAuthStore.getState()
      expect(user).toBe(mockUser)
      expect(user).not.toBeNull()
    })

    it('user를 null로 설정하면 nickname도 null이 된다', () => {
      useAuthStore.setState({ user: mockUser, nickname: '기존닉네임' })
      useAuthStore.getState().setUser(null)
      const { user, nickname } = useAuthStore.getState()
      expect(user).toBeNull()
      expect(nickname).toBeNull()
    })
  })

  describe('setSession', () => {
    it('session을 설정하면 token 정보가 store에 반영된다', () => {
      useAuthStore.getState().setSession(mockSession)
      const { session } = useAuthStore.getState()
      expect(session).toBe(mockSession)
      expect(session?.access_token).toBe('mock-access-token')
    })
  })

  describe('signOut', () => {
    it('signOut 후 user, session, nickname이 모두 null로 초기화된다', async () => {
      // 로그인 상태로 설정
      useAuthStore.setState({ user: mockUser, session: mockSession, nickname: '테스트유저' })

      await useAuthStore.getState().signOut()

      const { user, session, nickname } = useAuthStore.getState()
      expect(user).toBeNull()
      expect(session).toBeNull()
      expect(nickname).toBeNull()
    })

    it('signOut은 supabase.auth.signOut을 호출한다', async () => {
      const { supabase } = await import('../../lib/supabase')
      await useAuthStore.getState().signOut()
      expect(supabase.auth.signOut).toHaveBeenCalledOnce()
    })
  })
})
