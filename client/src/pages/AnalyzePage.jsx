import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { uploadResumeApi, analyzeResumeApi, matchJobApi } from '../api/resumeApi';
import DashboardPage from './DashboardPage';

const AnalyzePage = () => {
    const [step, setStep] = useState(1); // 1=upload, 2=analyzing, 3=results
    const [resume, setResume] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [jobMatch, setJobMatch] = useState(null);
    const [form, setForm] = useState({ targetRole: '', industry: '', jd: '' });

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
        maxSize: 5 * 1024 * 1024,
        multiple: false,
        onDrop: async (acceptedFiles) => {
            if (!acceptedFiles[0]) return;
            const formData = new FormData();
            formData.append('resume', acceptedFiles[0]);
            try {
                const res = await uploadResumeApi(formData);
                setResume(res.data.data);
                toast.success('Resume uploaded!');
            } catch (err) {
                toast.error('Upload failed');
            }
        },
    });

    const handleAnalyze = async () => {
        if (!resume) { toast.error('Upload a resume first'); return; }
        setStep(2);
        try {
            const res = await analyzeResumeApi({
                resumeId: resume._id,
                targetRole: form.targetRole,
                industry: form.industry,
            });
            setAnalysis(res.data.data);

            if (form.jd) {
                const jdRes = await matchJobApi({
                    resumeId: resume._id,
                    jobDescription: form.jd,
                });
                setJobMatch(jdRes.data.data.result);
            }
            setStep(3);
        } catch (err) {
            toast.error('Analysis failed');
            setStep(1);
        }
    };

    if (step === 2) return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center flex-col gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500" />
            <p className="text-gray-400">Analyzing your resume with AI...</p>
        </div>
    );

    if (step === 3) return <DashboardPage analysis={analysis} jobMatch={jobMatch} resume={resume} />;

    return (
        <div className="min-h-screen bg-gray-950 text-white p-6">
            <div className="max-w-2xl mx-auto space-y-6">
                <h1 className="text-2xl font-bold">Analyze Your Resume</h1>

                {/* Upload Zone */}
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition ${isDragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-gray-700 hover:border-gray-500'
                        }`}
                >
                    <input {...getInputProps()} />
                    <p className="text-4xl mb-3">📄</p>
                    {resume
                        ? <p className="text-green-400 font-medium">✓ {resume.originalName}</p>
                        : <p className="text-gray-400">{isDragActive ? 'Drop it!' : 'Drop PDF/DOCX here or click to upload'}</p>
                    }
                </div>

                {/* Settings */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
                    <h2 className="font-semibold text-gray-200">Settings (Optional)</h2>
                    <input
                        type="text"
                        placeholder="Target Role (e.g. Senior React Developer)"
                        value={form.targetRole}
                        onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                    />
                    <input
                        type="text"
                        placeholder="Industry (e.g. Fintech)"
                        value={form.industry}
                        onChange={(e) => setForm({ ...form, industry: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                    />
                    <textarea
                        rows={5}
                        placeholder="Paste Job Description here for match analysis (optional)"
                        value={form.jd}
                        onChange={(e) => setForm({ ...form, jd: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 resize-none"
                    />
                </div>

                <button
                    onClick={handleAnalyze}
                    disabled={!resume}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition"
                >
                    ✦ Analyze Resume
                </button>
            </div>
        </div>
    );
};

export default AnalyzePage;