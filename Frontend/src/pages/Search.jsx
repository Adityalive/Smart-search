import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGraph } from '../features/graph/hook/useGraph';
import { Search as SearchIcon, FileText, Link as LinkIcon, Sparkles } from 'lucide-react';

const Search = () => {
    const { searchItems } = useGraph();
    const navigate = useNavigate();
    
    const [query, setQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        if(!query.trim()) return;

        setIsSearching(true);
        setError(null);
        setHasSearched(true);
        
        try {
            const data = await searchItems(query);
            setResults(data.items || []);
        } catch (err) {
            setError("Semantic search failed to execute. Try again later.");
        } finally {
            setIsSearching(false);
        }
    }

    return (
        <div className="p-8 max-w-4xl mx-auto w-full h-full flex flex-col items-center">
            <div className="text-center mt-12 mb-10">
                 <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 w-16 h-16 rounded-3xl mx-auto flex items-center justify-center mb-6 border border-white/[0.1]">
                     <Sparkles size={32} className="text-purple-400" />
                 </div>
                 <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 mb-4 tracking-tight">
                     Semantic AI Search
                 </h1>
                 <p className="text-zinc-500 text-lg max-w-lg mx-auto">
                     Search not by exact keywords, but by concept, meaning, and intent. Discover related ideas across all your content instantly.
                 </p>
            </div>

            <form onSubmit={handleSearch} className="w-full relative group">
                <input 
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. 'How do neural networks process language mathematically?'"
                    className="w-full bg-[#18181b] border border-white/[0.1] rounded-2xl px-6 py-5 pl-14 text-white text-lg placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 shadow-2xl transition-all group-hover:border-white/[0.2]"
                    disabled={isSearching}
                />
                <SearchIcon size={24} className={`absolute left-5 top-1/2 -translate-y-1/2 ${isSearching ? 'text-purple-500 animate-pulse' : 'text-zinc-500 max-h-fit'}`} />
                <button 
                  type="submit" 
                  disabled={isSearching}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white text-black px-6 py-2.5 rounded-xl font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50"
                 >
                    {isSearching ? 'Thinking...' : 'Search'}
                </button>
            </form>

             {/* Search Error State */}
            {error && (
                <div className="mt-8 text-red-500 w-full p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                    {error}
                </div>
            )}

            {/* Results Rendering */}
            <div className="w-full mt-12 flex flex-col gap-4">
               {hasSearched && !isSearching && results.length === 0 && !error && (
                   <p className="text-zinc-500 text-center py-10">No semantic matches found for this concept. Expand your dashboard knowledge base!</p>
               )}

               {results.map((item, index) => (
                   <div key={index} className="bg-[#18181b] border border-white/[0.05] p-5 rounded-2xl flex items-start gap-4 hover:border-white/[0.1] transition-colors cursor-pointer" onClick={() => navigate(`/clusters`)}>
                       <div className={`p-3 rounded-xl shrink-0 ${item.type === 'pdf' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                           {item.type === 'pdf' ? <FileText size={20} /> : <LinkIcon size={20} />}
                       </div>
                       <div className="flex-1 min-w-0">
                           <h3 className="text-zinc-200 font-bold mb-1 truncate text-lg">
                               {item.title || "Untitled Document"}
                           </h3>
                           <p className="text-zinc-500 text-sm line-clamp-2 leading-relaxed mb-3">
                               {item.description || "The semantic vector for this document extremely closely matches your query's theoretical vector space."}
                           </p>
                           <div className="flex items-center justify-between text-xs">
                               <div className="flex gap-2">
                                   {item.tags?.slice(0,3).map((tag, i) => (
                                     <span key={i} className="px-2 py-1 bg-[#202024] rounded-md text-zinc-400 border border-white/[0.02]">
                                         {tag}
                                     </span>
                                   ))}
                               </div>
                               {/* Qdrant Score */}
                               <span className="text-emerald-500/80 bg-emerald-500/10 px-2 py-1 rounded-md font-mono">
                                   Match Vector: {item.score?.toFixed(2)}
                               </span>
                           </div>
                       </div>
                   </div>
               ))}
            </div>
        </div>
    )
}

export default Search;
