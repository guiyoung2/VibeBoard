import type { Review } from '../types/review'

export type SortOption = 'latest' | 'oldest' | 'ratingHigh' | 'ratingLow'

// 정렬 옵션별 리뷰 배열 정렬 (원본 불변)
export function sortReviews(reviews: Review[], option: SortOption): Review[] {
  const copy = [...reviews]
  switch (option) {
    case 'latest':
      return copy.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    case 'oldest':
      return copy.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    case 'ratingHigh':
      return copy.sort((a, b) => b.rating - a.rating)
    case 'ratingLow':
      return copy.sort((a, b) => a.rating - b.rating)
  }
}

// /reviews 목록 조회 후 쿼리·카테고리로 클라이언트 필터링
export async function searchReviews(query: string, category?: string): Promise<Review[]> {
  const res = await fetch('/reviews')
  if (!res.ok) throw new Error('리뷰 목록 조회 실패')
  const reviews: Review[] = await res.json()

  const q = query.trim().toLowerCase()
  return reviews.filter((review) => {
    const matchesQuery =
      !q ||
      (review.boardgame?.name ?? '').toLowerCase().includes(q) ||
      review.content.toLowerCase().includes(q)
    const matchesCategory = !category || review.boardgame_id === category
    return matchesQuery && matchesCategory
  })
}
