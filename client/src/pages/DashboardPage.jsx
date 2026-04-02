import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Link } from 'react-router-dom';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
};

const DashboardPage = ({ analysis, jobMatch, resume }) => {
    if (!analysis) return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4 text-center p-6">
            <p className="text-4xl">📊</p>
            <p className="text-xl font-bold text-white">No analysis yet</p>
            <p className="text-gray-400">Upload and analyze a resume to see your dashboard</p>
            <Link to="/analyze" className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition">
                Analyze Resume
            </Link>
        </div>
    );

    const { aiResult } = analysis;
    const breakdown = aiResult?.scoreBreakdown || {};
    const skillDist = aiResult?.skillDistribution || {};

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
            label: 'Score',
            data: Object.values(breakdown),
            backgroundColor: Object.values(breakdown).map(v => v >= 80 ? '#4ade80' : v >= 60 ? '#fbbf24' : '#f87171'),
            borderRadius: 6,
        }],
    };

    const score = aiResult?.atsScore || 0;

    return (
        <div className="min-h-screen bg-gray-950 text-white p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Resume Dashboard</h1>
                    <Link to="/analyze" className="text-sm text-indigo-400 hover:underline">+ New Analysis</Link>
                </div>

                {/* Metric Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'ATS Score', value: `${score}/100`, color: getScoreColor(score) },
                        { label: 'JD Match', value: jobMatch ? `${jobMatch.matchPercentage}%` : '—', color: jobMatch ? getScoreColor(jobMatch.matchPercentage) : 'text-gray-500' },
                        { label: 'Skills Found', value: aiResult?.extractedSkills?.length || 0, color: 'text-indigo-400' },
                        { label: 'Missing Skills', value: aiResult?.missingSkills?.length || 0, color: 'text-red-400' },
                    ].map((card) => (
                        <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{card.label}</p>
                            <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
                        </div>
                    ))}
                </div>

                {/* Charts Row */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Skill Distribution</h2>
                        <div className="h-52"><Doughnut data={donutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af', font: { size: 11 } } } } }} /></div>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Score Breakdown</h2>
                        <div className="h-52"><Bar data={barData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#6b7280' } }, y: { min: 0, max: 100, ticks: { color: '#6b7280' } } } }} /></div>
                    </div>
                </div>

                {/* Skills */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Skills Analysis</h2>
                    <p className="text-xs text-gray-500 mb-2">Extracted Skills</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {aiResult?.extractedSkills?.map(s => (
                            <span key={s} className="bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-medium">{s}</span>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 mb-2">Missing / Recommended Skills</p>
                    <div className="flex flex-wrap gap-2">
                        {aiResult?.missingSkills?.map(s => (
                            <span key={s} className="bg-red-500/10 text-red-300 border border-red-500/20 px-3 py-1 rounded-full text-xs font-medium">{s}</span>
                        ))}
                    </div>
                </div>

                {/* AI Feedback */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">AI Feedback</h2>
                    <div className="space-y-3">
                        {aiResult?.feedback?.map((f, i) => (
                            <div key={i} className={`border-l-2 pl-4 py-1 rounded-r ${f.type === 'good' ? 'border-green-500' : f.type === 'bad' ? 'border-red-500' : 'border-amber-500'}`}>
                                <p className={`text-xs font-bold uppercase tracking-wider ${f.type === 'good' ? 'text-green-400' : f.type === 'bad' ? 'text-red-400' : 'text-amber-400'}`}>{f.section}</p>
                                <p className="text-sm text-gray-300 mt-1">{f.text}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Job Match */}
                {jobMatch && (
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Job Match</h2>
                        <p className={`text-4xl font-bold mb-3 ${getScoreColor(jobMatch.matchPercentage)}`}>{jobMatch.matchPercentage}%</p>
                        <div className="h-2 bg-gray-800 rounded-full mb-4">
                            <div className="h-full rounded-full bg-indigo-500" style={{ width: `${jobMatch.matchPercentage}%` }} />
                        </div>
                        <p className="text-xs text-gray-500 mb-2">Missing Keywords</p>
                        <div className="flex flex-wrap gap-2">
                            {jobMatch.missingKeywords?.map(k => (
                                <span key={k} className="bg-red-500/10 text-red-300 border border-red-500/20 px-3 py-1 rounded-full text-xs">{k}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Suggestions */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Smart Suggestions</h2>
                    <div className="space-y-2">
                        {aiResult?.suggestions?.map((s, i) => (
                            <div key={i} className="flex gap-3 text-sm text-gray-300">
                                <span className="text-indigo-400 mt-0.5">→</span>
                                <span>{s}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;