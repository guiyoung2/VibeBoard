import { http, HttpResponse } from 'msw'

// MSW v2 핸들러: json-server 및 정적 JSON 엔드포인트 응답
export const handlers = [
  // 리뷰 목록
  http.get('/reviews', () => HttpResponse.json([])),
  http.get('/reviews.json', () => HttpResponse.json([])),

  // 댓글 목록
  http.get('/comments', () => HttpResponse.json([])),
  http.get('/comments.json', () => HttpResponse.json([])),

  // 유저 목록
  http.get('/users', () => HttpResponse.json([])),
  http.get('/users.json', () => HttpResponse.json([])),
]
