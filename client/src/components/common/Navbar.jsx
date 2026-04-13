import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/analyze', label: 'Analyze', icon: '🔍' },
    { path: '/history', label: 'History', icon: '📋' },
    { path: '/cover-letter', label: 'Cover Letter', icon: '✉️' },
];

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/'); // ✅ Go to login, not landing
    };

    return (
        <nav className="border-b border-gray-800 bg-gray-950/95 backdrop-blur sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                <Link to="/dashboard" className="flex items-center gap-2 font-bold text-white">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-sm">✦</div>
                    <span className="hidden sm:block">ResumeAI</span>
                </Link>

                <div className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => (
                        <Link key={link.path} to={link.path}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${location.pathname === link.path
                                    ? 'bg-indigo-500/15 text-indigo-300'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                }`}>
                            <span>{link.icon}</span>{link.label}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-1.5">
                        <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-300 font-medium">{user?.name}</span>
                    </div>
                    <button onClick={handleLogout}
                        className="text-xs border border-gray-700 hover:border-red-600 text-gray-400 hover:text-red-400 px-3 py-1.5 rounded-lg transition font-medium">
                        Logout
                    </button>
                </div>

                {/* Mobile nav */}
                <div className="flex md:hidden gap-1">
                    {navLinks.map(link => (
                        <Link key={link.path} to={link.path}
                            className={`p-2 rounded-lg text-lg ${location.pathname === link.path ? 'bg-indigo-500/15' : ''}`}>
                            {link.icon}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;