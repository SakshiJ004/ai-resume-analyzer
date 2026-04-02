import axiosInstance from './axiosInstance';

export const uploadResumeApi = (formData) =>
    axiosInstance.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

export const getAllResumesApi = () => axiosInstance.get('/resume/all');
export const getResumeApi = (id) => axiosInstance.get(`/resume/${id}`);
export const deleteResumeApi = (id) => axiosInstance.delete(`/resume/${id}`);

export const analyzeResumeApi = (data) => axiosInstance.post('/analysis/analyze', data);
export const getAnalysisApi = (resumeId) => axiosInstance.get(`/analysis/${resumeId}`);
export const improveResumeApi = (data) => axiosInstance.post('/analysis/improve', data);

export const matchJobApi = (data) => axiosInstance.post('/job/match', data);
export const generateCoverLetterApi = (data) => axiosInstance.post('/job/cover-letter', data);