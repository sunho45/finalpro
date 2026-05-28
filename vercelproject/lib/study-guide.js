const MODEL_NAME = 'gemini-2.5-flash';
const GEMINI_API_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent`;

function extractText(payload) {
  return (
    payload?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? '')
      .join('')
      .trim() ?? ''
  );
}

function parseGuide(text) {
  const normalized = text.replace(/^```json\s*|\s*```$/g, '').trim();
  const parsed = JSON.parse(normalized);

  return {
    overview: parsed.overview ?? '요약을 생성하지 못했습니다.',
    keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
    practiceSteps: Array.isArray(parsed.practiceSteps) ? parsed.practiceSteps : [],
    quiz: Array.isArray(parsed.quiz) ? parsed.quiz : []
  };
}

export function validateGuideInput(body) {
  const { lectureTitle, lectureSummary, difficulty, focus } = body ?? {};

  if (!lectureTitle || !lectureSummary) {
    return { error: '강의 제목과 강의 핵심 내용은 필수입니다.' };
  }

  return {
    data: { lectureTitle, lectureSummary, difficulty, focus }
  };
}

export async function generateStudyGuide(input, apiKey) {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
  }

  const prompt = `
당신은 학습 실습 설계 도우미입니다.
입력된 강의 내용을 바탕으로 한국어 학습 가이드를 JSON으로만 반환하세요.

조건:
- 설명은 간결하고 실습 가능해야 합니다.
- 반드시 overview, keyPoints, practiceSteps, quiz 키를 포함하세요.
- keyPoints, practiceSteps, quiz는 각각 문자열 배열 3개 이상으로 작성하세요.
- markdown 코드블록 없이 순수 JSON만 반환하세요.

입력:
- 강의 제목: ${input.lectureTitle}
- 강의 핵심 내용: ${input.lectureSummary}
- 난이도: ${input.difficulty}
- 실습 초점: ${input.focus || '별도 지정 없음'}
  `.trim();

  const geminiResponse = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: 'application/json'
      }
    })
  });

  const payload = await geminiResponse.json();

  if (!geminiResponse.ok) {
    const error = payload?.error?.message ?? 'Gemini API 호출에 실패했습니다.';
    const status = Number.isInteger(geminiResponse.status) ? geminiResponse.status : 500;
    return {
      error,
      status
    };
  }

  const text = extractText(payload);
  return {
    data: parseGuide(text),
    status: 200
  };
}
