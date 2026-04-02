import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const navLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/analyze', label: 'Analyze' },
    { path: '/history', label: 'History' },
    { path: '/cover-letter', label: 'Cover Letter' },
];

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.success('Logged out');
        navigate('/login');
    };

    return (
        <nav className="border-b border-gray-800 bg-gray-950 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
                {/* Logo */}
                <Link to="/dashboard" className="flex items-center gap-2 font-bold text-white">
                    <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center text-xs">✦</div>
                    ResumeAI
                </Link>

                {/* Links */}
                <div className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${location.pathname === link.path
                                    ? 'bg-indigo-500/15 text-indigo-300'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* User */}
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2">
                        <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-300">{user?.name}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-xs border border-gray-700 hover:border-red-700 text-gray-400 hover:text-red-400 px-3 py-1.5 rounded-lg transition"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;