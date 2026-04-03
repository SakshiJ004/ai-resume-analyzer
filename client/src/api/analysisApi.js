import axiosInstance from './axiosInstance';

// Run AI analysis on a resume
export const analyzeResumeApi = (data) =>
    axiosInstance.post('/analysis/analyze', data);

// Get existing analysis for a resume
export const getAnalysisApi = (resumeId) =>
    axiosInstance.get(`/analysis/${resumeId}`);

// Improve resume using AI
export const improveResumeApi = (data) =>
    axiosInstance.post('/analysis/improve', data);

// Match resume against job description
export const matchJobApi = (data) =>
    axiosInstance.post('/job/match', data);

// ✅ Generate cover letter — was missing
export const generateCoverLetterApi = (data) =>
    axiosInstance.post('/job/cover-letter', data);