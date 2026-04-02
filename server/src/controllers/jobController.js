const Resume = require('../models/Resume');
const JobDescription = require('../models/JobDescription');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const { matchJobDescription, generateCoverLetter } = require('../services/geminiService');

// POST /api/job/match
const matchJob = asyncHandler(async (req, res) => {
    const { resumeId, jobDescription, jobTitle, company } = req.body;

    if (!resumeId || !jobDescription) {
        throw new ApiError(400, 'Resume ID and job description are required');
    }

    const resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
    if (!resume) throw new ApiError(404, 'Resume not found');

    const result = await matchJobDescription(resume.parsedData.rawText, jobDescription);

    // Save job match to database
    const jd = await JobDescription.create({
        user: req.user._id,
        resume: resumeId,
        title: jobTitle || '',
        company: company || '',
        rawText: jobDescription,
        matchPercentage: result.matchPercentage,
        matchedKeywords: result.matchedKeywords,
        missingKeywords: result.missingKeywords,
        suggestions: result.suggestions,
    });

    res.json(new ApiResponse(200, { jd, result }, 'Job match complete'));
});

// POST /api/job/cover-letter
const generateCoverLetterController = asyncHandler(async (req, res) => {
    const { resumeId, jobRole, company, jobDescription } = req.body;

    if (!resumeId || !jobRole || !company) {
        throw new ApiError(400, 'Resume ID, job role, and company are required');
    }

    const resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
    if (!resume) throw new ApiError(404, 'Resume not found');

    const letter = await generateCoverLetter(
        resume.parsedData.rawText, jobRole, company, jobDescription
    );

    res.json(new ApiResponse(200, { coverLetter: letter }, 'Cover letter generated'));
});

module.exports = { matchJob, generateCoverLetterController };