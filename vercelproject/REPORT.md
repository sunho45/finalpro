# Serverless 실습 레포트

## 1. 프로젝트 주제

Gemini API를 활용한 강의 기반 학습 가이드 생성 서비스

이 프로젝트는 강의 제목, 핵심 내용, 난이도, 실습 초점을 입력받아 Gemini API가 학습 요약, 핵심 개념, 실습 단계, 확인 퀴즈를 생성하도록 구현했다. 프론트엔드는 React-Vite로 로컬에서 실행하고, 백엔드는 Vercel Serverless Function으로 배포하여 역할을 분리했다.

## 2. 사용 기술

- Frontend: React, Vite
- Backend: Vercel Serverless Function
- External API: Gemini API
- Environment Variables: `GEMINI_API_KEY`, `FRONTEND_ORIGIN`, `VITE_VERCEL_API_BASE_URL`

## 3. 서비스 동작 흐름

1. 사용자가 로컬에서 실행 중인 React 화면에 강의 정보를 입력한다.
2. 프론트엔드는 배포된 Vercel API 주소로 `POST` 요청을 보낸다.
3. Vercel Serverless Function은 브라우저가 아닌 서버 환경에서 `GEMINI_API_KEY`를 읽는다.
4. 서버리스 함수는 Gemini API `generateContent` 엔드포인트를 호출한다.
5. Gemini가 반환한 JSON 형식의 학습 가이드를 정리해 프론트엔드에 응답한다.
6. 프론트엔드는 응답 데이터를 화면에 렌더링한다.

이 구조를 사용하면 API Key가 브라우저에 노출되지 않고, 프론트엔드와 외부 API 사이에 백엔드 계층을 둘 수 있다.

## 4. Serverless 구조를 사용한 이유

- 별도의 전통적인 서버를 직접 운영하지 않아도 된다.
- API 요청 단위로 함수가 실행되어 구조가 단순하다.
- Vercel 배포와 연동이 쉬워 빠르게 실습 결과를 확인할 수 있다.
- 환경변수를 서버 측에 안전하게 저장할 수 있다.

## 5. Environment Variables 관리 방법

### Vercel 서버 환경변수

- `GEMINI_API_KEY`: Gemini API 인증에 사용
- `FRONTEND_ORIGIN`: CORS 허용 대상 프론트엔드 주소

### 로컬 프론트엔드 환경변수

- `VITE_VERCEL_API_BASE_URL`: 배포된 Vercel 백엔드 주소

프론트엔드에는 Gemini API Key를 두지 않고, Vercel 서버리스 함수만 키를 사용하도록 구성했다.

## 6. 구현 중 발생 가능한 문제와 원인

### 문제 1. 브라우저에서 Gemini API를 직접 호출하면 API Key가 노출될 수 있음

- 원인: 브라우저 코드 안에 API Key를 넣으면 개발자 도구나 번들 파일에서 확인 가능하다.
- 해결: Gemini 호출은 Vercel Serverless Function에서만 수행하고, 프론트엔드는 Vercel API만 호출하도록 분리했다.

### 문제 2. 로컬 프론트엔드에서 Vercel API 호출 시 CORS 오류 발생 가능

- 원인: 프론트엔드와 백엔드의 Origin이 다르기 때문이다.
- 시도한 방안:
  1. 서버리스 함수 응답 헤더에 `Access-Control-Allow-Origin` 추가
  2. `OPTIONS` 프리플라이트 요청 처리
  3. 필요 시 `FRONTEND_ORIGIN` 환경변수로 허용 주소 제한

### 문제 3. Gemini 응답이 항상 일정한 구조의 JSON이 아닐 수 있음

- 원인: 생성형 AI는 프롬프트가 모호하면 설명문이나 코드블록을 함께 반환할 수 있다.
- 시도한 방안:
  1. 프롬프트에 `JSON으로만 반환` 조건 명시
  2. `overview`, `keyPoints`, `practiceSteps`, `quiz` 키를 강제
  3. `responseMimeType: application/json` 설정
  4. 코드블록이 섞이는 경우를 대비해 후처리 로직 추가

### 문제 4. Vercel에 배포했지만 로컬 프론트엔드에서 잘못된 주소를 호출할 수 있음

- 원인: `VITE_VERCEL_API_BASE_URL` 값이 실제 배포 주소와 다를 수 있다.
- 시도한 방안:
  1. `.env.local`에 Vercel 주소를 명확히 설정
  2. 요청 URL을 `BASE_URL + /api/generate-study-guide` 형태로 고정
  3. 배포 후 실제 endpoint를 브라우저와 네트워크 탭에서 검증

## 7. 실습을 통해 이해한 점

- React-Vite는 사용자 입력과 렌더링을 담당하는 클라이언트 역할을 수행한다.
- Vercel Serverless Function은 외부 API를 대신 호출하는 안전한 중간 계층 역할을 한다.
- 환경변수를 어디에 저장해야 하는지에 따라 보안 수준과 배포 방식이 달라진다.
- LLM 기반 서비스는 프롬프트 설계와 응답 형식 통제가 매우 중요하다.

## 8. 결론

이번 실습을 통해 로컬 프론트엔드와 서버리스 백엔드를 분리하는 구조를 구현했고, Gemini API를 안전하게 연동하는 방법을 확인했다. 특히 API Key를 서버 환경변수로 관리하고, 프론트엔드는 배포된 Vercel API만 호출하도록 구성하면서 Serverless 서비스의 전체 흐름을 구체적으로 이해할 수 있었다.
