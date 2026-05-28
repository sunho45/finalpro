import { useState } from 'react';

const PLACEHOLDER_API_BASE_URL = 'https://your-vercel-project.vercel.app';
const configuredApiBaseUrl = import.meta.env.VITE_VERCEL_API_BASE_URL?.replace(/\/$/, '') ?? '';
const isBrowser = typeof window !== 'undefined';
const isLocalhost =
  isBrowser && ['localhost', '127.0.0.1'].includes(window.location.hostname);
const API_BASE_URL =
  configuredApiBaseUrl && configuredApiBaseUrl !== PLACEHOLDER_API_BASE_URL
    ? configuredApiBaseUrl
    : isBrowser && !isLocalhost
      ? window.location.origin
      : '';
const API_ENDPOINT = `${API_BASE_URL}/api/generate-study-guide`;

const initialForm = {
  lectureTitle: '',
  lectureSummary: '',
  difficulty: 'intermediate',
  focus: ''
};

function App() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    if (!API_BASE_URL) {
      setResult(null);
      setError(
        '로컬에서는 VITE_VERCEL_API_BASE_URL에 호출할 배포 API 주소를 넣어야 합니다.'
      );
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });
      const contentType = response.headers.get('content-type') ?? '';
      const data = contentType.includes('application/json') ? await response.json() : null;

      if (!response.ok) {
        throw new Error(data?.error ?? `요청 처리에 실패했습니다. (${response.status})`);
      }

      setResult(data);
    } catch (submitError) {
      setResult(null);
      if (submitError instanceof TypeError) {
        setError(`API 서버에 연결하지 못했습니다. 요청 주소를 확인하세요: ${API_ENDPOINT}`);
      } else {
        setError(submitError.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">React + Vercel API + Gemini API</p>
        <h1>강의 내용을 실습 계획으로 바꾸는 학습 도우미</h1>
        <p className="hero-copy">
          로컬에서 실행되는 React 프론트엔드가 배포된 API를 호출하고,
          서버 측에서 Gemini API를 통해 요약, 실습 과제, 퀴즈를 생성합니다.
        </p>
      </section>

      <section className="panel">
        <form className="guide-form" onSubmit={handleSubmit}>
          <label>
            강의 제목
            <input
              name="lectureTitle"
              value={form.lectureTitle}
              onChange={handleChange}
              placeholder="예: React 상태 관리 입문"
              required
            />
          </label>

          <label>
            강의 핵심 내용
            <textarea
              name="lectureSummary"
              value={form.lectureSummary}
              onChange={handleChange}
              placeholder="강의에서 다룬 개념, 예제, 중요 포인트를 3~5줄 정도로 입력"
              rows="6"
              required
            />
          </label>

          <label>
            실습 난이도
            <select name="difficulty" value={form.difficulty} onChange={handleChange}>
              <option value="beginner">초급</option>
              <option value="intermediate">중급</option>
              <option value="advanced">고급</option>
            </select>
          </label>

          <label>
            원하는 실습 방향
            <input
              name="focus"
              value={form.focus}
              onChange={handleChange}
              placeholder="예: 상태 관리, 비동기 처리, UI 설계"
            />
          </label>

          <button type="submit" disabled={isLoading}>
            {isLoading ? '생성 중...' : '학습 가이드 생성'}
          </button>
        </form>
      </section>

      {error ? <p className="status error">{error}</p> : null}

      {result ? (
        <section className="results">
          <article className="card accent">
            <h2>한 줄 요약</h2>
            <p>{result.overview}</p>
          </article>

          <article className="card">
            <h2>핵심 개념</h2>
            <ul>
              {result.keyPoints.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="card">
            <h2>실습 과제</h2>
            <ol>
              {result.practiceSteps.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </article>

          <article className="card">
            <h2>체크 퀴즈</h2>
            <ul>
              {result.quiz.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </section>
      ) : null}
    </main>
  );
}

export default App;
