import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';

// Eagerly load backend/.env so GEMINI_API_KEY is in process.env before any
// lazy import('./env') runs. dotenv.config() is synchronous and idempotent.
// This matters because env.js uses top-level await (async) – it may not have
// finished by the time the first AI call arrives.
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const dotenv = require('dotenv') as typeof import('dotenv');
  const cwd = process.cwd();
  // Works whether we run from frontend/ or repo root
  dotenv.config({ path: path.join(cwd, '..', 'backend', '.env'), override: false });
  dotenv.config({ path: path.join(cwd, 'backend', '.env'), override: false });
} catch {
  // dotenv not available – env vars must already be set externally
}

let _keyLogged = false;

export async function getGeminiClient(): Promise<GoogleGenerativeAI> {
  // Prefer process.env so we use whatever was loaded by dotenv (e.g. backend/.env)
  let apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    try {
      const { env } = await import('@/server/config/env');
      apiKey = env.GEMINI_API_KEY;
    } catch (e) {
      // ignore
    }
  }
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('GEMINI_API_KEY is not set. Add it to backend/.env (get a key at https://aistudio.google.com/app/apikey)');
  }
  if (!_keyLogged) {
    _keyLogged = true;
    console.log('[Gemini] Using API key:', apiKey.substring(0, 6) + '...' + apiKey.slice(-4));
  }
  return new GoogleGenerativeAI(apiKey.trim());
}

// Model IDs that exist for your API (we use 2.x; 1.5-flash is not available for all keys)
const GEMINI_MODELS = ['gemini-2.0-flash', 'gemini-2.0-flash-001', 'gemini-2.0-flash-lite', 'gemini-2.5-flash'] as const;

export async function summarizeText(text: string, retryCount = 0): Promise<string> {
  const MAX_RETRIES = 3;
  const trimmed = (text || '').trim();
  if (!trimmed) {
    console.warn('summarizeText called with empty text, using fallback');
    return generateFallbackSummary('(No commit data provided)');
  }

  const prompt = `Analyze this Git commit and provide a concise, helpful summary. Focus on:
1. What type of change this is (feature, bugfix, refactor, etc.)
2. The main purpose and impact of the changes
3. Any important technical details

Keep the summary under 150 words and use a professional, informative tone.

Commit data:
${trimmed}`;

  for (const modelId of GEMINI_MODELS) {
    try {
      const genAI = await getGeminiClient();
      const model = genAI.getGenerativeModel({ model: modelId });

      const result = await model.generateContent(prompt);
      const response = result.response;
      let summary: string;
      try {
        summary = response.text().trim();
      } catch (textErr: any) {
        console.warn(`Gemini (${modelId}) response.text() failed:`, textErr?.message || textErr);
        continue;
      }
      if (!summary) continue;
      return summary;
    } catch (error: any) {
      const errMsg = error?.message || String(error);
      const status = error?.status ?? error?.response?.status;
      const isRateLimit = status === 429 || errMsg.includes('429');
      const isModelError =
        status === 404 ||
        errMsg.includes('404') ||
        errMsg.includes('not found') ||
        errMsg.includes('model') ||
        errMsg.includes('MODEL_NOT_FOUND');

      // Log exact error so you can fix it (check terminal when you click "Poll Commits")
      console.error(`[Gemini] ${modelId} failed (status=${status}):`, errMsg);

      if (isRateLimit && retryCount < MAX_RETRIES) {
        const delay = Math.pow(2, retryCount) * 1000;
        console.warn(`⚠️ Rate limited. Retrying in ${delay}ms... (${retryCount + 1}/${MAX_RETRIES})`);
        await new Promise((r) => setTimeout(r, delay));
        return summarizeText(text, retryCount + 1);
      }

      if (isModelError) {
        continue;
      }

      // 400/403 = bad key or permission – stop trying models and show clear message
      if (status === 400 || status === 403 || errMsg.includes('API key') || errMsg.includes('invalid') || errMsg.includes('PERMISSION')) {
        console.error(
          '🔴 Gemini API key rejected. Fix: 1) Get a new key at https://aistudio.google.com/app/apikey 2) Put GEMINI_API_KEY=your_key in backend/.env 3) Restart dev server.'
        );
        return generateFallbackSummary(trimmed);
      }

      return generateFallbackSummary(trimmed);
    }
  }

  console.error('🔴 All Gemini models failed. Check the errors above. Using fallback.');
  return generateFallbackSummary(trimmed);
}

function generateFallbackSummary(text: string): string {
  const lowerText = text.toLowerCase();
  let summary = "Code changes detected. ";

  if (lowerText.includes('fix') || lowerText.includes('bug') || lowerText.includes('error')) {
    summary += "Bug fix or error correction.";
  } else if (lowerText.includes('feat') || lowerText.includes('add') || lowerText.includes('new')) {
    summary += "New feature or functionality added.";
  } else if (lowerText.includes('update') || lowerText.includes('modify') || lowerText.includes('change')) {
    summary += "Existing code updated or modified.";
  } else if (lowerText.includes('remove') || lowerText.includes('delete')) {
    summary += "Code or features removed.";
  } else if (lowerText.includes('refactor')) {
    summary += "Code refactored for better structure.";
  } else if (lowerText.includes('doc') || lowerText.includes('readme')) {
    summary += "Documentation updated.";
  } else if (lowerText.includes('test')) {
    summary += "Tests added or updated.";
  } else if (lowerText.includes('merge')) {
    summary += "Branch merge with multiple changes.";
  } else {
    summary += "General improvements and updates.";
  }

  return summary + " (Fallback: AI unavailable)";
}
