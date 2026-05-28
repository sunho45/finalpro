import { generateStudyGuide, validateGuideInput } from '../lib/study-guide.js';

function setCorsHeaders(request, response) {
  const origin = request.headers.origin;
  const allowedOrigins = (process.env.FRONTEND_ORIGIN ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  if (allowedOrigins.length === 0) {
    response.setHeader('Access-Control-Allow-Origin', origin ?? '*');
  } else if (origin && allowedOrigins.includes(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
  }

  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Vary', 'Origin');

  if (request.method === 'OPTIONS') {
    response.status(204).end();
    return true;
  }

  return false;
}

export default async function handler(request, response) {
  if (setCorsHeaders(request, response)) {
    return;
  }

  if (request.method !== 'POST') {
    response.status(405).json({ error: 'POST 요청만 허용됩니다.' });
    return;
  }

  const validation = validateGuideInput(request.body);
  if (validation.error) {
    response.status(400).json({ error: validation.error });
    return;
  }

  try {
    const result = await generateStudyGuide(validation.data, process.env.GEMINI_API_KEY);
    if (result.error) {
      response.status(result.status).json({ error: result.error });
      return;
    }
    response.status(200).json(result.data);
  } catch (error) {
    response.status(500).json({
      error: error instanceof Error ? error.message : '알 수 없는 서버 오류가 발생했습니다.'
    });
  }
}
