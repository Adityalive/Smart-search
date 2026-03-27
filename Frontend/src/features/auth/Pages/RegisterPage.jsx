import React, { useState } from 'react';
import { useAuth } from '../hook/useAuth';
import { useNavigate, Link } from 'react-router';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { handleRegister, loading, error } = useAuth();
    const navigate = useNavigate();

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            await handleRegister(name, email, password);
            navigate('/');
        } catch (err) {
            console.error("Registration failed:", err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#111113] text-zinc-100 px-4 py-8">
            <div className="max-w-md w-full bg-[#18181b] rounded-2xl shadow-2xl shadow-black/50 border border-white/[0.05] p-8 relative overflow-hidden">
                <div className="absolute top-0 right-1/2 translate-x-1/2 w-4/5 h-28 bg-emerald-500/15 blur-3xl opacity-60 rounded-full pointer-events-none"></div>
                
                <div className="text-center mb-8 relative z-10 flex flex-col items-center">
                    <div className="w-16 h-16 bg-emerald-600/10 rounded-2xl mb-5 text-emerald-500 flex items-center justify-center ring-1 ring-emerald-500/20 shadow-inner">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Create Account</h2>
                    <p className="text-zinc-400 text-sm">Join Smart-search and get started</p>
                </div>
                
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex flex-col items-start leading-relaxed animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                            </svg>
                            <span className="font-semibold">Registration Failed</span>
                        </div>
                        <p className="ml-8 text-red-500/80 mt-1">{error.message || (typeof error === 'string' ? error : "An error occurred during registration. Please check your details and try again.")}</p>
                    </div>
                )}

                <form onSubmit={onSubmit} className="space-y-4 relative z-10">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-zinc-300 ml-1">Full Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-[#09090b] border border-white/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 hover:border-white/[0.15] transition-all text-white placeholder:text-zinc-600 block shadow-sm"
                            placeholder="John Doe"
                        />
                    </div>
                    
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-zinc-300 ml-1">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-[#09090b] border border-white/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 hover:border-white/[0.15] transition-all text-white placeholder:text-zinc-600 block shadow-sm"
                            placeholder="you@example.com"
                        />
                    </div>
                    
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-zinc-300 ml-1">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-[#09090b] border border-white/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 hover:border-white/[0.15] transition-all text-white placeholder:text-zinc-600 block shadow-sm"
                            placeholder="••••••••"
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/25 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6 group"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating Account...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center tracking-wide">
                                Create Account
                                <svg className="w-5 h-5 ml-2 opacity-70 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                                </svg>
                            </span>
                        )}
                    </button>
                    
                    <div className="text-center mt-8 pb-2 border-t border-white/[0.05] pt-6 relative">
                        <p className="text-sm text-zinc-400">
                            Already have an account?{' '}
                            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 hover:underline hover:underline-offset-4 focus:outline-none tracking-wide font-medium transition-all">
                                Sign in instead
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;
