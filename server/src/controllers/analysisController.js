const Resume = require('../models/Resume');
const Analysis = require('../models/Analysis');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const { analyzeResume, improveResume } = require('../services/geminiService');

// POST /api/analysis/analyze
const analyzeResumeController = asyncHandler(async (req, res) => {
    const { resumeId, targetRole, industry } = req.body;

    if (!resumeId) throw new ApiError(400, 'Resume ID is required');

    const resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
    if (!resume) throw new ApiError(404, 'Resume not found');

    // Call Gemini AI
    const aiResult = await analyzeResume(resume.parsedData, targetRole, industry);

    // Save or update analysis
    const analysis = await Analysis.findOneAndUpdate(
        { user: req.user._id, resume: resumeId },
        {
            user: req.user._id,
            resume: resumeId,
            atsScore: aiResult.atsScore,
            extractedSkills: aiResult.extractedSkills,
            missingSkills: aiResult.missingSkills,
            scoreBreakdown: aiResult.scoreBreakdown,
            feedback: aiResult.feedback,
            suggestions: aiResult.suggestions,
            skillDistribution: aiResult.skillDistribution,
        },
        { upsert: true, new: true }
    );

    res.json(new ApiResponse(200, { analysis, aiResult }, 'Analysis complete'));
});

// GET /api/analysis/:resumeId
const getAnalysis = asyncHandler(async (req, res) => {
    const analysis = await Analysis.findOne({
        resume: req.params.resumeId,
        user: req.user._id,
    }).populate('resume', 'originalName version createdAt');

    if (!analysis) throw new ApiError(404, 'No analysis found for this resume');

    res.json(new ApiResponse(200, analysis, 'Analysis fetched'));
});

// POST /api/analysis/improve
const improveResumeController = asyncHandler(async (req, res) => {
    const { resumeId } = req.body;

    const resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
    if (!resume) throw new ApiError(404, 'Resume not found');

    const analysis = await Analysis.findOne({ resume: resumeId, user: req.user._id });
    if (!analysis) throw new ApiError(400, 'Please analyze the resume first');

    const improved = await improveResume(resume.parsedData, analysis);

    // Save improved content to analysis
    analysis.improvedContent = {
        summary: improved.improvedSummary,
        experience: improved.improvedExperience,
        skills: improved.improvedSkills,
    };
    await analysis.save();

    res.json(new ApiResponse(200, improved, 'Resume improved successfully'));
});

module.exports = { analyzeResumeController, getAnalysis, improveResumeController };