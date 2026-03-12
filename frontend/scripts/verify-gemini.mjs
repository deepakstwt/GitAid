#!/usr/bin/env node
/**
 * Verify Gemini API key from backend/.env
 * Run from frontend folder: node scripts/verify-gemini.mjs
 */
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, existsSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendEnv = path.join(__dirname, '..', '..', 'backend', '.env');

function loadEnv(filePath) {
  if (!existsSync(filePath)) return {};
  const text = readFileSync(filePath, 'utf8');
  const out = {};
  for (const line of text.split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
  }
  return out;
}

const env = loadEnv(backendEnv);
const key = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

if (!key || key.trim() === '') {
  console.error('❌ GEMINI_API_KEY not found in backend/.env');
  console.error('   Add: GEMINI_API_KEY=your_key (get one at https://aistudio.google.com/app/apikey)');
  process.exit(1);
}

console.log('✓ GEMINI_API_KEY found:', key.substring(0, 6) + '...' + key.slice(-4));
console.log('  Calling Gemini API (gemini-2.0-flash)...');

try {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(key.trim());
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const result = await model.generateContent('Say "Hello" in one word.');
  const text = result.response.text();
  console.log('✓ Gemini responded:', text?.trim() || '(empty)');
  console.log('\n✅ Your API key works. AI summaries should work when you click "Poll Commits".');
} catch (err) {
  console.error('\n❌ Gemini API error:', err.message || err);
  if (err.message?.includes('API key') || err.message?.includes('403') || err.message?.includes('400')) {
    console.error('\n   → Get a new key: https://aistudio.google.com/app/apikey');
    console.error('   → Put it in backend/.env as: GEMINI_API_KEY=your_key');
    console.error('   → Restart "npm run dev"');
  }
  process.exit(1);
}
