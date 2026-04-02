// This service contains helper logic for ATS keyword scoring

const INDUSTRY_KEYWORDS = {
    technology: [
        'JavaScript', 'Python', 'React', 'Node.js', 'MongoDB', 'SQL', 'Docker',
        'Kubernetes', 'AWS', 'Git', 'REST API', 'Agile', 'CI/CD', 'TypeScript',
        'GraphQL', 'Redis', 'Linux', 'Microservices', 'System Design', 'Testing',
    ],
    finance: [
        'Excel', 'Financial Modeling', 'Risk Analysis', 'Python', 'SQL', 'Bloomberg',
        'Accounting', 'Forecasting', 'Budgeting', 'Valuation', 'CFA', 'Compliance',
    ],
    marketing: [
        'SEO', 'Google Analytics', 'Content Marketing', 'Social Media', 'Email Marketing',
        'A/B Testing', 'CRM', 'HubSpot', 'Copywriting', 'Brand Strategy', 'PPC', 'Canva',
    ],
    healthcare: [
        'Patient Care', 'EMR', 'HIPAA', 'Clinical Research', 'Medical Coding',
        'Anatomy', 'Pharmacology', 'CPR', 'ICD-10', 'Healthcare Management',
    ],
};

// Calculate basic ATS score from parsed resume data (used as fallback if AI fails)
const calculateBasicATSScore = (parsedData) => {
    let score = 0;

    // Has email → +10
    if (parsedData.email) score += 10;

    // Has phone → +5
    if (parsedData.phone) score += 5;

    // Skills count scoring
    const skillCount = parsedData.skills?.length || 0;
    if (skillCount >= 10) score += 25;
    else if (skillCount >= 5) score += 15;
    else if (skillCount >= 1) score += 8;

    // Word count (resume length)
    const wordCount = parsedData.wordCount || 0;
    if (wordCount >= 400) score += 20;
    else if (wordCount >= 200) score += 10;
    else score += 5;

    // Has raw text → base score
    if (parsedData.rawText?.length > 100) score += 10;

    // Bonus for longer, detailed resumes
    if (wordCount >= 600) score += 10;

    // Cap at 70 for basic scoring (AI gives the full picture)
    return Math.min(score, 70);
};

// Get missing keywords by comparing resume skills vs industry standard
const getMissingKeywords = (resumeSkills = [], industry = 'technology') => {
    const standardKeywords = INDUSTRY_KEYWORDS[industry.toLowerCase()] || INDUSTRY_KEYWORDS.technology;
    const resumeSkillsLower = resumeSkills.map(s => s.toLowerCase());
    return standardKeywords.filter(kw => !resumeSkillsLower.includes(kw.toLowerCase()));
};

// Calculate keyword match percentage between resume text and job description
const calculateKeywordMatch = (resumeText = '', jobDescription = '') => {
    // Extract words from JD (4+ character words only — filter noise)
    const jdWords = jobDescription
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length >= 4);

    if (jdWords.length === 0) return { matchPercentage: 0, matched: [], missing: [] };

    const resumeLower = resumeText.toLowerCase();
    const uniqueJdWords = [...new Set(jdWords)];

    const matched = uniqueJdWords.filter(w => resumeLower.includes(w));
    const missing = uniqueJdWords.filter(w => !resumeLower.includes(w)).slice(0, 15);

    const matchPercentage = Math.round((matched.length / uniqueJdWords.length) * 100);

    return { matchPercentage, matched: matched.slice(0, 20), missing };
};

module.exports = { calculateBasicATSScore, getMissingKeywords, calculateKeywordMatch };