# 보드게임 추천 플랫폼 - Supabase + Maps API 통합

## 프로젝트 개요

**핵심 아이디어:**

- 보드게임 정보: Supabase에 직접 입력 (데이터베이스 설계 경험)
- 보드게임 카페 검색: Kakao Local API로 검색 → Mapbox로 UI 표시 (외부 API 통합 경험)

**왜 이 조합인가?**

- Kakao Local API: 한국 지역 검색에 강함, REST API로 깔끔하게 데이터만 받기
- Mapbox: 예쁜 UI, React 통합 우수, 커스터마이징 자유로움
- WGS84 좌표계 공통 사용 → 변환 불필요

## 기술 스택

### Backend

- **Supabase**
  - Auth (회원가입/로그인)
  - Database (보드게임 정보, 리뷰, 평점)
  - Storage (이미지 업로드)
  - Realtime (실시간 업데이트)

### Frontend

- **React 19+ + TypeScript**
- **React Query** (TanStack Query) - 서버 상태 관리
- **Zustand** - 클라이언트 상태 관리
- **React Router** - 라우팅
- **Styled-components** 또는 **Tailwind CSS**

### Maps API (혼용)

- **Kakao Local API** (REST API)
  - 장소 검색 (보드게임 카페)
  - 좌표 데이터 받아오기
  - fetch/axios로 깔끔하게 데이터만 받기
- **Mapbox GL JS** (`react-map-gl`)
  - 지도 UI 표시
  - 마커 표시
  - 커스터마이징된 디자인

### Deployment

- **Vercel** 또는 **Netlify**

## 프로젝트 기능 명세

### 1. 보드게임 정보 관리 (Supabase)

- 보드게임 목록 조회
- 보드게임 상세 정보
- 카테고리별 분류 (전략, 파티, 협력 등)
- 검색 기능 (이름, 설명, 태그)
- 필터링 (인원수, 플레이 시간, 난이도)
- 리뷰 및 평점 시스템
- 즐겨찾기 기능

### 2. 보드게임 카페 검색 (Kakao Local API + Mapbox)

**검색 흐름:**

1. 사용자가 "주변 보드게임 카페 찾기" 클릭
2. Kakao Local API로 "보드게임 카페" 검색
3. 좌표 데이터 받아오기 (fetch/axios)
4. Mapbox로 지도에 마커 표시
5. 카페 정보 표시 (이름, 주소, 전화번호)

**기능:**

- 키워드 검색 ("보드게임 카페", "보드게임방")
- 위치 기반 검색 (현재 위치 기준)
- 거리 기반 정렬
- 카페 상세 정보 모달
- 카페 리뷰 연동 (Supabase)

### 3. 사용자 기능 (Supabase)

- 회원가입/로그인 (이메일, 소셜 로그인)
- 프로필 관리
- 리뷰 작성/수정/삭제
- 즐겨찾기
- 실시간 알림

## 데이터베이스 스키마 설계

### 기존 테이블 (보드게임 관련)

1. **users** (Supabase Auth 자동 생성)

   - id (UUID)
   - email
   - created_at

2. **profiles** (사용자 프로필)

   - id (UUID, users.id 참조)
   - username
   - avatar_url
   - bio
   - created_at
   - updated_at

3. **boardgames** (보드게임 정보)

   - id (UUID)
   - name (VARCHAR)
   - description (TEXT)
   - category (VARCHAR) - 전략, 파티, 협력 등
   - min_players (INTEGER)
   - max_players (INTEGER)
   - play_time (INTEGER) - 분 단위
   - difficulty (INTEGER) - 1-5
   - image_url (TEXT)
   - created_at
   - updated_at

4. **reviews** (리뷰)

   - id (UUID)
   - boardgame_id (UUID, boardgames.id 참조)
   - user_id (UUID, users.id 참조)
   - rating (INTEGER) - 1-5
   - content (TEXT)
   - created_at
   - updated_at

5. **review_likes** (리뷰 좋아요)

   - id (UUID)
   - review_id (UUID, reviews.id 참조)
   - user_id (UUID, users.id 참조)
   - created_at

6. **comments** (댓글)

   - id (UUID)
   - review_id (UUID, reviews.id 참조)
   - user_id (UUID, users.id 참조)
   - content (TEXT)
   - created_at
   - updated_at

7. **favorites** (즐겨찾기)
   - id (UUID)
   - boardgame_id (UUID, boardgames.id 참조)
   - user_id (UUID, users.id 참조)
   - created_at

### 추가 테이블 (카페 관련)

8. **cafes** (보드게임 카페 정보)

   - id (UUID)
   - name (VARCHAR) - 카페 이름
   - address (VARCHAR) - 주소
   - phone (VARCHAR) - 전화번호
   - latitude (DOUBLE PRECISION) - 위도
   - longitude (DOUBLE PRECISION) - 경도
   - kakao_place_id (VARCHAR) - Kakao API place_id (중복 방지)
   - created_at
   - updated_at

9. **cafe_reviews** (카페 리뷰)
   - id (UUID)
   - cafe_id (UUID, cafes.id 참조)
   - user_id (UUID, users.id 참조)
   - rating (INTEGER) - 1-5
   - content (TEXT)
   - created_at
   - updated_at

## Row Level Security (RLS) 정책

### 보안 규칙 예시

1. **profiles**

   - 모든 사용자가 읽기 가능
   - 본인만 수정 가능

2. **boardgames**

   - 모든 사용자가 읽기 가능
   - 관리자만 생성/수정/삭제 가능 (초기에는 모든 사용자 허용 가능)

3. **reviews**

   - 모든 사용자가 읽기 가능
   - 로그인한 사용자만 생성 가능
   - 본인만 수정/삭제 가능

4. **review_likes**

   - 로그인한 사용자만 생성 가능
   - 본인만 삭제 가능

5. **comments**

   - 모든 사용자가 읽기 가능
   - 로그인한 사용자만 생성 가능
   - 본인만 수정/삭제 가능

6. **favorites**

   - 본인만 읽기/생성/삭제 가능

7. **cafes**

   - 모든 사용자가 읽기 가능
   - 로그인한 사용자만 생성 가능 (Kakao API에서 가져온 데이터 저장)

8. **cafe_reviews**
   - 모든 사용자가 읽기 가능
   - 로그인한 사용자만 생성 가능
   - 본인만 수정/삭제 가능

## Maps API 통합 구현

### 1. Kakao Local API 설정

**필요한 것:**

- Kakao Developers 계정 생성
- REST API 키 발급
- 환경 변수 설정 (`.env`)

**API 사용:**

```typescript
// Kakao Local API - 키워드로 장소 검색
const searchCafes = async (keyword: string, lat?: number, lng?: number) => {
  const response = await fetch(
    `https://dapi.kakao.com/v2/local/search/keyword.json?query=${keyword}&x=${lng}&y=${lat}&radius=5000`,
    {
      headers: {
        Authorization: `KakaoAK ${process.env.VITE_KAKAO_REST_API_KEY}`,
      },
    }
  );
  const data = await response.json();
  return data.documents; // 좌표, 주소, 이름 등 포함
};
```

**받아오는 데이터:**

- place_name (카페 이름)
- address_name (주소)
- road_address_name (도로명 주소)
- phone (전화번호)
- x (경도)
- y (위도)
- place_url (카카오맵 링크)

### 2. Mapbox 설정

**필요한 것:**

- Mapbox 계정 생성
- Access Token 발급
- `react-map-gl` 라이브러리 설치

**Mapbox Studio 커스터마이징:**

- 보드게임 느낌의 색감 적용
- 커스텀 폰트 적용
- 포트폴리오 퀄리티 향상

**구현:**

```typescript
import Map, { Marker, Popup } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Kakao API에서 받은 좌표를 Mapbox에 표시
<Map
  mapboxAccessToken={process.env.VITE_MAPBOX_ACCESS_TOKEN}
  style="mapbox://styles/your-username/your-style-id"
  // ... 기타 설정
>
  {cafes.map((cafe) => (
    <Marker key={cafe.id} longitude={cafe.longitude} latitude={cafe.latitude}>
      <Popup>
        {cafe.name}
        {cafe.address}
      </Popup>
    </Marker>
  ))}
</Map>;
```

### 3. 좌표계 확인

- **Kakao Local API**: WGS84 (표준 위경도)
- **Mapbox**: WGS84 (표준 위경도)
- **결론**: 별도 변환 불필요, 그대로 사용 가능

## 구현 단계

### Week 1: 기본 설정 및 인증

- [ ] Supabase 프로젝트 생성
- [ ] 데이터베이스 스키마 설계 (보드게임 + 카페 테이블)
- [ ] React 프로젝트 설정 (Vite + TypeScript)
- [ ] Supabase 클라이언트 설정
- [ ] 인증 시스템 구현
- [ ] Kakao Developers 계정 생성 및 API 키 발급
- [ ] Mapbox 계정 생성 및 Access Token 발급

### Week 2: 보드게임 CRUD 및 Maps API 통합

- [ ] 보드게임 목록/상세 페이지
- [ ] 검색 및 필터링 기능
- [ ] 초기 보드게임 데이터 입력 (10-20개)
- [ ] Kakao Local API 통합
  - 장소 검색 함수 구현
  - 에러 핸들링
  - API 키 환경 변수 관리
- [ ] Mapbox 기본 설정
  - `react-map-gl` 설치 및 설정
  - 기본 지도 표시

### Week 3: Maps UI 및 리뷰 시스템

- [ ] Mapbox UI 구현
  - Kakao API 데이터를 Mapbox에 표시
  - 마커 표시
  - 팝업 정보 표시
  - Mapbox Studio 커스터마이징
- [ ] 카페 상세 정보 모달
- [ ] 리뷰 시스템 구현 (보드게임 + 카페)
- [ ] 평점 시스템
- [ ] RLS 정책 설정

### Week 4: 고급 기능 및 완성도

- [ ] Supabase Storage (이미지 업로드)
- [ ] Supabase Realtime (실시간 업데이트)
- [ ] 위치 기반 검색 (현재 위치 기준)
- [ ] 거리 계산 및 정렬
- [ ] UI/UX 개선
- [ ] 반응형 디자인
- [ ] 에러 핸들링 강화

### Week 5: 배포 및 문서화

- [ ] 코드 리팩토링
- [ ] 성능 최적화
- [ ] 환경 변수 설정 (프로덕션)
- [ ] Vercel/Netlify 배포
- [ ] README 작성
- [ ] 프로젝트 설명 문서

## 환경 변수 설정

```env
# Supabase
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Kakao Local API
VITE_KAKAO_REST_API_KEY=your-kakao-rest-api-key

# Mapbox
VITE_MAPBOX_ACCESS_TOKEN=your-mapbox-access-token
```

## 주의사항

1. **API 키 보안**

   - 환경 변수로 관리
   - GitHub에 올리지 않기 (`.gitignore`)
   - 프로덕션 환경에서도 안전하게 관리

2. **Rate Limiting**

   - Kakao Local API는 일일 요청 제한 있음
   - 에러 핸들링 및 재시도 로직 구현

3. **좌표계**

   - Kakao와 Mapbox 모두 WGS84 사용
   - 변환 불필요하지만 확인은 필요

4. **Mapbox Studio**
   - 커스텀 스타일 미리 디자인
   - 보드게임 느낌의 색감/폰트 적용
   - 포트폴리오 퀄리티 향상

## 초기 데이터 준비

**보드게임 데이터 예시 (10-20개):**

- 카탄의 개척자들
- 뱅
- 다빈치 코드
- 할리갈리
- 스플렌더
- 코드네임
- 아그리콜라
- 포르투갈
- 타이탄
- 7원더스

각 보드게임에 대한 정보:

- 이름, 설명, 카테고리
- 인원수, 플레이 시간
- 난이도
- 이미지 URL

## 학습 포인트

### Supabase 경험

- 데이터베이스 설계 및 관리
- 인증 시스템
- 파일 업로드
- 실시간 기능
- 보안 정책 (RLS)

### 외부 API 통합 경험

- REST API 호출 (Kakao Local API)
- API 키 관리 (환경 변수)
- 비동기 데이터 처리
- 에러 핸들링
- Rate Limiting 이해

### Maps API 경험

- 두 API 혼용 (검색 + UI)
- 좌표계 이해
- 지도 컴포넌트 사용
- 커스터마이징

## 최종 목표

취업 면접에서 자신 있게 말할 수 있는:

✅ **"Supabase를 사용해 실제 서버와 통신하는 프로젝트를 만들었습니다"**

- 인증, 데이터베이스, 파일 업로드, 실시간 기능 구현

✅ **"외부 API를 통합하여 지도 기능을 구현했습니다"**

- Kakao Local API로 장소 검색
- Mapbox로 지도 UI 표시
- 두 API를 혼용하여 최적의 사용자 경험 제공

✅ **"실무에서 필요한 API 통합 경험을 쌓았습니다"**

- REST API 호출 및 데이터 처리
- API 키 관리 및 보안
- 에러 핸들링 및 Rate Limiting 대응

## 결론

Kakao Local API + Mapbox 조합은 실무에서도 사용되는 방식입니다. 이 프로젝트를 통해:

- Supabase 전체 기능 경험
- 외부 API 통합 경험
- Maps API 활용 경험

을 모두 쌓을 수 있습니다.
