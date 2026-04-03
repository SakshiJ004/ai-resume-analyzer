import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getAllResumesApi } from '../api/resumeApi';
import { generateCoverLetterApi } from '../api/analysisApi';
import Navbar from '../components/common/Navbar';
import Loader from '../components/common/Loader';

const CoverLetterPage = () => {
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [coverLetter, setCoverLetter] = useState('');
    const [copied, setCopied] = useState(false);
    const [form, setForm] = useState({
        resumeId: '',
        jobRole: '',
        company: '',
        jobDescription: '',
    });

    useEffect(() => {
        getAllResumesApi()
            .then((res) => {
                setResumes(res.data.data);
                if (res.data.data.length > 0) {
                    setForm((f) => ({ ...f, resumeId: res.data.data[0]._id }));
                }
            })
            .catch(() => toast.error('Failed to load resumes'))
            .finally(() => setLoading(false));
    }, []);

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!form.resumeId) { toast.error('Please select a resume'); return; }
        if (!form.jobRole) { toast.error('Job role is required'); return; }
        if (!form.company) { toast.error('Company name is required'); return; }

        setGenerating(true);
        setCoverLetter('');
        try {
            const res = await generateCoverLetterApi(form);
            setCoverLetter(res.data.data.coverLetter);
            toast.success('Cover letter generated!');
        } catch {
            toast.error('Generation failed. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(coverLetter);
        setCopied(true);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return <Loader />;

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Navbar />
            <div className="max-w-4xl mx-auto p-6">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold">Cover Letter Generator</h1>
                    <p className="text-gray-400 text-sm mt-1">Generate a personalized cover letter using AI in seconds</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Form */}
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <h2 className="font-semibold text-gray-200 mb-5">Details</h2>
                        <form onSubmit={handleGenerate} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Select Resume</label>
                                <select
                                    value={form.resumeId}
                                    onChange={(e) => setForm({ ...form, resumeId: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                                    required
                                >
                                    {resumes.length === 0 && <option value="">No resumes uploaded</option>}
                                    {resumes.map((r) => (
                                        <option key={r._id} value={r._id}>{r.originalName} (v{r.version})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Job Role *</label>
                                <input
                                    type="text"
                                    value={form.jobRole}
                                    onChange={(e) => setForm({ ...form, jobRole: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                                    placeholder="e.g. Senior Frontend Engineer"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Company Name *</label>
                                <input
                                    type="text"
                                    value={form.company}
                                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                                    placeholder="e.g. Google, Infosys, Startups"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Job Description (optional but recommended)</label>
                                <textarea
                                    rows={5}
                                    value={form.jobDescription}
                                    onChange={(e) => setForm({ ...form, jobDescription: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 resize-none"
                                    placeholder="Paste the job description here for a more personalized letter..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={generating || resumes.length === 0}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition"
                            >
                                {generating ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                        Generating...
                                    </span>
                                ) : '✦ Generate Cover Letter'}
                            </button>
                        </form>
                    </div>

                    {/* Output */}
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-gray-200">Generated Letter</h2>
                            {coverLetter && (
                                <button
                                    onClick={handleCopy}
                                    className="text-xs border border-gray-700 hover:border-indigo-500 text-gray-300 hover:text-indigo-300 px-3 py-1.5 rounded-lg transition"
                                >
                                    {copied ? '✓ Copied' : 'Copy'}
                                </button>
                            )}
                        </div>

                        {generating && (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto mb-3" />
                                    <p className="text-gray-400 text-sm">Writing your letter...</p>
                                </div>
                            </div>
                        )}

                        {!generating && !coverLetter && (
                            <div className="flex-1 flex items-center justify-center text-center">
                                <div>
                                    <p className="text-3xl mb-3">✉️</p>
                                    <p className="text-gray-500 text-sm">Fill in the details and click generate</p>
                                </div>
                            </div>
                        )}

                        {!generating && coverLetter && (
                            <div className="flex-1 overflow-y-auto">
                                <div className="bg-gray-800/50 rounded-lg p-4 text-sm text-gray-300 leading-relaxed whitespace-pre-line font-mono">
                                    {coverLetter}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoverLetterPage;