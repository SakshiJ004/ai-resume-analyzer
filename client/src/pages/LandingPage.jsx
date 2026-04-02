import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
    { icon: '🎯', title: 'ATS Score', desc: 'Get a 0–100 score showing how well your resume passes ATS filters.' },
    { icon: '🤖', title: 'AI Analysis', desc: 'Powered by Gemini AI to give section-wise feedback and suggestions.' },
    { icon: '📊', title: 'Job Match', desc: 'Paste any job description and see your match percentage instantly.' },
    { icon: '✍️', title: 'AI Rewriter', desc: 'Let AI rewrite your summary, experience, and skills section.' },
    { icon: '📝', title: 'Cover Letter', desc: 'Generate a personalized cover letter for any role and company.' },
    { icon: '📈', title: 'Version History', desc: 'Track your resume improvements over time with score comparison.' },
];

const LandingPage = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            {/* Navbar */}
            <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-sm">✦</div>
                    <span className="font-bold text-lg">ResumeAI</span>
                </div>
                <div className="flex gap-3">
                    {user ? (
                        <Link to="/dashboard" className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-semibold transition">
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link to="/login" className="text-gray-300 hover:text-white px-4 py-2 text-sm transition">Login</Link>
                            <Link to="/signup" className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-semibold transition">
                                Get Started Free
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero */}
            <section className="text-center py-24 px-6">
                <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-sm text-indigo-300 mb-6">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
                    Powered by Gemini AI
                </div>
                <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                    Land your dream job<br />
                    <span className="text-indigo-400">with AI-powered resume analysis</span>
                </h1>
                <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
                    Upload your resume and get an instant ATS score, skill gap analysis, job match percentage, and AI-generated improvements.
                </p>
                <div className="flex gap-4 justify-center">
                    <Link to="/signup" className="bg-indigo-600 hover:bg-indigo-700 px-8 py-3 rounded-xl font-bold text-lg transition">
                        Analyze My Resume →
                    </Link>
                    <Link to="/login" className="border border-gray-700 hover:border-gray-500 px-8 py-3 rounded-xl font-bold text-lg transition text-gray-300">
                        Sign In
                    </Link>
                </div>
            </section>

            {/* Features */}
            <section className="max-w-5xl mx-auto px-6 pb-24">
                <h2 className="text-2xl font-bold text-center mb-12 text-gray-200">Everything you need to get hired</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {features.map((f) => (
                        <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-600 transition">
                            <div className="text-3xl mb-4">{f.icon}</div>
                            <h3 className="font-bold text-white mb-2">{f.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-800 text-center py-6 text-gray-500 text-sm">
                © {new Date().getFullYear()} ResumeAI. Built with MERN + Gemini AI.
            </footer>
        </div>
    );
};

export default LandingPage;