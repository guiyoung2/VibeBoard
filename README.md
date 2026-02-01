# VibeBoard

**보드게임 추천·후기·주변 매장 찾기**를 한 곳에서 할 수 있는 웹 서비스입니다.

- **배포**: [Vercel](https://vercel.com) (실제 동작은 배포 URL로 확인)
- **백엔드/DB·인증**: Supabase
- **지도/장소 검색**: 카카오 로컬 API · 카카오맵 JavaScript SDK

---

## 목차

- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [라이브러리 및 사용 이유](#라이브러리-및-사용-이유)
- [프로젝트 구조](#프로젝트-구조)
- [로컬 실행 방법](#로컬-실행-방법)
- [환경 변수](#환경-변수)
- [배포](#배포)
- [구현 상세](#구현-상세)

---

## 주요 기능

### 1. 게임 추천 (`/games`)

- Supabase에 저장된 **보드게임 목록** 조회
- 카드 형태로 게임명, 이미지, 카테고리·인원·플레이 시간 등 표시
- **게임 상세** (`/games/:id`): 상세 정보, 관련 리뷰 목록

### 2. 게임 후기 (`/reviews`)

- **전체 리뷰 목록** (보드게임별, 평점별 필터·정렬)
- **리뷰 상세** (`/reviews/:id`): 작성자, 평점, 내용, 수정/삭제(본인만)
- **리뷰 작성** (`/reviews/create`): 로그인 후 보드게임 선택·평점·내용 작성
  - 배포 환경에서는 **등록 비활성화** 가능 (환경 변수로 제어, 제출 시 경고 문구만 표시)

### 3. 주변 매장 찾기 (`/cafes`)

- **현재 위치 기준** 또는 **검색어(역·동 등) 기준**으로 주변 **보드게임 카페** 검색
- 카카오 로컬 API로 장소 검색 → 카카오맵에 마커(이름 라벨) 표시
- **페이지네이션**(1·2·3페이지, 최대 45건): 선택한 페이지만 지도·목록에 표시
- 결과 목록에서 페이지 전환 시 **목록 영역 스크롤 맨 위**로 이동

### 4. 인증·프로필

- **Supabase Auth**: 이메일·비밀번호, Google·GitHub 소셜 로그인
- **닉네임 설정** (최초 로그인 시 또는 프로필에서)
- **프로필** (`/profile`): 닉네임 수정, **내가 작성한 리뷰 목록** (설정 / 작성한 리뷰 탭)
- 세션 저장: **sessionStorage** (탭/창 닫으면 로그아웃)

### 5. 공통 UX

- **다크 모드**: localStorage에 저장, 전역 토글
- **반응형 레이아웃**: 모바일 햄버거 메뉴, 데스크톱 네비게이션
- **에러·로딩**: 전역 Error Boundary, 스켈레톤 UI, 네트워크 끊김 배너, 쿼리 실패 시 재시도 버튼
- **리뷰 작성 제어**: 환경 변수 `VITE_ALLOW_REVIEW_CREATE`로 로컬/배포에서 등록 허용 여부 분리

---

## 기술 스택

| 구분                | 기술                                     | 용도                                              |
| ------------------- | ---------------------------------------- | ------------------------------------------------- |
| **런타임·빌드**     | Node.js, Vite 7                          | 개발 서버·프로덕션 빌드                           |
| **언어**            | TypeScript                               | 타입 안정성·유지보수                              |
| **UI**              | React 19                                 | 컴포넌트·렌더링                                   |
| **스타일**          | Tailwind CSS 4                           | 유틸리티 기반 스타일·다크 모드                    |
| **라우팅**          | React Router 7                           | SPA 라우팅                                        |
| **서버 상태**       | TanStack Query (React Query) 5           | API·Supabase 데이터 페칭·캐시·재시도              |
| **클라이언트 상태** | Zustand                                  | 인증·테마·UI 상태                                 |
| **백엔드·DB·인증**  | Supabase                                 | PostgreSQL, Auth(이메일·소셜), Row Level Security |
| **지도·장소**       | 카카오 로컬 API, 카카오맵 JavaScript SDK | 장소 검색·지도 표시                               |
| **배포**            | Vercel                                   | 정적·SPA 배포                                     |

---

## 라이브러리 및 사용 이유

- **Vite**

  - 빠른 HMR, ESM 기반, `VITE_` 환경 변수로 클라이언트 설정 분리
  - CRA 대비 빌드·개발 경험을 위해 선택

- **React Query (TanStack Query)**

  - Supabase/API 데이터를 **캐시·백그라운드 갱신·로딩·에러** 한 곳에서 처리
  - `invalidateQueries`로 리뷰 작성 후 목록 갱신, 재시도·만료 시간 설정으로 네트워크 오류 대응

- **Zustand**

  - 인증(user, session, nickname)·테마(light/dark) 등 **전역 클라이언트 상태**를 가볍게 관리
  - 보일러플레이트 적고, 훅 형태로 사용하기 쉬워 선택

- **Tailwind CSS**

  - 유틸리티 클래스로 **반응형·다크 모드**를 일관되게 적용
  - `index.css`에서 `@theme`로 primary/accent 등 커스텀 색상 정의

- **Supabase**

  - **Auth**(이메일·Google·GitHub), **PostgreSQL**(boardgames, reviews, profiles), **RLS**로 테이블 단위 권한 제어
  - 백엔드 서버 없이 BaaS로 빠르게 구현하기 위해 사용

- **카카오 로컬 API · 카카오맵**
  - **한국 지역** 장소 검색·지도 표시에 적합
  - 로컬 API로 키워드·좌표 기반 검색, JavaScript SDK로 지도·커스텀 오버레이(마커 라벨) 구현

---

## 프로젝트 구조

```
src/
├── components/       # 공통 UI
│   ├── ErrorBoundary.tsx   # 전역 에러 처리
│   ├── GameCard.tsx
│   ├── HeroSlider.tsx      # 홈 인기 게임 슬라이더
│   ├── Layout.tsx          # 헤더·네비·다크모드·모바일 메뉴
│   ├── NetworkStatus.tsx   # 오프라인 배너
│   └── Skeleton.tsx       # 로딩 스켈레톤
├── lib/              # 외부 연동·설정
│   ├── featureFlags.ts    # VITE_ALLOW_REVIEW_CREATE 등
│   ├── kakao.ts           # 카카오 로컬 API 호출
│   └── supabase.ts        # Supabase 클라이언트
├── pages/            # 라우트별 페이지
│   ├── Home.tsx
│   ├── Games.tsx, GameDetail.tsx
│   ├── Reviews.tsx, ReviewDetail.tsx, ReviewCreate.tsx
│   ├── Cafes.tsx          # 주변 매장 지도
│   ├── Login.tsx, AuthCallback.tsx, NicknameSetup.tsx
│   └── Profile.tsx
├── stores/
│   ├── authStore.ts       # 인증·닉네임
│   └── themeStore.ts      # 다크 모드 (localStorage)
├── types/             # TypeScript 타입
├── App.tsx
└── main.tsx
```

---

## 배포

- **Supabase 무료 플랜**: 7일 비활성 시 프로젝트 일시정지 가능 → `.github/workflows/keep-supabase-active.yml`로 주기적 호출(예: 5일마다)해 잠금 방지

---

## 구현 상세

### 인증

- Supabase Auth 사용, **sessionStorage**에 세션 저장 (탭 닫으면 로그아웃)
- `authStore`(Zustand)에서 `user`, `session`, `nickname` 관리, `getSession` / `onAuthStateChange`로 동기화
- 로그인 후 닉네임 없으면 `/auth/setup-nickname`으로 유도

### 리뷰 작성 제어

- `featureFlags.ts`에서 `VITE_ALLOW_REVIEW_CREATE === "true"`일 때만 **실제 등록** 허용
- 배포에서 `false` 또는 미설정 시: 리뷰 작성 페이지·버튼은 보이지만, **제출 시** Supabase insert 없이 **경고 문구만** 표시

### 주변 매장 (카카오)

- **현재 위치**: `navigator.geolocation` → 좌표로 카카오 로컬 API 키워드 검색(보드게임카페, 반경 5km)
- **검색어**: 로컬 API로 검색어 좌표 1건 조회 후, 그 좌표 기준으로 동일 키워드 검색
- **페이지네이션**: API `page` 파라미터로 1·2·3페이지 요청, **선택한 페이지만** 지도·목록에 표시 (최대 45건)
- 지도는 카카오맵 JavaScript SDK, 마커는 **커스텀 오버레이**(이름 라벨)로 표시

### 에러·로딩

- **ErrorBoundary**: 렌더 단계 에러 시 fallback UI + 새로고침 버튼
- **NetworkStatus**: `navigator.onLine` 감지, 오프라인 시 상단 배너 + 재연결 시 쿼리 무효화
- **React Query**: 로딩 시 스켈레톤, 에러 시 안내 문구 + 재시도 버튼, `retry`/`retryDelay` 설정

---

## 문서

- `docs/에러_로딩_네트워크_기능_가이드.md`: 에러/로딩/네트워크 기능 설명
- `docs/Supabase_KeepAlive_설정.md`: GitHub Actions로 Supabase 무료 플랜 잠금 방지

---
