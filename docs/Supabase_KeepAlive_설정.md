# Supabase 무료 플랜 잠금 방지 (GitHub Actions)

무료 플랜은 **7일 동안 활동이 없으면** 프로젝트가 일시정지됩니다.  
이 저장소의 GitHub Actions가 **매일 한 번** Supabase에 요청을 보내서 잠금을 막습니다.

## 1. GitHub 저장소에 시크릿 추가

1. GitHub에서 이 프로젝트 저장소 열기
2. **Settings** → **Secrets and variables** → **Actions**
3. **New repository secret** 로 아래 두 개 추가

| Name                | Value                                                            |
| ------------------- | ---------------------------------------------------------------- |
| `SUPABASE_URL`      | `.env`의 `VITE_SUPABASE_URL` 값 (예: `https://xxxx.supabase.co`) |
| `SUPABASE_ANON_KEY` | `.env`의 `VITE_SUPABASE_ANON_KEY` 값                             |

값은 **앞뒤 공백 없이**, 따옴표 없이 넣으면 됩니다.

## 2. 동작 확인

- **자동 실행**: 매일 UTC 00:00(한국 시간 09:00)에 실행됩니다.
- **수동 실행**: 저장소 **Actions** 탭 → **Keep Supabase active** → **Run workflow**

## 3. 테이블 이름이 다른 경우

워크플로에서 `boardgames` 테이블을 조회합니다.  
다른 테이블을 쓰고 있다면 `.github/workflows/keep-supabase-active.yml` 안의  
`/rest/v1/boardgames` 를 사용 중인 테이블명(예: `profiles`)으로 바꿔 주세요.
