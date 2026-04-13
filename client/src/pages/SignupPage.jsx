import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { signupApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';

const SignupPage = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const { login } = useAuth();
    const navigate = useNavigate();

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Name is required';
        else if (form.name.trim().length < 2) e.name = 'Name too short';
        if (!form.email) e.email = 'Email is required';
        else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email';
        if (!form.password) e.password = 'Password is required';
        else if (form.password.length < 6) e.password = 'Minimum 6 characters';
        else if (!/(?=.*[A-Z])/.test(form.password)) e.password = 'Include at least one uppercase letter';
        if (!form.confirm) e.confirm = 'Please confirm your password';
        else if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const getPasswordStrength = () => {
        const p = form.password;
        if (!p) return { strength: 0, label: '', color: '' };
        let score = 0;
        if (p.length >= 6) score++;
        if (p.length >= 10) score++;
        if (/[A-Z]/.test(p)) score++;
        if (/[0-9]/.test(p)) score++;
        if (/[^A-Za-z0-9]/.test(p)) score++;
        if (score <= 2) return { strength: score, label: 'Weak', color: 'bg-red-500' };
        if (score <= 3) return { strength: score, label: 'Fair', color: 'bg-amber-500' };
        return { strength: score, label: 'Strong', color: 'bg-green-500' };
    };

    const pwStrength = getPasswordStrength();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            const res = await signupApi({ name: form.name.trim(), email: form.email.toLowerCase(), password: form.password });
            const { token, user } = res.data.data;
            login(token, user);
            toast.success('Account created! Welcome 🎉');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    const field = (label, key, type = 'text', placeholder = '', showToggle = false, showState = false, setShow = null) => (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
            <div className="relative">
                <input
                    type={showToggle ? (showState ? 'text' : 'password') : type}
                    value={form[key]}
                    onChange={(e) => { setForm({ ...form, [key]: e.target.value }); setErrors({ ...errors, [key]: '' }); }}
                    className={`w-full bg-gray-800 border rounded-lg px-4 py-3 ${showToggle ? 'pr-12' : ''} text-white placeholder-gray-500 focus:outline-none transition ${errors[key] ? 'border-red-500' : 'border-gray-700 focus:border-indigo-500'}`}
                    placeholder={placeholder}
                />
                {showToggle && (
                    <button type="button" onClick={() => setShow(!showState)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-lg">
                        {showState ? '🙈' : '👁️'}
                    </button>
                )}
            </div>
            {errors[key] && <p className="text-red-400 text-xs mt-1">{errors[key]}</p>}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white">✦</div>
                        <span className="text-xl font-bold text-white">ResumeAI</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-white">Create your account</h1>
                    <p className="text-gray-400 text-sm mt-1">Start analyzing resumes for free</p>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        {field('Full Name', 'name', 'text', 'John Doe')}
                        {field('Email', 'email', 'email', 'you@example.com')}

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={(e) => { setForm({ ...form, password: e.target.value }); setErrors({ ...errors, password: '' }); }}
                                    className={`w-full bg-gray-800 border rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none transition ${errors.password ? 'border-red-500' : 'border-gray-700 focus:border-indigo-500'}`}
                                    placeholder="Min 6 characters"
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-lg">
                                    {showPass ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {form.password && (
                                <div className="mt-2">
                                    <div className="flex gap-1 mb-1">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={i} className={`h-1 flex-1 rounded-full ${i <= pwStrength.strength ? pwStrength.color : 'bg-gray-700'}`} />
                                        ))}
                                    </div>
                                    <p className={`text-xs ${pwStrength.strength <= 2 ? 'text-red-400' : pwStrength.strength <= 3 ? 'text-amber-400' : 'text-green-400'}`}>
                                        {pwStrength.label} password
                                    </p>
                                </div>
                            )}
                            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                        </div>

                        {field('Confirm Password', 'confirm', 'password', 'Repeat password', true, showConfirm, setShowConfirm)}

                        <button type="submit" disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2">
                            {loading ? (<><span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />Creating...</>) : 'Create Account →'}
                        </button>
                    </form>

                    <p className="text-center text-gray-400 text-sm mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;