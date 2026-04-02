const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// ✅ Parse AI JSON safely
const parseAIJson = (text) => {
    try {
        const cleaned = text.replace(/```json|```/g, '').trim();
        return JSON.parse(cleaned);
    } catch (err) {
        console.error('❌ AI JSON parse failed, raw text:', text.slice(0, 300));
        throw new Error('AI returned invalid response. Please try again.');
    }
};

// ✅ Retry wrapper — waits and retries if rate limited
const callWithRetry = async (fn, retries = 2, delayMs = 30000) => {
    for (let i = 0; i <= retries; i++) {
        try {
            return await fn();
        } catch (err) {
            const is429 = err.message?.includes('429') || err.message?.includes('quota');
            if (is429 && i < retries) {
                console.log(`⏳ Rate limited. Waiting ${delayMs / 1000}s before retry ${i + 1}...`);
                await new Promise((res) => setTimeout(res, delayMs));
            } else {
                throw err;
            }
        }
    }
};

// ✅ Analyze resume
const analyzeResume = async (parsedData, targetRole = '', industry = '') => {
    const prompt = `You are an expert ATS system. Analyze this resume and return ONLY raw JSON, no markdown, no code blocks.

Resume Text: ${parsedData.rawText?.slice(0, 3000) || 'No text provided'}
Skills Found: ${parsedData.skills?.join(', ') || 'None'}
Target Role: ${targetRole || 'Software Engineer'}
Industry: ${industry || 'Technology'}

Return this exact JSON structure:
{
  "atsScore": 72,
  "detectedName": "Candidate Name",
  "detectedRole": "Full Stack Developer",
  "experience": "2 years",
  "education": "B.Tech Computer Science",
  "extractedSkills": ["JavaScript", "React", "Node.js"],
  "missingSkills": ["Docker", "AWS", "TypeScript", "Redis"],
  "scoreBreakdown": {
    "summary": 65,
    "skills": 80,
    "experience": 70,
    "projects": 60,
    "formatting": 75
  },
  "feedback": [
    { "section": "Summary", "type": "warn", "text": "Add a strong professional summary with measurable achievements." },
    { "section": "Skills", "type": "good", "text": "Good range of technical skills listed." },
    { "section": "Experience", "type": "bad", "text": "Use action verbs and add metrics like percentages." },
    { "section": "Projects", "type": "warn", "text": "Add GitHub links and describe your role clearly." }
  ],
  "suggestions": [
    "Add measurable achievements with specific numbers",
    "Include a professional summary targeting your role",
    "Add more cloud and DevOps keywords for ATS",
    "List certifications or online courses"
  ],
  "skillDistribution": {
    "Frontend": 40,
    "Backend": 30,
    "DevOps": 15,
    "Soft Skills": 15
  }
}`;

    console.log('🤖 Calling Gemini AI for analysis...');
    return await callWithRetry(async () => {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        console.log('✅ Gemini analysis complete');
        return parseAIJson(text);
    });
};

// ✅ Match job description
const matchJobDescription = async (resumeText, jobDescription) => {
    const prompt = `Compare this resume with the job description. Return ONLY raw JSON, no markdown.

Resume: ${resumeText?.slice(0, 2000) || 'No resume text'}
Job Description: ${jobDescription?.slice(0, 1500)}

Return:
{
  "matchPercentage": 65,
  "matchedKeywords": ["React", "JavaScript", "Node.js"],
  "missingKeywords": ["Docker", "Kubernetes", "AWS"],
  "suggestions": ["Add Docker experience", "Mention cloud platforms", "Include team collaboration"],
  "summary": "Your resume matches 65% of the job requirements."
}`;

    return await callWithRetry(async () => {
        const result = await model.generateContent(prompt);
        return parseAIJson(result.response.text());
    });
};

// ✅ Improve resume
const improveResume = async (parsedData, analysisData) => {
    const prompt = `Improve this resume. Return ONLY raw JSON, no markdown.

Resume: ${parsedData.rawText?.slice(0, 2000) || 'No text'}
Issues: ${analysisData.feedback?.map((f) => f.text).join('; ') || 'General improvements'}

Return:
{
  "improvedSummary": "Results-driven developer with 2+ years experience...",
  "improvedExperience": "• Led API development reducing response time by 40%\n• Built dashboard used by 500+ users",
  "improvedSkills": "Frontend: React, JavaScript\nBackend: Node.js, MongoDB",
  "keyChanges": ["Added metrics", "Rewrote summary", "Organized skills"]
}`;

    return await callWithRetry(async () => {
        const result = await model.generateContent(prompt);
        return parseAIJson(result.response.text());
    });
};

// ✅ Generate cover letter
const generateCoverLetter = async (resumeText, jobRole, company, jobDescription = '') => {
    const prompt = `Write a professional cover letter. Return ONLY plain text, no JSON, no markdown.

Resume: ${resumeText?.slice(0, 1500) || 'Experienced developer'}
Role: ${jobRole}
Company: ${company}
JD: ${jobDescription?.slice(0, 800) || 'Not provided'}

Write 3 paragraphs: opening enthusiasm, specific achievements, call to action.`;

    return await callWithRetry(async () => {
        const result = await model.generateContent(prompt);
        return result.response.text();
    });
};

module.exports = {
    analyzeResume,
    matchJobDescription,
    improveResume,
    generateCoverLetter,
};