const path = require('path');
const fs = require('fs');
const Resume = require('../models/Resume');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const { parseResume } = require('../services/parserService');

// POST /api/resume/upload
const uploadResume = asyncHandler(async (req, res) => {
    console.log('📁 Upload request received');
    console.log('📁 File:', req.file);

    if (!req.file) {
        throw new ApiError(400, 'No file uploaded. Please select a PDF or DOCX file.');
    }

    const { originalname, filename, path: filePath, mimetype } = req.file;

    console.log('📁 File saved at:', filePath);

    const fileType = mimetype.includes('pdf') ? 'pdf' : 'docx';

    // Parse the resume
    let parsedData = {};
    try {
        parsedData = await parseResume(filePath, fileType);
        console.log('✅ Resume parsed successfully');
    } catch (parseError) {
        console.error('⚠️ Parse error (continuing):', parseError.message);
        // Don't fail — just store empty parsed data
        parsedData = { rawText: '', skills: [], email: '', phone: '' };
    }

    // Get version count
    const existingCount = await Resume.countDocuments({ user: req.user._id });

    // Save to database
    const resume = await Resume.create({
        user: req.user._id,
        originalName: originalname,
        fileName: filename,
        fileType,
        filePath,
        parsedData,
        version: existingCount + 1,
    });

    console.log('✅ Resume saved to DB:', resume._id);

    res.status(201).json(
        new ApiResponse(201, resume, 'Resume uploaded successfully')
    );
});

// GET /api/resume/all
const getUserResumes = asyncHandler(async (req, res) => {
    const resumes = await Resume.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .select('-parsedData.rawText');

    res.json(new ApiResponse(200, resumes, 'Resumes fetched'));
});

// GET /api/resume/:id
const getResumeById = asyncHandler(async (req, res) => {
    const resume = await Resume.findOne({
        _id: req.params.id,
        user: req.user._id,
    });

    if (!resume) {
        throw new ApiError(404, 'Resume not found');
    }

    res.json(new ApiResponse(200, resume, 'Resume fetched'));
});

// DELETE /api/resume/:id
const deleteResume = asyncHandler(async (req, res) => {
    const resume = await Resume.findOne({
        _id: req.params.id,
        user: req.user._id,
    });

    if (!resume) {
        throw new ApiError(404, 'Resume not found');
    }

    // Delete file from disk safely
    if (resume.filePath && fs.existsSync(resume.filePath)) {
        fs.unlinkSync(resume.filePath);
        console.log('✅ File deleted from disk');
    }

    await resume.deleteOne();

    res.json(new ApiResponse(200, null, 'Resume deleted successfully'));
});

module.exports = { uploadResume, getUserResumes, getResumeById, deleteResume };