const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    originalName: {
        type: String,
        required: true,
    },
    fileName: {
        type: String,
        required: true,
    },
    fileType: {
        type: String,
        enum: ['pdf', 'docx'],
        required: true,
    },
    filePath: {
        type: String,
        required: true,
    },
    parsedData: {
        rawText: String,
        name: String,
        email: String,
        phone: String,
        skills: [String],
        experience: [String],
        education: [String],
        projects: [String],
        summary: String,
    },
    version: {
        type: Number,
        default: 1,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);