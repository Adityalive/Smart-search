import React, { useState, useEffect } from 'react';
import { useItems } from '../features/items/hook/useItems';
import { Sparkles, Calendar, Loader2, Folder, ExternalLink, FileText } from 'lucide-react';

const Resurface = () => {
    const [days, setDays] = useState(30);
    const { resurfacedClusters: clusters, loading, fetchResurfacedItems } = useItems();

    useEffect(() => {
        fetchResurfacedItems(days);
    }, [days]);

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen bg-[#111113]">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-bold text-white flex items-center gap-3 leading-tight">
                        <Sparkles className="text-amber-400" size={36} />
                        Memory Resurface
                    </h1>
                    <p className="text-zinc-500 mt-2 text-lg font-medium">
                        Semantic clusters from your past <span className="text-amber-400/80">{days} days</span>.
                    </p>
                </div>

                <div className="flex bg-zinc-900/50 p-1 rounded-2xl border border-zinc-800 backdrop-blur-sm">
                    {[30, 60, 90].map((d) => (
                        <button
                            key={d}
                            onClick={() => setDays(d)}
                            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                                days === d 
                                ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-lg shadow-amber-500/20' 
                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]'
                            }`}
                        >
                            {d} Days
                        </button>
                    ))}
                </div>
             </div>

             {loading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-6">
                    <div className="relative">
                        <Loader2 className="animate-spin text-amber-500" size={48} />
                        <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full" />
                    </div>
                    <div className="text-center">
                        <p className="text-zinc-200 text-xl font-bold">Scanning Your Mind...</p>
                        <p className="text-zinc-500 mt-1">Applying K-Means to historical artifacts</p>
                    </div>
                </div>
             ) : clusters.length === 0 ? (
                <div className="text-center py-32 bg-[#18181b] rounded-[2.5rem] border border-dashed border-zinc-800">
                    <Calendar className="mx-auto mb-6 text-zinc-800" size={80} />
                    <p className="text-zinc-300 text-2xl font-bold">Quiet period detected.</p>
                    <p className="text-zinc-600 mt-2 text-lg">You didn't save many memories in this window.</p>
                </div>
             ) : (
                <div className="space-y-16">
                    {clusters.map((cluster) => (
                        <section key={cluster.id} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20 text-amber-400">
                                    <Folder size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-zinc-100 capitalize">
                                        {cluster.name}
                                    </h2>
                                    <p className="text-zinc-500 text-sm font-medium">
                                        {cluster.items.length} related memories found
                                    </p>
                                </div>
                                <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent ml-4" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {cluster.items.map(item => (
                                    <div 
                                        key={item._id} 
                                        className="group relative bg-[#18181b] border border-zinc-800/50 p-6 rounded-[2rem] hover:border-amber-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-900/5 flex flex-col h-full"
                                    >
                                        <div className="flex items-center justify-between mb-5">
                                            <div className="p-2 bg-zinc-900 rounded-xl group-hover:bg-amber-500/10 transition-colors">
                                                {item.type === 'pdf' ? <FileText size={18} className="text-purple-400" /> : <ExternalLink size={18} className="text-blue-400" />}
                                            </div>
                                            <span className="text-[10px] uppercase tracking-[0.1em] font-black text-zinc-600 group-hover:text-amber-500/60 transition-colors">
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        
                                        <h3 className="text-zinc-100 font-bold text-lg line-clamp-2 mb-3 leading-snug group-hover:text-amber-100 transition-colors">
                                            {item.title || "Untitled Fragment"}
                                        </h3>
                                        
                                        <p className="text-zinc-500 text-sm line-clamp-3 mb-6 leading-relaxed flex-1">
                                            {item.description || "A semantic thread from your past exploration."}
                                        </p>

                                        <div className="flex flex-wrap gap-2 mt-auto pt-5 border-t border-zinc-800/30">
                                            {item.tags?.slice(0, 2).map(tag => (
                                                <span key={tag} className="text-[10px] px-3 py-1 rounded-full bg-[#09090b] border border-zinc-800 text-zinc-500 font-bold group-hover:border-amber-900 group-hover:text-amber-600/60 transition-all">
                                                    #{tag.toUpperCase()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
             )}
        </div>
    );
};

export default Resurface;
