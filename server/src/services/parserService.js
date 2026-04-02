const mammoth = require('mammoth');
const fs = require('fs');

// ✅ This is the ONLY correct way to import pdf-parse
const pdfParse = require('pdf-parse');

// Parse PDF file
const parsePDF = async (filePath) => {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        return data.text || '';
    } catch (err) {
        console.error('❌ PDF parse error:', err.message);
        return '';
    }
};

// Parse DOCX file
const parseDOCX = async (filePath) => {
    try {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value || '';
    } catch (err) {
        console.error('❌ DOCX parse error:', err.message);
        return '';
    }
};

// Extract structured data from raw text
const extractStructuredData = (rawText) => {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/;

    const skillKeywords = [
        'JavaScript', 'TypeScript', 'Python', 'Java', 'React', 'Angular',
        'Vue', 'Node', 'Express', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis',
        'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Git', 'REST',
        'GraphQL', 'HTML', 'CSS', 'Tailwind', 'Next', 'Django', 'Flask',
        'Spring', 'TensorFlow', 'PyTorch', 'SQL', 'Linux', 'Agile',
        'Scrum', 'Figma', 'Excel', 'Bootstrap', 'jQuery', 'PHP',
        'Laravel', 'Firebase', 'Vercel', 'Netlify', 'Postman', 'GitHub',
    ];

    const foundSkills = skillKeywords.filter((skill) =>
        rawText.toLowerCase().includes(skill.toLowerCase())
    );

    return {
        rawText,
        email: (rawText.match(emailRegex) || [])[0] || '',
        phone: (rawText.match(phoneRegex) || [])[0] || '',
        skills: [...new Set(foundSkills)],
        wordCount: rawText.split(/\s+/).filter(Boolean).length,
    };
};

// Main parse function
const parseResume = async (filePath, fileType) => {
    console.log(`🔍 Parsing ${fileType}: ${filePath}`);

    if (!fs.existsSync(filePath)) {
        console.error('❌ File not found:', filePath);
        return { rawText: '', skills: [], email: '', phone: '', wordCount: 0 };
    }

    let rawText = '';

    if (fileType === 'pdf') {
        rawText = await parsePDF(filePath);
    } else if (fileType === 'docx') {
        rawText = await parseDOCX(filePath);
    }

    console.log(`✅ Parsed ${rawText.length} characters`);
    return extractStructuredData(rawText);
};

module.exports = { parseResume };