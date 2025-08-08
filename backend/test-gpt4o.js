const { OpenAI } = require('openai');
require('dotenv').config({ path: './.env' });

console.log('Environment variables:');
console.log('AZURE_OPENAI_ENDPOINT:', process.env.AZURE_OPENAI_ENDPOINT);
console.log('GPT_4O_DEPLOYMENT:', process.env.GPT_4O_DEPLOYMENT);
console.log('AZURE_OPENAI_API_VERSION:', process.env.AZURE_OPENAI_API_VERSION);
console.log('AZURE_OPENAI_API_KEY:', process.env.AZURE_OPENAI_API_KEY ? 'Set' : 'Not set');

const baseURL = `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.GPT_4O_DEPLOYMENT}`;
console.log('Base URL:', baseURL);

// For Azure OpenAI, we need to use a different configuration
const openai = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  baseURL: baseURL,
  defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION },
  defaultHeaders: {
    'api-key': process.env.AZURE_OPENAI_API_KEY,
  },
});

async function testGPT4o() {
  try {
    console.log('Testing Azure OpenAI GPT-4o connection...');
    
    const response = await openai.chat.completions.create({
      model: process.env.GPT_4O_DEPLOYMENT || 'gpt-4o',
      messages: [{ role: 'user', content: 'Hello! Can you respond in both English and Indonesian? Halo, bisakah kamu merespons dalam bahasa Inggris dan Indonesia?' }],
      max_tokens: 150,
      temperature: 0.7,
    });

    console.log('✅ GPT-4o connection successful!');
    console.log('Response:', response.choices[0]?.message?.content);
    console.log('Model used:', process.env.GPT_4O_DEPLOYMENT);
    
  } catch (error) {
    console.error('❌ GPT-4o connection failed:', error.message);
  }
}

testGPT4o();
