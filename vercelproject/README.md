# Lecture Practice Guide

React-Vite 프론트엔드만 로컬에서 실행되고, 배포된 Vercel API가 Gemini API를 호출해 강의 기반 학습 가이드를 생성하는 예제 프로젝트입니다.

## 구조

- `src/`: 로컬에서 실행되는 React 프론트엔드
- `api/`: Vercel에 배포되는 Serverless Function
- `lib/`: Vercel 함수에서 사용하는 공통 로직
- `.env.example`: 환경변수 예시
- `REPORT.md`: 제출용 레포트 초안

## 실행 방법

1. `.env.example`를 참고해 `.env.local` 파일에 `VITE_VERCEL_API_BASE_URL`을 설정합니다.
2. `npm install`
3. `npm run dev`
4. 브라우저에서 `http://localhost:5173`에 접속합니다.

로컬 개발 환경에서는 프론트엔드가 `VITE_VERCEL_API_BASE_URL`에 지정한 배포 API의 `/api/generate-study-guide`를 호출합니다.
Vercel API 쪽에는 `GEMINI_API_KEY`, `FRONTEND_ORIGIN` 환경변수가 설정되어 있어야 합니다.

## 배포 흐름

1. 사용자가 로컬 React 화면에서 강의 정보를 입력합니다.
2. 프론트엔드가 `POST {VITE_VERCEL_API_BASE_URL}/api/generate-study-guide` 요청을 전송합니다.
3. Vercel Serverless Function이 `GEMINI_API_KEY`로 Gemini API를 호출합니다.
4. 생성된 JSON 응답을 프론트엔드가 카드 UI로 렌더링합니다.
