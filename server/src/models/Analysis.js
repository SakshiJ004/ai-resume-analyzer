const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    resume: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume',
        required: true,
    },
    atsScore: {
        type: Number,
        min: 0,
        max: 100,
    },
    extractedSkills: [String],
    missingSkills: [String],
    scoreBreakdown: {
        summary: Number,
        skills: Number,
        experience: Number,
        projects: Number,
        formatting: Number,
    },
    feedback: [
        {
            section: String,
            type: { type: String, enum: ['good', 'warn', 'bad'] },
            text: String,
        }
    ],
    suggestions: [String],
    improvedContent: {
        summary: String,
        experience: String,
        skills: String,
    },
    skillDistribution: {
        type: Map,
        of: Number,
    },
}, { timestamps: true });

module.exports = mongoose.model('Analysis', analysisSchema);