import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGraph } from '../features/graph/hook/useGraph';
import { useHistory } from '../features/history/hook/useHistory';
import { Search as SearchIcon, FileText, Link as LinkIcon, Sparkles } from 'lucide-react';
import { Tweet } from 'react-tweet';
import FallbackBanner from '../components/FallbackBanner';

const Search = () => {
    const { searchItems } = useGraph();
    const { addHistoryItem } = useHistory();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    const [query, setQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [error, setError] = useState(null);

    const performSearch = async (searchTerm) => {
        if(!searchTerm.trim()) return;

        setIsSearching(true);
        setError(null);
        setHasSearched(true);
        
        try {
            const data = await searchItems(searchTerm);
            setResults(data.items || []);
            // Save to history on success
            await addHistoryItem(searchTerm);
        } catch (err) {
            setError("Semantic search failed to execute. Try again later.");
        } finally {
            setIsSearching(false);
        }
    };

    // Auto-trigger search if 'q' parameter is present in URL
    useEffect(() => {
        const q = searchParams.get('q');
        if (q) {
            setQuery(q);
            performSearch(q);
        }
    }, [searchParams]);

    const handleSearch = async (e) => {
        e.preventDefault();
        performSearch(query);
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
            <div className={`w-full mt-12 ${results.length > 0 ? 'grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'flex flex-col gap-4'}`}>
               {hasSearched && !isSearching && results.length === 0 && !error && (
                   <p className="text-zinc-500 text-center py-10">No semantic matches found for this concept. Expand your dashboard knowledge base!</p>
               )}

               {results.map((item, index) => {
                  const isYouTube = item.url?.includes('youtube.com') || item.url?.includes('youtu.be');
                  const isTwitter = item.url?.includes('twitter.com') || item.url?.includes('x.com');
                  
                  let videoId = item.videoId;
                  if (!videoId && isYouTube && item.url) {
                      if (item.url.includes('youtube.com/watch')) {
                          try { videoId = new URL(item.url).searchParams.get('v') || ''; } catch(e){}
                      } else if (item.url.includes('youtu.be/')) {
                          videoId = item.url.split('youtu.be/')[1]?.split('?')[0] || '';
                      }
                  } else if (!videoId && isTwitter && item.url) {
                      const match = item.url.match(/\/status\/(\d+)/);
                      if (match) videoId = match[1];
                  }

                  return (
                    <div 
                      key={index} 
                      onClick={(e) => {
                        if (e.target.tagName.toLowerCase() === 'iframe') return;
                        navigate(`/clusters`);
                      }}
                      className="bg-[#18181b] rounded-2xl border border-white/[0.05] hover:border-white/[0.1] transition-all hover:shadow-lg hover:-translate-y-1 group cursor-pointer flex flex-col h-full overflow-hidden"
                    >
                      {/* Media Banner Section */}
                      {isYouTube && videoId ? (
                        <div className="w-full aspect-video bg-black relative z-10">
                          <iframe 
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title={item.title}
                            className="w-full h-full border-0 pointer-events-auto"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : isTwitter && videoId ? (
                        <div className="w-full bg-[#111113] p-0 flex justify-center max-h-72 overflow-y-auto pointer-events-auto z-10 dark scrollbar-hide">
                          <Tweet id={videoId} />
                        </div>
                      ) : item.image ? (
                        <div className="w-full h-40 bg-zinc-900 border-b border-white/[0.05] relative overflow-hidden shrink-0">
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.target.style.display = 'none'; }} />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#18181b] via-transparent to-transparent" />
                        </div>
                      ) : (
                        <FallbackBanner item={item} />
                      )}

                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`p-2 rounded-lg shrink-0 ${item.type === 'pdf' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'} flex flex-col items-center justify-center relative overflow-hidden`}>
                            {item.favicon ? (
                              <img src={item.favicon} alt="icon" className="w-4 h-4 object-contain rounded-sm" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                            ) : null}
                            <LinkIcon size={16} className={item.favicon ? "hidden" : "block"} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[10px] font-black tracking-wider uppercase text-zinc-500 truncate">
                                {item.siteName || (item.type === 'pdf' ? 'PDF Document' : 'Web Link')}
                              </span>
                            </div>
                            <h3 className="text-zinc-200 font-bold leading-tight line-clamp-2 group-hover:text-blue-400 transition-colors" title={item.title}>
                              {item.title || "Untitled Document"}
                            </h3>
                          </div>
                        </div>
                        {item.description && (
                          <p className="text-xs text-zinc-500 mt-2 line-clamp-3 leading-relaxed group-hover:text-zinc-400 transition-colors flex-1">
                            {item.description}
                          </p>
                        )}
                        <div className="mt-4 pt-4 flex items-center justify-between overflow-hidden border-t border-white/[0.05]">
                          <div className="flex gap-2">
                             {item.tags?.slice(0,2).map((tag, i) => (
                               <span key={i} className="text-[10px] px-2 py-1 bg-white/[0.03] text-zinc-400 rounded-md border border-white/[0.02] truncate flex-shrink-0">
                                   {tag}
                               </span>
                             ))}
                          </div>
                          <span className="text-emerald-500/80 bg-emerald-500/10 px-2 py-1 rounded-md text-[10px] font-mono whitespace-nowrap">
                              Match: {item.score?.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
               })}
            </div>
        </div>
    )
}

export default Search;
