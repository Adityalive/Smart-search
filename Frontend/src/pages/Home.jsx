import React from 'react';
import { useAuth } from '../features/auth/hook/useAuth';

const Home = () => {
    const { user, handleLogout } = useAuth();

    return (
        <div className="min-h-screen bg-[#111113] text-zinc-100 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                        Smart-search
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="text-zinc-400">Hello, {user?.name || user?.email || 'User'}</span>
                        <button 
                            onClick={handleLogout}
                            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-zinc-300 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                <div className="bg-[#18181b] border border-white/[0.05] rounded-2xl p-8 shadow-xl">
                    <h2 className="text-xl font-semibold mb-4">Welcome to your dashboard</h2>
                    <p className="text-zinc-400">
                        You have successfully logged in. Your Smart-search dashboard is ready.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Home;
