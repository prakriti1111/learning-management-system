// ⚠️  API KEY NEEDED: platform.openai.com → API Keys → Create new secret key
//    Set OPENAI_API_KEY in your .env file

const OpenAI = require('openai');

function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const BUDDY_SYSTEM = `You are Buddy, a warm and friendly learning helper for children aged 6-12 in rural India.
RULES (always follow):
- Use very simple words a 7-year-old understands.
- Use 1-2 fun emojis per response.
- Keep answers to 3-5 short sentences maximum.
- Use Indian examples: roti, cricket, mango, village, diya, etc.
- For math: give a simple worked example with numbers.
- For science: relate to something the child can see around them.
- Always end with one short encouraging sentence.
- Never use markdown, asterisks, or technical jargon.
- Respond in the same language the child writes in (Hindi or English).`;

async function chatWithBuddy({ messages, language = 'hi' }) {
  const client = getClient();
  const system = { role: 'system', content: `${BUDDY_SYSTEM}\nLanguage: ${language}` };
  const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
  const res = await client.chat.completions.create({
    model:       'gpt-4o-mini',
    max_tokens:  200,
    temperature: 0.7,
    messages:    [system, ...history],
  });
  return res.choices[0].message.content;
}

async function generateParentSummary({ childName, age, gradeLevel, strongAreas, weakAreas, sessionsThisWeek, avgScore, achievements, language = 'en' }) {
  const client   = getClient();
  const langName = language === 'hi' ? 'Hindi' : 'English';
  const prompt   = `Write a warm weekly learning report in ${langName} for a parent.

Child: ${childName}, Age: ${age || 9}, Grade: ${gradeLevel || 3}
Strong subjects: ${strongAreas?.join(', ') || 'still exploring'}
Needs work on: ${weakAreas?.join(', ') || 'nothing specific'}
Sessions this week: ${sessionsThisWeek}
Average score: ${avgScore}%
Achievements: ${achievements?.join(', ') || 'none this week'}

Respond with ONLY valid JSON (no markdown, no backticks):
{"summary":"2-3 warm sentences","tips":["tip1","tip2","tip3"],"encouragement":"one sentence"}`;

  const res = await client.chat.completions.create({
    model: 'gpt-4o-mini', max_tokens: 500, temperature: 0.65,
    messages: [{ role: 'user', content: prompt }],
  });
  let raw = res.choices[0].message.content.trim();
  // Strip markdown fences if present
  raw = raw.replace(/^```(?:json)?/,'').replace(/```$/,'').trim();
  try {
    return JSON.parse(raw);
  } catch {
    return { summary: raw, tips: [], encouragement: '' };
  }
}

module.exports = { chatWithBuddy, generateParentSummary };