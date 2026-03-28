import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useClusters } from '../features/clusters/hook/useClusters';
import { useGraph } from '../features/graph/hook/useGraph';
import { Folder, Link as LinkIcon, FileText, X, FolderOpen, ArrowLeft, Network } from 'lucide-react';

const Cluster = () => {
  const { clusters, loading, error } = useClusters();
  
  // URL-based routing for active folder
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const folderIdParam = searchParams.get("folder");
  
  // State for a specific item's details modal
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Related items fetching
  const { getRelated } = useGraph();
  const [relatedItems, setRelatedItems] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  useEffect(() => {
     let isMounted = true;
     if (selectedItem) {
         setLoadingRelated(true);
         getRelated(selectedItem._id).then(data => {
             if (isMounted) {
                 setRelatedItems(data.items || []);
                 setLoadingRelated(false);
             }
         });
     } else {
         setRelatedItems([]);
     }
     return () => { isMounted = false };
  }, [selectedItem]);

  if (loading && clusters.length === 0) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center h-full">
        <div className="animate-pulse flex flex-col items-center">
          <FolderOpen size={48} className="text-zinc-600 mb-4" />
          <p className="text-zinc-400 font-medium">Analyzing embeddings & clustering knowledge...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-red-400">
          <h3 className="font-bold mb-2">Clustering Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Derived active folder based on URL parameter
  const activeFolder = folderIdParam ? clusters.find(c => c.id === folderIdParam) : null;

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      {/* ----------------- ACTIVE FOLDER VIEW (PAGE LEVEL) ----------------- */}
      {activeFolder ? (
        <div className="animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="mb-10 border-b border-zinc-800 pb-6">
            <button 
              onClick={() => navigate('/clusters')}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6 font-medium text-sm w-fit px-3 py-1.5 rounded-lg hover:bg-white/[0.05]"
            >
              <ArrowLeft size={16} /> Back to all clusters
            </button>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="bg-blue-500/20 p-4 rounded-2xl text-blue-400">
                     <FolderOpen size={32} />
                 </div>
                 <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent leading-tight capitalize mb-1">
                      {activeFolder.name}
                    </h2>
                    <p className="text-zinc-500">{activeFolder.itemCount} items mathematically linked via vector embeddings</p>
                 </div>
              </div>
            </div>
          </div>

          {/* Content list Grid */}
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {activeFolder.items.map((item) => (
              <div 
                key={item._id} 
                onClick={() => setSelectedItem({ ...item, folderName: activeFolder.name })}
                className="bg-[#18181b] p-5 rounded-2xl border border-white/[0.05] hover:border-white/[0.1] transition-all hover:shadow-lg hover:-translate-y-1 group cursor-pointer flex flex-col h-full"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`p-2 rounded-lg shrink-0 ${item.type === 'pdf' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                    {item.type === 'pdf' ? <FileText size={18} /> : <LinkIcon size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-zinc-200 font-medium truncate group-hover:text-blue-400 transition-colors" title={item.title}>
                      {item.title || "Untitled Document"}
                    </h3>
                    {item.url ? (
                      <span className="text-xs text-blue-400/80 truncate block mt-0.5">
                        {item.url}
                      </span>
                    ) : (
                      <span className="text-xs text-purple-400/80 truncate block mt-0.5">Stored PDF</span>
                    )}
                  </div>
                </div>
                {item.description && (
                  <p className="text-xs text-zinc-500 mt-2 line-clamp-3 leading-relaxed group-hover:text-zinc-400 transition-colors">
                    {item.description}
                  </p>
                )}
                <div className="mt-auto pt-4 flex gap-2 overflow-hidden">
                   {item.tags?.slice(0,2).map((tag, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-1 bg-white/[0.03] text-zinc-400 rounded-md border border-white/[0.02] truncate flex-shrink-0">
                         {tag}
                      </span>
                   ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ----------------- ALL CLUSTERS GRID VIEW ----------------- */
        <div className="animate-in fade-in duration-200">
          <div className="mb-10 border-b border-zinc-800 pb-6 flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent mb-2">
                Semantic Clusters
              </h2>
              <p className="text-zinc-500">
                Automatically organized folders based on the meaning of your content using AI embeddings.
              </p>
            </div>
            <div className="text-sm font-medium text-zinc-500 bg-[#18181b] px-4 py-2 rounded-full border border-white/[0.05]">
                {clusters.length} {clusters.length === 1 ? 'Cluster' : 'Clusters'} detected
            </div>
          </div>

          {clusters.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-white/[0.05] rounded-2xl bg-[#18181b]/50">
              <Folder size={48} className="mx-auto text-zinc-700 mb-4" />
              <p className="text-zinc-400 font-medium">No clusters formed yet.</p>
              <p className="text-zinc-600 text-sm mt-2">Save more content in the Dashboard to group similar ideas.</p>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {clusters.map((cluster) => (
                <div 
                  key={cluster.id}
                  onClick={() => navigate(`/clusters?folder=${cluster.id}`)}
                  className="bg-[#18181b] bg-gradient-to-b hover:from-[#1f1f22] hover:to-[#18181b] border border-white/[0.05] hover:border-white/[0.1] rounded-2xl p-6 cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 group flex flex-col relative"
                >
                  <div className="text-blue-500 mb-4 bg-blue-500/10 w-fit p-3 rounded-xl border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-colors z-10">
                    <Folder size={28} className="fill-current opacity-20 group-hover:opacity-100" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-zinc-200 truncate capitalize z-10 mb-1" title={cluster.name}>
                    {cluster.name}
                  </h3>
                  
                  <div className="mt-auto flex items-center justify-between text-xs font-medium text-zinc-500 pt-4 border-t border-white/[0.05] z-10">
                    <span className="bg-[#09090b] px-2.5 py-1 rounded-md border border-white/[0.05]">
                        {cluster.itemCount} items
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ----------------- Document Details Modal ----------------- */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#18181b] border border-blue-500/20 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden shadow-blue-900/10 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 border-b border-white/[0.05]">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-zinc-800 text-zinc-400 text-xs font-medium rounded flex items-center gap-1">
                      <Folder size={12} /> {selectedItem.folderName || 'Cluster'}
                  </span>
                  {selectedItem.type === 'pdf' ? (
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded">PDF</span>
                  ) : (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">LINK</span>
                  )}
                  {selectedItem.sourceType && (
                    <span className="px-2 py-1 bg-white/[0.05] text-zinc-400 text-xs font-medium rounded border border-white/[0.05]">
                        {selectedItem.sourceType}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white leading-tight">
                  {selectedItem.title || "Untitled Document"}
                </h2>
                {selectedItem.url && (
                  <a href={selectedItem.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline mt-1 block truncate">
                    {selectedItem.url}
                  </a>
                )}
              </div>
              <button 
                onClick={() => setSelectedItem(null)}
                className="p-2 text-zinc-400 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] rounded-full transition-colors shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-700">
               {selectedItem.description && (
                <div className="mb-6 bg-[#111113] p-5 rounded-xl border border-white/[0.02]">
                  <h3 className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-2">Meta Description</h3>
                  <p className="text-zinc-300 text-sm leading-relaxed">
                    {selectedItem.description}
                  </p>
                </div>
              )}

              {selectedItem.tags && selectedItem.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-2">AI Generated Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-white/[0.03] hover:bg-white/[0.08] transition text-zinc-300 text-xs rounded-full border border-white/[0.05]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 flex items-center justify-center p-8 border-2 border-dashed border-white/[0.05] rounded-xl bg-white/[0.01]">
                 <p className="text-zinc-500 text-sm italic">
                    Vector embedding extracted from document and stored in Qdrant successfully.
                 </p>
              </div>

              {/* Related Items Ribbon */}
              <div className="mt-10 mb-4 border-t border-white/[0.05] pt-8">
                 <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                    <Network size={18} className="text-purple-400" />
                    Conceptually Related Items
                 </h3>
                 
                 {loadingRelated ? (
                     <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-zinc-700">
                         {[1,2,3].map(i => (
                             <div key={i} className="min-w-[280px] bg-[#202024]/50 h-28 rounded-xl animate-pulse border border-white/[0.02]" />
                         ))}
                     </div>
                 ) : relatedItems.length > 0 ? (
                     <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-zinc-700">
                         {relatedItems.map((relItem) => (
                             <div 
                               key={relItem._id}
                               onClick={() => setSelectedItem({ ...relItem, folderName: "Related" })}
                               className="min-w-[280px] max-w-[280px] bg-[#202024] p-4 rounded-xl border border-white/[0.05] hover:border-purple-500/30 transition-colors cursor-pointer group"
                             >
                                 <h4 className="text-zinc-200 text-sm font-bold truncate group-hover:text-purple-400 transition-colors">
                                     {relItem.title || "Untitled Document"}
                                 </h4>
                                 <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                                     {relItem.description || "Semantic match."}
                                 </p>
                             </div>
                         ))}
                     </div>
                 ) : (
                     <p className="text-sm text-zinc-500 bg-[#111113] p-4 rounded-xl text-center italic border border-white/[0.02]">
                         No significantly related concepts found in your knowledge base yet.
                     </p>
                 )}
              </div>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
};

export default Cluster;
