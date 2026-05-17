# VibeBoard — 프로젝트 가이드

보드게임 추천·후기·주변 카페 검색을 한 곳에서 제공하는 위치 기반 웹 SPA. Supabase 인증·RLS와 카카오 Local API·Map SDK를 활용하며, Lighthouse 측정 기반 성능 개선을 진행한 포트폴리오 프로젝트. 백엔드는 Supabase(Postgres) 실 서비스를 사용한다.

## 기술 스택

- 빌드: Vite 7 / 언어: TypeScript 5 (`strict`)
- UI: React 19, Tailwind CSS 4, React Router 7
- 상태: TanStack Query 5(서버 데이터·캐시), Zustand 5(인증·테마)
- BaaS: Supabase — Auth + Postgres + RLS (`@supabase/supabase-js`)
- 지도·장소: 카카오 Local API(REST) + Map JS SDK
- 배포: Vercel

## 코드 규칙

- CRITICAL: `any` 타입 금지. `src/types/`의 도메인 타입을 정확히 사용한다.
- CRITICAL: 외부 API 연동(Supabase·카카오)과 환경 분기는 `src/lib/` 레이어에서 처리한다. 컴포넌트에서 `import.meta.env`를 직접 분기하지 않는다 (환경 플래그는 `src/lib/featureFlags.ts`).
- 함수·컴포넌트 위에는 한 줄 한글 핵심 주석을 단다(15자 내외). 당연한 내용은 주석 금지.
- 에러가 날 수 있는 경계(네트워크·입력·외부 SDK 로드)에는 방어 코드를 둔다.
- 디렉터리: 공통 UI는 `src/components/`, 라우트 페이지는 `src/pages/`, 전역 상태는 `src/stores/`, 커스텀 훅은 `src/hooks/`, 타입은 `src/types/`에 둔다.
- 코드 수정 후 타입 에러·린트 경고가 없는지 반드시 확인한다 (`npm run build`, `npm run lint`).

## 명령어

```
npm run dev      # 개발 서버 (localhost:5173)
npm run build    # 타입 체크 + 프로덕션 빌드 (tsc -b && vite build)
npm run lint     # ESLint
npm run preview  # 빌드 결과 미리보기
```

환경 변수는 `.env.local`에 둔다: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_KAKAO_REST_API_KEY`, `VITE_KAKAO_JAVASCRIPT_KEY`, `VITE_ALLOW_REVIEW_CREATE`.

## 커밋·푸시 규칙

커밋 메시지는 작업 종류에 따라 아래 형식을 **반드시** 따른다.

| 작업 종류 | 형식 | 예시 |
|-----------|------|------|
| 새 파일 생성 | `feat. <무엇> 구현` | `feat. ProtectedRoute 구현` |
| 파일 수정 | `fix. <무엇> 수정` | `fix. ReviewsPage URL 상태 수정` |
| 리팩토링 | `refactor. <무엇> 변경` | `refactor. API 분기 추상화 변경` |

- 커밋 후 항상 `git push`로 원격 브랜치에 반영한다.
- Co-Authored-By 서명은 붙이지 않는다.
- 한 번의 작업에 여러 파일이 섞이면 가장 대표적인 변경 종류의 형식을 쓴다.
- 메시지는 한글로 작성한다.

## 작업 워크플로우 — 하네스 (중요)

이 프로젝트는 진단·리팩토링을 **하네스로 반자동 진행**할 수 있다. 하네스 정의는 `.claude/harness/`에 있다(`gy_harness_framework`의 `value_refactor` 팩을 이식).

- **흐름·시작 방법**: `.claude/harness/README.md`에 전체 흐름·시작 방법·폴더 구조가 사람이 읽기 쉽게 정리돼 있다. 새 세션은 먼저 이 문서를 읽는다.
- **실행**: `python .claude/harness/engine/run.py value_refactor` 한 줄이면 5개 phase의 모든 step이 끝까지 자동 실행된다. step마다 새 `claude -p` 프로세스로 실행돼 컨텍스트가 초기화되고, 연속성은 코드 파일·git 커밋·`index.json`의 step `summary`로 유지된다.
- **가드레일**: 하네스는 이 `CLAUDE.md`를 각 step 프롬프트에 프로젝트 컨텍스트로 주입한다 (`manifest.json`의 `guardrails` 필드). 따라서 이 문서는 항상 실제 프로젝트 상태와 일치해야 한다.
- **진행 현황**: 최초 실행 시 `.claude/harness/runtime/value_refactor/`가 자동 생성된다. `PROGRESS.md`(step 종료마다 갱신되는 체크리스트)로 진행 상황을 보고, 원본 상태는 `runtime/value_refactor/index.json` 및 각 `runtime/value_refactor/phases/{phase}/index.json`에 있다.
- **phase 순서**: `diagnosis` → `refactor` → `test` → `measure` → `resume-docs`. 각 step 지시는 `.claude/harness/workflows/value_refactor/phases/{phase}/step{N}.md`에 자기완결적으로 있다 (`refactor` phase는 `fixed` step 없이 `templates/refactor-step.md`로 동적 생성).
- **멈췄을 때**: error(3회 재시도 후 실패)/blocked(브라우저 측정·이력서 승인 등 사람 개입 필요)면 `runtime/value_refactor/NOTES.md`에 사유·재개법이 기록되고 실행이 멈춘다. 해결 후 해당 step status를 `runtime/value_refactor/phases/{phase}/index.json`에서 `pending`으로 되돌리고 다시 `python .claude/harness/engine/run.py value_refactor`를 실행한다.
- **diagnosis.md**: 진단 결과는 repo 루트 `diagnosis.md`에 기록된다(면접·이력서 근거 자료).
- `.claude/harness/runtime/` 산출물은 실행 시 생성되는 프로젝트별 상태이므로 git 추적 대상이 아니다(재사용 원천은 `gy_harness_framework` repo에서 관리).

## 유지보수 규칙

- 하네스 구조(phase·step·파일 위치 등)나 프로젝트 구조가 바뀌면 **이 `CLAUDE.md`를 같은 작업에서 함께 갱신**한다. 문서가 실제 구조와 어긋나면 안 된다.
- `.claude/rules/`에는 LLM의 잘못된 코드 생성을 막기 위한 보조 지침(`karpathy-guidelines.md` 등)이 있다. 대화형 Claude Code 세션에서 자동 적용되며, 이 `CLAUDE.md`와 충돌하지 않게 유지한다.
