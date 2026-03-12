import { GoogleGenerativeAI } from '@google/generative-ai';

async function run() {
  try {
    const key = "AIzaSyARxYNsXknVRn4DweD7hFb50xqKBHQCFdk";
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = "Hello!";
    console.log('Sending request to gemini-2.0-flash...');
    const result = await model.generateContent(prompt);
    console.log('Success!', result.response.text());
  } catch (error) {
    console.error('Error generating AI summary:', error);
  }
}
run();
