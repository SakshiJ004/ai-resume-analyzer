import axiosInstance from './axiosInstance';

// Upload resume file
export const uploadResumeApi = (formData) =>
    axiosInstance.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

// Get all resumes for current user
export const getAllResumesApi = () =>
    axiosInstance.get('/resume/all');

// Get single resume by ID
export const getResumeApi = (id) =>
    axiosInstance.get(`/resume/${id}`);

// Delete resume
export const deleteResumeApi = (id) =>
    axiosInstance.delete(`/resume/${id}`);