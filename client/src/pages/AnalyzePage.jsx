import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { uploadResumeApi } from '../api/resumeApi';
import { analyzeResumeApi, matchJobApi } from '../api/analysisApi';
import Navbar from '../components/common/Navbar';
import DashboardPage from './DashboardPage';

const AnalyzePage = () => {
    const [step, setStep] = useState(1);
    const [resume, setResume] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [jobMatch, setJobMatch] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [form, setForm] = useState({
        targetRole: '',
        industry: '',
        jd: '',
    });

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        },
        maxSize: 5 * 1024 * 1024,
        multiple: false,
        onDrop: async (acceptedFiles, rejectedFiles) => {
            if (rejectedFiles.length > 0) {
                toast.error('Invalid file. Use PDF or DOCX under 5MB');
                return;
            }
            if (!acceptedFiles[0]) return;

            setUploading(true);
            const formData = new FormData();
            formData.append('resume', acceptedFiles[0]);

            try {
                const res = await uploadResumeApi(formData);
                setResume(res.data.data);
                toast.success('Resume uploaded successfully!');
            } catch (err) {
                toast.error(err.response?.data?.message || 'Upload failed');
            } finally {
                setUploading(false);
            }
        },
    });

    const handleAnalyze = async () => {
        if (!resume) {
            toast.error('Please upload a resume first');
            return;
        }

        setStep(2);

        try {
            // Run AI analysis
            const res = await analyzeResumeApi({
                resumeId: resume._id,
                targetRole: form.targetRole,
                industry: form.industry,
            });
            setAnalysis(res.data.data);

            // Run JD match if provided
            if (form.jd.trim()) {
                try {
                    const jdRes = await matchJobApi({
                        resumeId: resume._id,
                        jobDescription: form.jd,
                    });
                    setJobMatch(jdRes.data.data.result);
                } catch {
                    console.log('JD match failed, continuing...');
                }
            }

            setStep(3);
        } catch (err) {
            console.error('Analysis error:', err);
            toast.error(err.response?.data?.message || 'Analysis failed. Please try again.');
            setStep(1);
        }
    };

    // Loading screen
    if (step === 2) {
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500" />
                <p className="text-white text-lg font-semibold">Analyzing your resume...</p>
                <p className="text-gray-400 text-sm">This may take 15-30 seconds</p>
            </div>
        );
    }

    // Results screen
    if (step === 3) {
        return <DashboardPage analysis={analysis} jobMatch={jobMatch} resume={resume} />;
    }

    // Upload screen
    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Navbar />
            <div className="max-w-2xl mx-auto p-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Analyze Your Resume</h1>
                    <p className="text-gray-400 text-sm mt-1">Upload your resume and get an AI-powered ATS score</p>
                </div>

                {/* Upload Zone */}
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition ${isDragActive
                            ? 'border-indigo-500 bg-indigo-500/10'
                            : resume
                                ? 'border-green-500 bg-green-500/5'
                                : 'border-gray-700 hover:border-gray-500'
                        }`}
                >
                    <input {...getInputProps()} />
                    {uploading ? (
                        <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
                            <p className="text-gray-400">Uploading...</p>
                        </div>
                    ) : resume ? (
                        <div className="flex flex-col items-center gap-2">
                            <p className="text-3xl">✅</p>
                            <p className="text-green-400 font-semibold">{resume.originalName}</p>
                            <p className="text-gray-500 text-sm">Click to replace</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <p className="text-4xl">📄</p>
                            <p className="text-white font-semibold">
                                {isDragActive ? 'Drop it here!' : 'Drop your resume here'}
                            </p>
                            <p className="text-gray-400 text-sm">PDF or DOCX • Max 5MB</p>
                        </div>
                    )}
                </div>

                {/* Settings */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
                    <h2 className="font-semibold text-gray-200">Settings (Optional)</h2>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Target Role</label>
                        <input
                            type="text"
                            placeholder="e.g. Senior React Developer"
                            value={form.targetRole}
                            onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Industry</label>
                        <input
                            type="text"
                            placeholder="e.g. Fintech, Healthcare, IT"
                            value={form.industry}
                            onChange={(e) => setForm({ ...form, industry: e.target.value })}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">
                            Job Description <span className="text-gray-600">(for match analysis)</span>
                        </label>
                        <textarea
                            rows={5}
                            placeholder="Paste the job description here to get a match percentage..."
                            value={form.jd}
                            onChange={(e) => setForm({ ...form, jd: e.target.value })}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition resize-none"
                        />
                    </div>
                </div>

                {/* Analyze Button */}
                <button
                    onClick={handleAnalyze}
                    disabled={!resume || uploading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition text-lg"
                >
                    ✦ Analyze Resume
                </button>
            </div>
        </div>
    );
};

export default AnalyzePage;