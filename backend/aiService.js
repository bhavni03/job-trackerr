const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function matchResumeToJob(resumeText, jobDescription) {
  const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

  const prompt = `
You are an expert technical recruiter. Compare the following resume against the job description.

Resume:
${resumeText}

Job Description:
${jobDescription}

Respond ONLY with valid JSON in this exact format, no extra text, no markdown formatting, no code blocks:
{
  "matchScore": <number between 0 and 100>,
  "matchedSkills": [<list of skills from the resume that match the job description>],
  "missingSkills": [<list of important skills in the job description that are NOT in the resume>],
  "summary": "<one sentence summary of the fit>"
}
`;

  const result = await model.generateContent(prompt);
  const rawText = result.response.text();

  try {
    const cleanText = rawText.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (err) {
    console.error('Failed to parse AI response:', rawText);
    throw new Error('AI returned invalid format');
  }
}

module.exports = { matchResumeToJob };