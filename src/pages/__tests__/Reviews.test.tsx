import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import type { ReactElement } from 'react'
import Reviews from '../Reviews'

// supabase 모킹: 환경변수 없이도 동작하도록 전체 대체
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signOut: vi.fn().mockResolvedValue({ error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    from: vi.fn(),
  },
}))

// IntersectionObserver 미구현 환경 대응
const mockObserver = {
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}
vi.stubGlobal('IntersectionObserver', vi.fn(() => mockObserver))

// 테스트용 리뷰·보드게임·프로필 데이터
const rawReviews = [
  {
    id: 'r1',
    boardgame_id: 'bg-1',
    user_id: 'user-1',
    rating: 5,
    content: '최고의 게임입니다',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'r2',
    boardgame_id: 'bg-2',
    user_id: 'user-2',
    rating: 2,
    content: '보통이에요',
    created_at: '2024-02-01T00:00:00.000Z',
    updated_at: '2024-02-01T00:00:00.000Z',
  },
]

const rawBoardgames = [
  { id: 'bg-1', name: '루미큐브', image_url: null },
  { id: 'bg-2', name: '할리갈리', image_url: null },
]

const rawProfiles = [
  { id: 'user-1', nickname: '테스터1' },
  { id: 'user-2', nickname: '테스터2' },
]

// 체이닝 가능한 Supabase 빌더 팩토리
function makeBuilder(data: unknown) {
  const result = { data, error: null }
  const builder: Record<string, unknown> = {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: Array.isArray(data) ? data[0] ?? null : data, error: null }),
  }
  // await 가능하도록 thenable 처리
  builder.then = (onfulfilled: (v: unknown) => unknown, onrejected?: (r: unknown) => unknown) =>
    Promise.resolve(result).then(onfulfilled, onrejected)
  builder.catch = (onrejected: (r: unknown) => unknown) =>
    Promise.resolve(result).catch(onrejected)
  return builder
}

// 테스트마다 새 QueryClient (retry 비활성화)
function makeQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } })
}

// Router + QueryClientProvider 래퍼
function renderWithProviders(ui: ReactElement) {
  const queryClient = makeQueryClient()
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    </MemoryRouter>,
  )
}

describe('Reviews 페이지', () => {
  beforeEach(async () => {
    const { supabase } = await import('../../lib/supabase')
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'reviews') return makeBuilder(rawReviews) as unknown as ReturnType<typeof supabase.from>
      if (table === 'boardgames') return makeBuilder(rawBoardgames) as unknown as ReturnType<typeof supabase.from>
      if (table === 'profiles') return makeBuilder(rawProfiles) as unknown as ReturnType<typeof supabase.from>
      return makeBuilder([]) as unknown as ReturnType<typeof supabase.from>
    })
  })

  it('리뷰 목록이 화면에 렌더링된다', async () => {
    renderWithProviders(<Reviews />)
    // 보드게임 이름이 카드에 표시되면 데이터 로드 완료
    expect(await screen.findByText('루미큐브')).toBeInTheDocument()
    expect(screen.getByText('할리갈리')).toBeInTheDocument()
  })

  it('검색어를 입력하면 일치하는 게임의 리뷰만 표시된다', async () => {
    renderWithProviders(<Reviews />)
    await screen.findByText('루미큐브')

    fireEvent.change(screen.getByPlaceholderText('보드게임 이름으로 검색...'), {
      target: { value: '루미큐브' },
    })

    expect(screen.getByText('루미큐브')).toBeInTheDocument()
    expect(screen.queryByText('할리갈리')).not.toBeInTheDocument()
  })

  it('별점 높은순 정렬 시 높은 별점 카드가 먼저 나온다', async () => {
    renderWithProviders(<Reviews />)
    await screen.findByText('루미큐브')

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'rating-high' } })

    await waitFor(() => {
      const gameNames = screen.getAllByText(/루미큐브|할리갈리/)
      // r1(rating 5)이 r2(rating 2)보다 앞에 위치해야 함
      expect(gameNames[0]).toHaveTextContent('루미큐브')
      expect(gameNames[1]).toHaveTextContent('할리갈리')
    })
  })

  it('별점 낮은순 정렬 시 낮은 별점 카드가 먼저 나온다', async () => {
    renderWithProviders(<Reviews />)
    await screen.findByText('루미큐브')

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'rating-low' } })

    await waitFor(() => {
      const gameNames = screen.getAllByText(/루미큐브|할리갈리/)
      // r2(rating 2)가 r1(rating 5)보다 앞에 위치해야 함
      expect(gameNames[0]).toHaveTextContent('할리갈리')
      expect(gameNames[1]).toHaveTextContent('루미큐브')
    })
  })
})
