import { GoogleGenerativeAI } from '@google/generative-ai';

export async function getGeminiClient(): Promise<GoogleGenerativeAI> {
  try {
    const { env } = await import('@/server/config/env');
    if (!env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    return new GoogleGenerativeAI(env.GEMINI_API_KEY);
  } catch (envError) {
    console.error('Error loading environment:', envError);
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set (fallback check)');
    }
    return new GoogleGenerativeAI(apiKey);
  }
}
export async function summarizeText(text: string): Promise<string> {
  try {
    const genAI = await getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `Analyze this Git commit and provide a concise, helpful summary. Focus on:
1. What type of change this is (feature, bugfix, refactor, etc.)
2. The main purpose and impact of the changes
3. Any important technical details

Keep the summary under 150 words and use a professional, informative tone.

Commit data:
${text}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text().trim();
    
    if (summary.length > 500) {
      return summary.substring(0, 497) + '...';
    }
    
    return summary;
  } catch (error) {
    console.error('Error generating AI summary:', error);
    return generateFallbackSummary(text);
  }
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

export async function testGeminiConnection(): Promise<boolean> {
  try {
    await summarizeText("test: add unit tests for user authentication");
    return true;
  } catch (error) {
    console.error('Gemini AI test failed:', error);
    return false;
  }
}
