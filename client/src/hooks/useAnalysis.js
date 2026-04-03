import { useState, useCallback } from 'react';
import { analyzeResumeApi, getAnalysisApi, improveResumeApi } from '../api/analysisApi';
import toast from 'react-hot-toast';

const useAnalysis = () => {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [improving, setImproving] = useState(false);
    const [improvedContent, setImprovedContent] = useState(null);

    const analyze = useCallback(async (resumeId, targetRole = '', industry = '') => {
        setLoading(true);
        try {
            const res = await analyzeResumeApi({ resumeId, targetRole, industry });
            setAnalysis(res.data.data);
            return res.data.data;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Analysis failed');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchExisting = useCallback(async (resumeId) => {
        setLoading(true);
        try {
            const res = await getAnalysisApi(resumeId);
            setAnalysis(res.data.data);
            return res.data.data;
        } catch {
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const improve = useCallback(async (resumeId) => {
        setImproving(true);
        try {
            const res = await improveResumeApi({ resumeId });
            setImprovedContent(res.data.data);
            toast.success('Resume improved!');
            return res.data.data;
        } catch {
            toast.error('Improvement failed');
            return null;
        } finally {
            setImproving(false);
        }
    }, []);

    return { analysis, loading, improving, improvedContent, analyze, fetchExisting, improve };
};

export default useAnalysis;