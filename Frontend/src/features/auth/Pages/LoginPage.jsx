import React, { useState } from 'react';
import { useAuth } from '../hook/useAuth';
import { useNavigate, Link } from 'react-router';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { handleLogin, loading, error } = useAuth();
    const navigate = useNavigate();

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            await handleLogin(email, password);
            navigate('/');
        } catch (err) {
            console.error("Login failed:", err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#111113] text-zinc-100 px-4">
            <div className="max-w-md w-full bg-[#18181b] rounded-2xl shadow-2xl shadow-black/50 border border-white/[0.05] p-8 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-blue-500/20 blur-3xl opacity-50 rounded-full pointer-events-none"></div>
                
                <div className="text-center mb-8 relative z-10 flex flex-col items-center">
                    <div className="w-16 h-16 bg-blue-600/10 rounded-2xl mb-5 text-blue-500 flex items-center justify-center ring-1 ring-blue-500/20 shadow-inner">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome Back</h2>
                    <p className="text-zinc-400 text-sm">Sign in to your account to continue</p>
                </div>
                
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex flex-col items-start leading-relaxed animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span className="font-semibold">Authentication Failed</span>
                        </div>
                        <p className="ml-8 text-red-500/80 mt-1">{error.message || (typeof error === 'string' ? error : "Invalid email or password. Please try again.")}</p>
                    </div>
                )}

                <form onSubmit={onSubmit} className="space-y-5 relative z-10">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-zinc-300 ml-1">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-[#09090b] border border-white/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 hover:border-white/[0.15] transition-all text-white placeholder:text-zinc-600 block shadow-sm"
                            placeholder="you@example.com"
                        />
                    </div>
                    
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center px-1">
                            <label className="block text-sm font-medium text-zinc-300">Password</label>
                            <a href="#" className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium">Forgot?</a>
                        </div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-[#09090b] border border-white/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 hover:border-white/[0.15] transition-all text-white placeholder:text-zinc-600 block shadow-sm"
                            placeholder="••••••••"
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 group"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Signing in...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center">
                                Sign In
                                <svg className="w-5 h-5 ml-2 opacity-70 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                                </svg>
                            </span>
                        )}
                    </button>
                    
                    <div className="text-center mt-8 pb-2 border-t border-white/[0.05] pt-6 relative">
                        <p className="text-sm text-zinc-400">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-blue-400 hover:text-blue-300 hover:underline hover:underline-offset-4 focus:outline-none tracking-wide font-medium transition-all">
                                Create one here
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
