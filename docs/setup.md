# BuildLog 개발 환경

## 1. 문서 상태

이 문서는 Phase 0에서 만든 개발 환경 초안에 Phase 1의 설치·실행 방법을 추가한 문서입니다. Phase 14에서 최종 완성합니다.

## 2. Phase 0 확인 결과

확인일: 2026-10-26

| 항목 | 확인 결과 |
| --- | --- |
| Node.js | `v24.22.1` |
| npm | `11.19.1` (`npm.cmd`로 실행) |
| Python | `3.13.14` |
| Python SQLite | `3.50.4` |
| React 개발 포트 | `5173` 사용 가능 |
| FastAPI 개발 포트 | `8000` 사용 가능 |
| Supabase 연결 | Phase 13 전까지 필요 없음 |

PowerShell에서는 실행 정책 때문에 `npm`이 `npm.ps1`로 실행되지 않을 수 있습니다. 시스템 설정을 바꾸지 않고 `npm.cmd`를 사용합니다.

## 3. 로컬 개발 주소

| 대상 | 주소 |
| --- | --- |
| React | `http://localhost:5173` |
| FastAPI | `http://localhost:8000` |
| FastAPI 상태 확인 | `http://localhost:8000/health` |

상태 확인 주소는 Phase 1에서 구현합니다.

## 4. 환경 변수 이름

실제 환경 변수 파일은 Phase 1에서 만듭니다. `.env.example`에는 아래 이름과 안전한 예시만 기록하고 실제 비밀값은 `.env`에만 둡니다.

| 이름 | 용도 | Phase 0 기준 |
| --- | --- | --- |
| `APP_ENV` | 개발·테스트·운영 환경 구분 | 로컬은 `development` |
| `DATABASE_URL` | SQLite 또는 Supabase PostgreSQL 연결 주소 | 로컬은 SQLite, 운영은 Supabase |
| `AUTH_SECRET_KEY` | 로그인 정보를 보호하는 비밀 키 | 실제 값 공개 금지 |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | 로그인 유지 시간 | Phase 3에서 값 확정 |
| `FRONTEND_ORIGIN` | FastAPI 호출을 허용할 React 주소 | 로컬은 `http://localhost:5173` |
| `VITE_API_BASE_URL` | React가 호출할 FastAPI 주소 | 로컬은 `http://localhost:8000` |

## 5. 데이터베이스 사용 기준

- 로컬 개발과 자동 테스트에서는 SQLite 3를 사용합니다.
- 자동 테스트는 각각 독립된 SQLite DB를 사용해 서로 영향을 주지 않게 합니다.
- 실제 서비스에서는 Supabase PostgreSQL을 사용합니다.
- SQLite와 Supabase에는 같은 Alembic 변경 이력을 적용합니다.
- Supabase 연결 문자열과 비밀번호는 문서나 Git 기록 대상 파일에 넣지 않습니다.

## 6. 아직 수행하지 않은 작업

- SQLite 파일 생성
- 실제 값을 넣은 `.env` 생성
- Supabase 프로젝트 생성 및 연결
- Git 초기화와 커밋

위 작업들은 계획한 Phase에 맞춰 하나씩 진행합니다.

## 7. 프론트엔드 실행과 확인

PowerShell에서 다음 명령을 각각 실행합니다.

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

브라우저에서 `http://localhost:5173`을 엽니다.

프론트엔드 자동 확인 명령은 다음과 같습니다.

```powershell
cd frontend
npm.cmd test
npm.cmd run lint
npm.cmd run build
```

로컬 API 주소를 바꿔야 할 때는 `frontend/.env.example`을 참고해 `frontend/.env`에 `VITE_API_BASE_URL`을 설정합니다.

## 8. 백엔드 실행과 확인

처음 준비할 때 다음 명령을 실행합니다.

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
```

FastAPI 개발 서버는 다음 명령으로 실행합니다.

```powershell
cd backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

백엔드 자동 테스트는 다음 명령으로 실행합니다.

```powershell
cd backend
.\.venv\Scripts\python.exe -m pytest
```

서버 실행 후 `http://localhost:8000/health`에서 다음 응답을 확인할 수 있습니다.

```json
{"status":"ok","service":"buildlog-api"}
```

## 9. Phase 1 확인 결과

확인일: 2026-10-26

- 백엔드 테스트: 1개 통과
- 프론트엔드 테스트: 1개 통과
- 프론트엔드 코드 검사: 통과
- 프론트엔드 운영 빌드: 통과
- FastAPI `/health`: HTTP 200
- React 기본 페이지: HTTP 200
- 허용된 React 주소의 CORS 응답: 정상
- SQLite 파일과 Supabase 연결: 아직 생성하지 않음
