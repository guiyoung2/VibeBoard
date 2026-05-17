import { describe, it, expect, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../../test/mocks/server'
import { sortReviews, searchReviews } from '../reviews'
import type { Review } from '../../types/review'

// 테스트용 Review 객체 생성 헬퍼
function makeReview(overrides: Partial<Review> & Pick<Review, 'id' | 'rating' | 'created_at'>): Review {
  return {
    boardgame_id: 'bg-1',
    user_id: 'user-1',
    content: '재밌는 게임입니다',
    updated_at: overrides.created_at,
    ...overrides,
  }
}

const r1 = makeReview({ id: 'r1', rating: 1, created_at: '2022-01-01T00:00:00.000Z', content: '별로예요' })
const r2 = makeReview({
  id: 'r2',
  rating: 4,
  created_at: '2023-06-15T00:00:00.000Z',
  content: '꽤 괜찮아요',
  boardgame: { id: 'bg-2', name: '할리갈리', image_url: null },
  boardgame_id: 'bg-2',
})
const r3 = makeReview({
  id: 'r3',
  rating: 5,
  created_at: '2024-12-01T00:00:00.000Z',
  content: '정말 재밌어요',
  boardgame: { id: 'bg-1', name: '루미큐브', image_url: null },
})

const fixtures = [r1, r2, r3]

// ── sortReviews ──────────────────────────────────────────────────────────────

describe('sortReviews', () => {
  it('latest: created_at 내림차순으로 정렬한다', () => {
    const result = sortReviews(fixtures, 'latest')
    expect(result.map((r) => r.id)).toEqual(['r3', 'r2', 'r1'])
  })

  it('oldest: created_at 오름차순으로 정렬한다', () => {
    const result = sortReviews(fixtures, 'oldest')
    expect(result.map((r) => r.id)).toEqual(['r1', 'r2', 'r3'])
  })

  it('ratingHigh: rating 내림차순으로 정렬한다', () => {
    const result = sortReviews(fixtures, 'ratingHigh')
    expect(result.map((r) => r.id)).toEqual(['r3', 'r2', 'r1'])
  })

  it('ratingLow: rating 오름차순으로 정렬한다', () => {
    const result = sortReviews(fixtures, 'ratingLow')
    expect(result.map((r) => r.id)).toEqual(['r1', 'r2', 'r3'])
  })

  it('원본 배열을 변경하지 않는다 (불변성)', () => {
    const original = [...fixtures]
    sortReviews(fixtures, 'ratingHigh')
    expect(fixtures).toEqual(original)
  })
})

// ── searchReviews ────────────────────────────────────────────────────────────

describe('searchReviews', () => {
  beforeEach(() => {
    server.use(
      http.get('/reviews', () => HttpResponse.json(fixtures))
    )
  })

  it('빈 쿼리이면 전체 목록을 반환한다', async () => {
    const result = await searchReviews('')
    expect(result).toHaveLength(3)
  })

  it('보드게임 이름으로 검색하면 일치하는 항목만 반환한다', async () => {
    const result = await searchReviews('할리갈리')
    expect(result.map((r) => r.id)).toEqual(['r2'])
  })

  it('리뷰 내용(content)으로 검색하면 일치하는 항목만 반환한다', async () => {
    const result = await searchReviews('별로')
    expect(result.map((r) => r.id)).toEqual(['r1'])
  })

  it('카테고리(boardgame_id)로 필터링하면 해당 게임 리뷰만 반환한다', async () => {
    const result = await searchReviews('', 'bg-2')
    expect(result.map((r) => r.id)).toEqual(['r2'])
  })

  it('검색어 + 카테고리 조합 필터링이 동작한다', async () => {
    // bg-1 카테고리 AND '재밌' 포함 → r3만 해당
    const result = await searchReviews('재밌', 'bg-1')
    expect(result.map((r) => r.id)).toEqual(['r3'])
  })

  it('매칭되는 항목이 없으면 빈 배열을 반환한다', async () => {
    const result = await searchReviews('존재하지않는게임이름xyz')
    expect(result).toHaveLength(0)
  })
})
