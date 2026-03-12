require('dotenv').config({ path: './backend/.env' });
const { summarizeText } = require('./backend/server/lib/ai');

async function run() {
  console.log('Testing summarizeText...');
  const res = await summarizeText('Test commit: added a new component for the header.');
  console.log('Result:', res);
}
run();
