# 카카오 API 설정 (주변 매장 찾기)

주변 보드게임 매장 찾기 페이지는 **카카오 API만** 사용합니다.

## 브라우저 안내

- **Cursor 내장 브라우저**: 위치 권한·지도가 동작하지 않을 수 있습니다. **Chrome, Edge 등 외부 브라우저**에서 테스트하세요.
- **지도가 안 보일 때**: Kakao Developers에서 **사이트 도메인**을 등록해야 합니다 (아래 "사이트 도메인 등록" 참고).

## 필요한 키 (2개)

1. **REST API 키** – 장소 검색 (키워드 검색)
2. **JavaScript 키** – 지도 표시 (카카오맵)

[Kakao Developers](https://developers.kakao.com) → 내 애플리케이션 → 앱 키에서 확인할 수 있습니다.

## 환경 변수 (.env)

프로젝트 루트 `.env` 파일에 추가:

```env
# 카카오 REST API 키 (Local API - 장소 검색)
VITE_KAKAO_REST_API_KEY=여기에_REST_API_키

# 카카오 JavaScript 키 (지도 표시)
VITE_KAKAO_JAVASCRIPT_KEY=여기에_JavaScript_키
```

- **REST API 키**가 없으면: "현재 위치에서 검색" 시 "카카오 REST API 키가 설정되지 않았습니다" 메시지가 뜹니다.
- **JavaScript 키**가 없으면: 지도는 안 뜨고, 검색 결과 목록만 표시됩니다.

## 사이트 도메인 등록 (지도 표시 필수)

카카오맵은 **등록된 도메인**에서만 표시됩니다. 미등록 시 목록은 보이지만 지도가 빈 칸으로 나올 수 있습니다.

1. [Kakao Developers](https://developers.kakao.com) → **내 애플리케이션**
2. 사용 중인 앱 선택 → **앱 설정** → **플랫폼**
3. **Web** 플랫폼 추가(없다면) → **사이트 도메인**에 아래 추가 후 저장
   - 로컬: `http://localhost:5173` (Vite 기본 포트)
   - 배포: `https://vibeboard-nine.vercel.app` (실제 배포 주소로 변경)

## 배포 시 (Vercel 등)

Vercel → 프로젝트 → Settings → Environment Variables에 위 두 키를 그대로 추가한 뒤 재배포하세요.

## 동작 요약

- **현재 위치에서 검색**: 브라우저 위치 권한 허용 후, 현재 위치 기준 반경 5km 이내 "보드게임카페" 키워드 검색
- **지도**: 현재 위치 + 검색된 매장 마커 표시 (마커 클릭 시 카카오맵 상세 페이지로 이동)
- **목록**: 매장 이름, 주소, 거리, 전화번호 표시, 클릭 시 카카오맵 링크
