import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAllResumesApi, deleteResumeApi } from '../api/resumeApi';
import { analyzeResumeApi } from '../api/analysisApi';
import Navbar from '../components/common/Navbar';
import Loader from '../components/common/Loader';

const getScoreColor = (s) => !s ? 'text-gray-500' : s >= 80 ? 'text-green-400' : s >= 60 ? 'text-amber-400' : 'text-red-400';

const HistoryPage = () => {
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(null);
    const [analyzing, setAnalyzing] = useState(null);
    const navigate = useNavigate();

    useEffect(() => { fetchResumes(); }, []);

    const fetchResumes = async () => {
        try {
            const res = await getAllResumesApi();
            setResumes(res.data.data);
        } catch { toast.error('Failed to load resumes'); }
        finally { setLoading(false); }
    };

    const handleReanalyze = async (resumeId) => {
        setAnalyzing(resumeId);
        try {
            toast.loading('Re-analyzing...', { id: 'reanalyze' });
            await analyzeResumeApi({ resumeId, targetRole: '', industry: '' });
            toast.success('Analysis updated!', { id: 'reanalyze' });
            navigate('/dashboard'); // ✅ Go to dashboard after reanalyze
        } catch {
            toast.error('Re-analysis failed', { id: 'reanalyze' });
        } finally { setAnalyzing(null); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this resume? This cannot be undone.')) return;
        setDeleting(id);
        try {
            await deleteResumeApi(id);
            setResumes(prev => prev.filter(r => r._id !== id));
            toast.success('Resume deleted');
        } catch { toast.error('Delete failed'); }
        finally { setDeleting(null); }
    };

    if (loading) return <div className="min-h-screen bg-gray-950"><Navbar /><Loader /></div>;

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Navbar />
            <div className="max-w-4xl mx-auto p-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold">Resume History</h1>
                        <p className="text-gray-400 text-sm mt-1">{resumes.length} resume{resumes.length !== 1 ? 's' : ''} uploaded</p>
                    </div>
                    <Link to="/analyze" className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-semibold transition">
                        + Upload New
                    </Link>
                </div>

                {resumes.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-4xl mb-4">📂</p>
                        <p className="text-xl font-semibold text-gray-300 mb-2">No resumes yet</p>
                        <Link to="/analyze" className="inline-block mt-4 bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 rounded-lg font-semibold transition">
                            Upload Resume
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {resumes.length >= 2 && (
                            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-indigo-300">Version Comparison Available</p>
                                    <p className="text-xs text-gray-400 mt-0.5">You have {resumes.length} versions. Compare scores below.</p>
                                </div>
                                <div className="text-sm text-gray-400">Latest score: <span className="font-bold text-white">—</span></div>
                            </div>
                        )}

                        {resumes.map((resume, index) => (
                            <div key={resume._id} className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-5 transition">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-indigo-500/15 rounded-lg flex items-center justify-center text-xl flex-shrink-0">📄</div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="font-semibold text-white">{resume.originalName}</p>
                                                <span className="bg-gray-800 text-gray-400 text-xs px-2 py-0.5 rounded-full">v{resume.version}</span>
                                                {index === 0 && <span className="bg-indigo-500/15 text-indigo-300 text-xs px-2 py-0.5 rounded-full">Latest</span>}
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                                                <span className="text-xs text-gray-500 uppercase">{resume.fileType}</span>
                                                <span className="text-xs text-gray-500">{new Date(resume.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                                {resume.parsedData?.skills?.length > 0 && (
                                                    <span className="text-xs text-gray-500">{resume.parsedData.skills.length} skills detected</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => handleReanalyze(resume._id)}
                                            disabled={analyzing === resume._id}
                                            className="text-xs border border-gray-700 hover:border-indigo-500 text-gray-300 hover:text-indigo-300 px-3 py-1.5 rounded-lg transition disabled:opacity-40"
                                        >
                                            {analyzing === resume._id ? '⏳' : 'Re-analyze'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(resume._id)}
                                            disabled={deleting === resume._id}
                                            className="text-xs border border-red-900/50 hover:border-red-500 text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg transition disabled:opacity-40"
                                        >
                                            {deleting === resume._id ? '...' : 'Delete'}
                                        </button>
                                    </div>
                                </div>

                                {resume.parsedData?.skills?.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-1.5">
                                        {resume.parsedData.skills.slice(0, 8).map(skill => (
                                            <span key={skill} className="bg-gray-800 text-gray-400 text-xs px-2.5 py-1 rounded-full">{skill}</span>
                                        ))}
                                        {resume.parsedData.skills.length > 8 && (
                                            <span className="bg-gray-800 text-gray-500 text-xs px-2.5 py-1 rounded-full">+{resume.parsedData.skills.length - 8} more</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoryPage;