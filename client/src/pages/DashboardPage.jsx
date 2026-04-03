import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS, ArcElement, Tooltip, Legend,
    CategoryScale, LinearScale, BarElement,
} from 'chart.js';
import { getAnalysisApi, improveResumeApi } from '../api/analysisApi';
import { getAllResumesApi } from '../api/resumeApi';
import Navbar from '../components/common/Navbar';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const getScoreColor = (s) => s >= 80 ? '#4ade80' : s >= 60 ? '#fbbf24' : '#f87171';
const getScoreLabel = (s) => s >= 80 ? 'Excellent' : s >= 60 ? 'Good' : s >= 40 ? 'Average' : 'Needs Work';
const getScoreBg = (s) => s >= 80 ? 'bg-green-500/10 border-green-500/30' : s >= 60 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-red-500/10 border-red-500/30';

const DashboardPage = ({ analysis: propAnalysis, jobMatch: propJobMatch, resume: propResume }) => {
    const [analysis, setAnalysis] = useState(propAnalysis);
    const [jobMatch, setJobMatch] = useState(propJobMatch);
    const [loading, setLoading] = useState(!propAnalysis);
    const [improving, setImproving] = useState(false);
    const [improvedContent, setImprovedContent] = useState(null);
    const [showImproved, setShowImproved] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const navigate = useNavigate();

    useEffect(() => {
        // If no analysis passed as prop, load latest from API
        if (!propAnalysis) {
            loadLatestAnalysis();
        }
    }, []);

    const loadLatestAnalysis = async () => {
        setLoading(true);
        try {
            const resumeRes = await getAllResumesApi();
            const resumes = resumeRes.data.data;
            if (resumes.length === 0) { setLoading(false); return; }

            // Get analysis for latest resume
            const latest = resumes[0];
            const analysisRes = await getAnalysisApi(latest._id);
            const data = analysisRes.data.data;

            // Build aiResult from stored analysis
            setAnalysis({
                analysis: data,
                aiResult: {
                    atsScore: data.atsScore,
                    extractedSkills: data.extractedSkills,
                    missingSkills: data.missingSkills,
                    scoreBreakdown: data.scoreBreakdown,
                    feedback: data.feedback,
                    suggestions: data.suggestions,
                    skillDistribution: data.skillDistribution,
                    detectedName: data.detectedName,
                    detectedRole: data.detectedRole,
                },
            });
        } catch {
            // No analysis yet — show empty state
        } finally {
            setLoading(false);
        }
    };

    const handleImprove = async () => {
        const resumeId = analysis?.analysis?.resume?._id || analysis?.analysis?.resume;
        if (!resumeId) { toast.error('Resume ID not found'); return; }
        setImproving(true);
        try {
            const res = await improveResumeApi({ resumeId });
            setImprovedContent(res.data.data);
            setShowImproved(true);
            setActiveTab('improve');
            toast.success('Resume improved!');
        } catch {
            toast.error('Improvement failed');
        } finally {
            setImproving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-950">
            <Navbar />
            <Loader text="Loading your dashboard..." />
        </div>
    );

    if (!analysis) return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Navbar />
            <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 text-center px-4">
                <div className="w-20 h-20 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-4xl">📊</div>
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">No analysis yet</h2>
                    <p className="text-gray-400">Upload and analyze a resume to see your dashboard</p>
                </div>
                <Link to="/analyze" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-xl transition">
                    Analyze Resume
                </Link>
            </div>
        </div>
    );

    const ai = analysis?.aiResult || {};
    const score = ai.atsScore || 0;
    const breakdown = ai.scoreBreakdown || {};
    const skillDist = ai.skillDistribution || {};

    const donutData = {
        labels: Object.keys(skillDist),
        datasets: [{
            data: Object.values(skillDist),
            backgroundColor: ['#6366f1', '#2dd4bf', '#f472b6', '#fbbf24'],
            borderColor: '#111827', borderWidth: 2,
        }],
    };

    const barData = {
        labels: Object.keys(breakdown).map(k => k.charAt(0).toUpperCase() + k.slice(1)),
        datasets: [{
            data: Object.values(breakdown),
            backgroundColor: Object.values(breakdown).map(v => getScoreColor(v)),
            borderRadius: 6,
        }],
    };

    const tabs = [
        { id: 'overview', label: '📊 Overview' },
        { id: 'skills', label: '🛠 Skills' },
        { id: 'feedback', label: '💬 Feedback' },
        { id: 'improve', label: '✨ Improve' },
        ...(jobMatch ? [{ id: 'jdmatch', label: '🎯 JD Match' }] : []),
    ];

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Navbar />
            <div className="max-w-6xl mx-auto px-4 py-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Resume Dashboard</h1>
                        <p className="text-gray-400 text-sm mt-1">
                            {ai.detectedName && `${ai.detectedName} · `}{ai.detectedRole}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link to="/analyze" className="border border-gray-700 hover:border-indigo-500 text-gray-300 hover:text-indigo-300 px-4 py-2 rounded-lg text-sm font-semibold transition">
                            + New Analysis
                        </Link>
                        <button
                            onClick={handleImprove}
                            disabled={improving}
                            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                        >
                            {improving ? '⏳ Improving...' : '✨ Improve Resume'}
                        </button>
                    </div>
                </div>

                {/* Score Hero */}
                <div className={`border rounded-2xl p-6 mb-6 ${getScoreBg(score)}`}>
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="text-center">
                            <div className="text-7xl font-black" style={{ color: getScoreColor(score) }}>{score}</div>
                            <div className="text-sm text-gray-400 mt-1">ATS Score</div>
                            <div className="text-xs font-bold mt-1" style={{ color: getScoreColor(score) }}>{getScoreLabel(score)}</div>
                        </div>
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'JD Match', value: jobMatch ? `${jobMatch.matchPercentage}%` : '—', color: jobMatch ? getScoreColor(jobMatch.matchPercentage) : '#6b7280' },
                                { label: 'Skills Found', value: ai.extractedSkills?.length || 0, color: '#818cf8' },
                                { label: 'Missing Skills', value: ai.missingSkills?.length || 0, color: '#f87171' },
                                { label: 'Experience', value: ai.experience || '—', color: '#34d399' },
                            ].map(card => (
                                <div key={card.label} className="bg-gray-900/60 rounded-xl p-4 text-center border border-gray-800">
                                    <div className="text-2xl font-bold" style={{ color: card.color }}>{card.value}</div>
                                    <div className="text-xs text-gray-400 mt-1">{card.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition ${activeTab === tab.id
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Score Breakdown */}
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Score Breakdown</h2>
                            {Object.entries(breakdown).map(([k, v]) => (
                                <div key={k} className="mb-3">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-300 capitalize">{k}</span>
                                        <span className="font-bold" style={{ color: getScoreColor(v) }}>{v}</span>
                                    </div>
                                    <div className="h-2 bg-gray-800 rounded-full">
                                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${v}%`, background: getScoreColor(v) }} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Skill Distribution Chart */}
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Skill Distribution</h2>
                            <div className="h-48">
                                <Doughnut data={donutData} options={{
                                    responsive: true, maintainAspectRatio: false,
                                    plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af', font: { size: 11 }, padding: 12 } } },
                                }} />
                            </div>
                        </div>

                        {/* Bar Chart */}
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 md:col-span-2">
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Section Scores</h2>
                            <div className="h-48">
                                <Bar data={barData} options={{
                                    responsive: true, maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    scales: {
                                        x: { ticks: { color: '#6b7280' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                                        y: { min: 0, max: 100, ticks: { color: '#6b7280' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                                    },
                                }} />
                            </div>
                        </div>

                        {/* Suggestions */}
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 md:col-span-2">
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">💡 Smart Suggestions</h2>
                            <div className="grid md:grid-cols-2 gap-3">
                                {ai.suggestions?.map((s, i) => (
                                    <div key={i} className="flex gap-3 bg-gray-800/50 rounded-lg p-3">
                                        <span className="text-indigo-400 text-lg">→</span>
                                        <span className="text-sm text-gray-300">{s}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'skills' && (
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">✅ Your Skills</h2>
                            <div className="flex flex-wrap gap-2">
                                {ai.extractedSkills?.map(s => (
                                    <span key={s} className="bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 px-3 py-1.5 rounded-full text-sm font-medium">{s}</span>
                                ))}
                            </div>
                        </div>
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">❌ Missing Skills</h2>
                            <div className="flex flex-wrap gap-2">
                                {ai.missingSkills?.map(s => (
                                    <span key={s} className="bg-red-500/10 text-red-300 border border-red-500/20 px-3 py-1.5 rounded-full text-sm font-medium">{s}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'feedback' && (
                    <div className="space-y-4">
                        {ai.feedback?.map((f, i) => (
                            <div key={i} className={`border-l-4 pl-5 py-4 rounded-r-xl bg-gray-900 ${f.type === 'good' ? 'border-green-500' : f.type === 'bad' ? 'border-red-500' : 'border-amber-500'
                                }`}>
                                <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${f.type === 'good' ? 'text-green-400' : f.type === 'bad' ? 'text-red-400' : 'text-amber-400'
                                    }`}>
                                    {f.type === 'good' ? '✅' : f.type === 'bad' ? '❌' : '⚠️'} {f.section}
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed">{f.text}</p>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'improve' && (
                    <div className="space-y-4">
                        {!improvedContent ? (
                            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
                                <p className="text-3xl mb-3">✨</p>
                                <p className="text-white font-semibold mb-2">AI Resume Improver</p>
                                <p className="text-gray-400 text-sm mb-6">Let AI rewrite your summary, experience, and skills with better language and metrics</p>
                                <button onClick={handleImprove} disabled={improving} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold px-8 py-3 rounded-xl transition">
                                    {improving ? '⏳ Improving...' : '✨ Improve My Resume'}
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                                    <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">Key Changes Made</h3>
                                    <div className="space-y-2">
                                        {improvedContent.keyChanges?.map((c, i) => (
                                            <div key={i} className="flex gap-2 text-sm text-gray-300"><span className="text-green-400">✓</span>{c}</div>
                                        ))}
                                    </div>
                                </div>
                                {[
                                    { label: 'Improved Summary', content: improvedContent.improvedSummary },
                                    { label: 'Improved Experience', content: improvedContent.improvedExperience },
                                    { label: 'Improved Skills', content: improvedContent.improvedSkills },
                                ].map(sec => (
                                    <div key={sec.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                                        <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">{sec.label}</h3>
                                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{sec.content}</p>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'jdmatch' && jobMatch && (
                    <div className="space-y-6">
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Match Score</h2>
                            <div className="flex items-baseline gap-3 mb-4">
                                <span className="text-5xl font-black" style={{ color: getScoreColor(jobMatch.matchPercentage) }}>{jobMatch.matchPercentage}%</span>
                                <span className="text-gray-400">match with job description</span>
                            </div>
                            <div className="h-3 bg-gray-800 rounded-full">
                                <div className="h-full rounded-full transition-all" style={{ width: `${jobMatch.matchPercentage}%`, background: getScoreColor(jobMatch.matchPercentage) }} />
                            </div>
                            <p className="text-gray-400 text-sm mt-3">{jobMatch.summary}</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                                <h3 className="text-xs font-bold text-green-400 uppercase tracking-wider mb-3">✅ Matched Keywords</h3>
                                <div className="flex flex-wrap gap-2">
                                    {jobMatch.matchedKeywords?.map(k => (
                                        <span key={k} className="bg-green-500/10 text-green-300 border border-green-500/20 px-3 py-1 rounded-full text-xs font-medium">{k}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                                <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3">❌ Missing Keywords</h3>
                                <div className="flex flex-wrap gap-2">
                                    {jobMatch.missingKeywords?.map(k => (
                                        <span key={k} className="bg-red-500/10 text-red-300 border border-red-500/20 px-3 py-1 rounded-full text-xs font-medium">{k}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;