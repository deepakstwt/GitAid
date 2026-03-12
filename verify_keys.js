
const https = require('https');
const fs = require('fs');
const path = require('path');

// Basic parser for .env
function getEnv() {
  const envPath = path.join(__dirname, 'backend', '.env');
  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split('\n');
  const env = {};
  lines.forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
    }
  });
  return env;
}

const env = getEnv();
const githubToken = env.GITHUB_TOKEN;
const geminiToken = env.GEMINI_API_KEY;

console.log('--- Testing GitHub Token ---');
const ghOptions = {
  hostname: 'api.github.com',
  path: '/user',
  headers: {
    'Authorization': `token ${githubToken}`,
    'User-Agent': 'GitAid-Verify'
  }
};

https.get(ghOptions, (res) => {
  let data = '';
  res.on('data', (d) => data += d);
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ GitHub Token: VALID (User: ' + JSON.parse(data).login + ')');
    } else {
      console.log('❌ GitHub Token: INVALID (' + res.statusCode + ')');
    }
    
    console.log('\n--- Testing Gemini Token ---');
    testGemini();
  });
}).on('error', (e) => console.error(e));

function testGemini() {
  const postData = JSON.stringify({
    contents: [{ parts: [{ text: "Respond with 'OK' if you can read this." }] }]
  });

  const geminiOptions = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1/models/gemini-2.0-flash:generateContent?key=${geminiToken}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = https.request(geminiOptions, (res) => {
    let data = '';
    res.on('data', (d) => data += d);
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('✅ Gemini API Key: VALID');
      } else {
        console.log('⚠️ Gemini Model Test Failed (' + res.statusCode + '). Listing models...');
        listModels();
      }
    });
  });
  req.on('error', (e) => console.error(e));
  req.write(postData);
  req.end();
}

function listModels() {
  const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1/models?key=${geminiToken}`,
    method: 'GET'
  };

  https.get(options, (res) => {
    let data = '';
    res.on('data', (d) => data += d);
    res.on('end', () => {
      if (res.statusCode === 200) {
        const models = JSON.parse(data).models;
        console.log('Available Models:');
        models.slice(0, 5).forEach(m => console.log(' - ' + m.name));
      } else {
        console.log('❌ Gemini Final Error (' + res.statusCode + '): API key might be invalid or has no permissions.');
        console.log(data);
      }
    });
  });
}
