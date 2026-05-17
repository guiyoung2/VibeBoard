# VibeBoard — 진단 보고서

> 작성일: 2026-05-17 · 진단 대상 브랜치: `harness/refactor-cycle`  
> 면접·이력서 근거 자료용. 추측과 사실을 구분해 표기한다.

---

## 1. 기술 스택 적정성 분석

| 기술 | 왜 썼나 (추정) | 대안 | 이 프로젝트 규모에 적정한가 | 판정 |
|------|---------------|------|--------------------------|------|
| **React 19** | Concurrent 모드, 자동 배칭, 최신 패턴 학습 | Preact (번들 크기 절감) | 적정. React 19 기능(자동 배칭 등)이 실제 렌더 사이클에서 활용됨 | ✅ |
| **Vite 7** | HMR 빠름, ESM 기반, 환경변수 분리 | CRA (구식), Parcel | 적정. `manualChunks`, Vite 플러그인(`inject-lcp-preload`) 등 빌드 기능 실제 사용 | ✅ |
| **TypeScript 5 strict** | 외부 API 응답·인증 흐름 타입 보호 | JS + JSDoc | 적정. Supabase·카카오 응답을 도메인 타입으로 명시적 캐스팅 (`data as BoardGame[]`) | ✅ |
| **Tailwind CSS 4** | 다크 모드·반응형 일관 적용 | CSS Modules, styled-components | 적정. 디자인 토큰·다크 모드를 `@theme`·`dark:` 유틸리티로 통일 처리 | ✅ |
| **TanStack Query 5** | 캐시·재시도·무효화 일관 처리 | SWR, 순수 fetch + useState | **부분 적정**. `useQuery` + `staleTime` + `retry` + `invalidateQueries`는 실제 사용됨 (`ReviewCreate.tsx:67`, `main.tsx:27`). 그러나 `Reviews.tsx`는 리뷰·보드게임·프로필을 3개 쿼리로 수동 조인해 단순 fetch 래퍼 수준에 머무름 | ⚠️ |
| **Zustand 5** | 인증·테마 전역 상태 | React Context + useReducer | 적정. `authStore`(user·session·nickname)와 `themeStore`(다크모드 영속)는 진짜 크로스-컴포넌트 상태가 필요한 범위. prop drilling 없이 Layout·Header 등에서 직접 구독 | ✅ |
| **React Router 7** | SPA 라우팅 표준, 데이터 라우팅 지원 | v6 (데이터 라우팅 동일) | **과사용 소지**. `loader`/`action` 데이터 라우팅 기능 미사용. 단순 `<Route>` + `lazy()` + `<Suspense>` 선언만 존재 (`App.tsx:6-16`). v6와 사용 방식 차이 없음. "App Router급 지원"을 선택 이유로 들었지만 실제로 활용하지 않아 주장이 약해짐 | ⚠️ |
| **@supabase/supabase-js** | Auth + Postgres + RLS 한 번에 | Firebase, PocketBase | 적정. anon key + sessionStorage로 RLS에 권한 위임 (`supabase.ts:12-18`). 별도 백엔드 없이 인증·CRUD 처리 | ✅ |
| **카카오 Local API + Map SDK** | 한국 지역 검색, 무료 한도 | Google Maps, Naver Maps | 적정. 동적 스크립트 로드(`useKakaoMapScript.ts`), REST API 분리(`kakao.ts`), 커스텀 오버레이 등 SDK 핵심 기능 활용 | ✅ |

**총평**: 스택 선택 자체는 대부분 합리적이다. 약점은 두 가지다.  
① TanStack Query를 쓰면서 조인 쿼리를 직접 구현해 라이브러리 장점을 충분히 살리지 못함.  
② React Router 7의 선택 이유(데이터 라우팅)를 정작 코드에서 구현하지 않아 스택 선택 근거가 약함.

---

## 2. 주장 ↔ 코드 불일치 목록

| # | 주장 문구 (README / 이력서) | 코드 실제 | 근거 파일:라인 | 판정 |
|---|--------------------------|----------|--------------|------|
| 1 | **"모든 `<img>`에 `width`·`height` 명시"** | HeroSlider 첫 이미지만 `width={1200} height={900}` 지정. `GameCard.tsx`와 `Reviews.tsx`의 썸네일·리뷰 이미지에는 width/height 없음 | `HeroSlider.tsx:241` (있음) · `GameCard.tsx:27` (없음) · `Reviews.tsx:263-265` (없음) | ❌ 불일치 |
| 2 | **환경변수 `VITE_KAKAO_MAP_KEY`** | 코드는 `VITE_KAKAO_JAVASCRIPT_KEY`를 읽음. `VITE_KAKAO_MAP_KEY`를 `.env.local`에 설정해도 지도가 동작하지 않음 | `useKakaoMapScript.ts:4` · `kakao.ts:107` · `README.md:220` · `CLAUDE.md` 환경변수 목록 | ❌ 불일치 (문서-코드 키 이름 불일치) |
| 3 | **"LCP 44.3s→6.0s, CLS 0.362→0, JS 8.4MB→968KB"** | Lighthouse 리포트·스크린샷 파일이 repo에 없음. 수치를 재현·검증할 근거 자료가 README 텍스트 외에 없음 | `README.md:24-28` · repo 루트 (근거 파일 부재) | ⚠️ 주장만 존재 (측정 근거 없음) |
| 4 | **"React Router 7 — App Router급 데이터 라우팅까지 지원"** (선택 이유) | `loader`/`action` 사용 없음. `<Route path="..." element={...} />` 단순 선언만 사용 | `App.tsx:29-41` | ⚠️ 주장 약함 (지원하지만 미사용) |
| 5 | **"카카오맵 SDK를 `/cafes` 진입 시점에만 동적 삽입"** | `Cafes.tsx`가 lazy-load되고, mount 시 `useKakaoMapScript`가 `<script>` 태그를 동적으로 `document.head`에 삽입 | `Cafes.tsx:19` · `useKakaoMapScript.ts:16-30` | ✅ 일치 |
| 6 | **"Vite manualChunks로 vendor 청크 분리"** | `vite.config.ts`에 `vendor-react`, `vendor-router`, `vendor-query`, `vendor-supabase` 4개 청크 명시 | `vite.config.ts:28-34` | ✅ 일치 |
| 7 | **"invalidateQueries로 작성 후 목록 동기화"** | `createReviewMutation.onSuccess`에서 `queryClient.invalidateQueries({ queryKey: ["reviews"] })` 호출 | `ReviewCreate.tsx:67` | ✅ 일치 |
| 8 | **"세션 sessionStorage (탭 닫으면 로그아웃)"** | `createClient` 옵션에 `storage: window.sessionStorage` 명시 | `supabase.ts:16` | ✅ 일치 |
| 9 | **"VITE_ALLOW_REVIEW_CREATE 플래그로 등록 비활성화"** | 플래그 미설정 시 submit에서 Supabase insert 호출 없이 안내 문구 표시 | `featureFlags.ts:6-7` · `ReviewCreate.tsx:45-48, 79-82` | ✅ 일치 |
| 10 | **"히어로 첫 이미지 fetchpriority + preload"** | 빌드 시 Vite 플러그인이 `<link rel="preload">` 주입, 첫 슬라이드 img에 `fetchPriority="high"` | `vite.config.ts:14-23` · `HeroSlider.tsx:244` | ✅ 일치 |
| 11 | **TanStack Query — "캐시·재시도·무효화 일관 처리"** | 전역 `retry: 2`, `retryDelay` 지수 백오프, `staleTime: 5min` 설정됨. 그러나 `Reviews.tsx`의 조인 로직은 수동 다중 쿼리로 구현돼 Query 캐시 이점을 부분적으로만 활용 | `main.tsx:12-19` · `Reviews.tsx:31-113` | ⚠️ 부분 일치 |

---

## 3. 리팩토링 우선순위표

> 기준: ① 이력서/README 주장을 사실로 만드는 것 > ② 측정 가능한 개선 > ③ 단순 정리

| 순위 | 항목 | 이유 | 예상 난이도 | 기대 효과 |
|------|------|------|------------|----------|
| **1** | `GameCard.tsx`, `Reviews.tsx` 이미지에 `width`·`height` 추가 | README "모든 img에 width·height 명시" 주장을 사실로 만들어 CLS 방어 완성 | 낮음 | CLS 추가 방어, README 주장 사실화 |
| **2** | `VITE_KAKAO_MAP_KEY` → `VITE_KAKAO_JAVASCRIPT_KEY` 환경변수 이름 통일 | 문서대로 설정 시 지도가 동작하지 않는 버그 수준의 불일치. CLAUDE.md·README 동기화 필요 | 낮음 | 로컬 개발 세팅 오류 차단 |
| **3** | Lighthouse 측정 스크린샷·리포트를 repo에 추가 | 성능 수치 주장의 근거 자료 부재. 면접 질문 "어떻게 측정했나"에 근거 제시 가능 | 중간 (재측정 필요) | 이력서 신뢰도 향상 |
| **4** | `Reviews.tsx` 수동 조인 → Supabase PostgREST 관계 쿼리 리팩토링 | 현재 3번 개별 쿼리 → 1번 쿼리로 단순화 가능. TanStack Query "일관 처리" 주장 강화 | 중간 | 네트워크 왕복 감소, 코드 간결화 |
| **5** | React Router 7 `loader` 도입 또는 선택 이유 수정 | 스택 선택 이유가 코드로 증명되지 않음. 한 라우트라도 loader 적용하면 주장 사실화 | 중간 | 이력서 "데이터 라우팅 활용" 근거 생성 |
| **6** | `useKakaoMapScript.ts` 환경변수 변수명 정리 (`JS_KEY` 리네임) | 코드 내 변수명이 문서와 혼선을 주는 보조 문제 | 낮음 | 가독성 개선 |
