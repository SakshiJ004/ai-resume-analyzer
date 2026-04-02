const mongoose = require('mongoose');

const jobDescriptionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    resume: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume',
    },
    title: String,
    company: String,
    rawText: {
        type: String,
        required: true,
    },
    matchPercentage: Number,
    matchedKeywords: [String],
    missingKeywords: [String],
    suggestions: [String],
}, { timestamps: true });

module.exports = mongoose.model('JobDescription', jobDescriptionSchema);