import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHistory } from '../features/history/hook/useHistory';
import { Search, Clock, Loader2 } from 'lucide-react';

const groupByDate = (items) => {
    if (!items || items.length === 0) return {};
    const groups = {};

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    items.forEach(item => {
        const itemDate = new Date(item.createdAt);
        const dayOnly = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());

        let label;
        if (dayOnly.getTime() === today.getTime()) {
            label = 'todday';
        } else if (dayOnly.getTime() === yesterday.getTime()) {
            label = 'yestrday';
        } else {
            label = `${itemDate.getDate()}/${itemDate.getMonth() + 1}/${itemDate.getFullYear().toString().slice(-2)}`;
        }

        if (!groups[label]) groups[label] = [];
        groups[label].push(item);
    });

    return groups;
};

const History = () => {
    const { historyItems, loading } = useHistory();
    const navigate = useNavigate();

    const groupedHistory = useMemo(() => groupByDate(historyItems), [historyItems]);

    const handleQueryClick = (query) => {
        navigate(`/search?q=${encodeURIComponent(query)}`);
    };

    const formatTime = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    return (
        <div
            className="min-h-full p-8 max-w-3xl mx-auto w-full"
            style={{ fontFamily: "'Inter', sans-serif" }}
        >
            {/* Header */}
            <div className="mb-12 border-b border-emerald-500/10 pb-8">
                <h1
                    className="text-6xl font-black text-emerald-500 leading-none tracking-tighter opacity-90 uppercase"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                >
                    History
                </h1>
                <p className="mt-5 text-zinc-500 text-sm uppercase tracking-widest">
                    Your search activity — newest first
                </p>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex items-center gap-3 text-emerald-500/60 py-10">
                    <Loader2 size={18} className="animate-spin" />
                    <span className="text-sm tracking-widest uppercase">Loading history...</span>
                </div>
            )}

            {/* Empty State */}
            {!loading && Object.keys(groupedHistory).length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <div className="w-16 h-16 rounded-full border border-emerald-500/20 flex items-center justify-center">
                        <Clock size={24} className="text-emerald-500/30" />
                    </div>
                    <p className="text-zinc-600 uppercase tracking-widest text-xs">No Data</p>
                </div>
            )}

            {/* Grouped History */}
            {!loading && Object.entries(groupedHistory).map(([label, items]) => (
                <div key={label} className="mb-12">
                    {/* Date Label */}
                    <div className="flex items-center gap-4 mb-6">
                        <span className="inline-flex px-4 py-1.5 rounded-full border border-emerald-500/30 text-emerald-500/70 text-xs font-bold tracking-wider uppercase">
                            {label}
                        </span>
                        <div className="flex-1 h-[1px] bg-emerald-500/10" />
                    </div>

                    {/* Items */}
                    <div className="flex flex-col gap-2">
                        {items.map((item) => (
                            <button
                                key={item._id}
                                onClick={() => handleQueryClick(item.query)}
                                className="group flex items-center gap-4 w-full text-left px-5 py-4 rounded-xl border border-transparent hover:border-emerald-500/20 hover:bg-emerald-500/[0.03] transition-all duration-200"
                            >
                                {/* Icon */}
                                <div className="w-8 h-8 rounded-lg border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:border-emerald-500/40 group-hover:bg-emerald-500/10 transition-all">
                                    <Search size={12} className="text-emerald-500/50 group-hover:text-emerald-400 transition-colors" />
                                </div>

                                {/* Query Text */}
                                <span className="flex-1 text-sm text-zinc-400 group-hover:text-emerald-400 transition-colors truncate font-medium">
                                    {item.query}
                                </span>

                                {/* Time */}
                                <span className="text-[10px] text-zinc-600 group-hover:text-emerald-500/50 transition-colors font-mono shrink-0">
                                    {formatTime(item.createdAt)}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default History;
