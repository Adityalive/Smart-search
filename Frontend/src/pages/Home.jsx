import React, { useState } from 'react';
import { useAuth } from '../features/auth/hook/useAuth';
import { useItems } from '../features/items/hook/useItems';
import { FileText, Link as LinkIcon, Upload, Tag, X } from 'lucide-react';

const Home = () => {
  const { user, handleLogout } = useAuth();
  const { items, loading, error, addItem } = useItems();

  const [activeTab, setActiveTab] = useState('url'); // 'url' or 'file'
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState(null);
  
  // State for the expanded content modal
  const [selectedItem, setSelectedItem] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (activeTab === 'url' && !url) return;
    if (activeTab === 'file' && !file) return;

    const formData = new FormData();
    if (title) formData.append('title', title);
    if (tags) formData.append('tags', tags);
    
    if (activeTab === 'url') {
      formData.append('url', url);
    } else if (activeTab === 'file') {
      formData.append('file', file);
    }

    const res = await addItem(formData);
    
    if (res.success) {
      setUrl('');
      setTitle('');
      setTags('');
      setFile(null);
      const fileInput = document.getElementById('file-upload');
      if (fileInput) fileInput.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-[#111113] text-zinc-100 p-8 relative">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
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

        {/* Save Item Form */}
        <div className="bg-[#18181b] border border-white/[0.05] rounded-2xl p-6 shadow-xl mb-8">
          <h2 className="text-lg font-semibold mb-4 text-zinc-200">Save new content</h2>
          
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('url')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'url' ? 'bg-blue-600/20 text-blue-400' : 'bg-white/[0.03] text-zinc-400 hover:bg-white/[0.08]'
              }`}
            >
              <LinkIcon size={16} /> Save Link
            </button>
            <button
              onClick={() => setActiveTab('file')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'file' ? 'bg-purple-600/20 text-purple-400' : 'bg-white/[0.03] text-zinc-400 hover:bg-white/[0.08]'
              }`}
            >
              <Upload size={16} /> Upload Document
            </button>
          </div>

          {typeof error === 'string' && error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'url' ? (
              <input
                type="url"
                required
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-3 bg-[#09090b] border border-white/[0.08] rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                disabled={loading}
              />
            ) : (
              <div className="w-full px-4 py-3 bg-[#09090b] border border-white/[0.08] border-dashed rounded-xl relative hover:border-purple-500 transition-colors cursor-pointer">
                <input
                  id="file-upload"
                  type="file"
                  required
                  accept=".pdf,image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={loading}
                />
                <div className="flex items-center justify-center gap-3 text-zinc-400">
                  <Upload size={20} />
                  <span>{file ? file.name : 'Click to upload PDF or Image'}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Custom title (optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 bg-[#09090b] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                disabled={loading}
              />
              <div className="relative">
                <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                <input
                  type="text"
                  placeholder="Tags (comma separated)"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#09090b] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition"
            >
              {loading ? 'Processing & Saving...' : 'Save Content'}
            </button>
          </form>
        </div>

        {/* Dashboard Items List */}
        <div className="bg-[#18181b] border border-white/[0.05] rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-semibold mb-6 text-zinc-200">Your Knowledge Base</h2>
          {loading && items.length === 0 && <p className="text-zinc-400">Loading...</p>}
          {!loading && items.length === 0 && (
            <div className="text-center py-10 border-2 border-dashed border-white/[0.05] rounded-xl">
              <p className="text-zinc-500">No content saved yet. Start by adding a link or uploading a document.</p>
            </div>
          )}
          
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            {items.map((item) => (
              <div 
                key={item._id} 
                onClick={() => setSelectedItem(item)}
                className="bg-[#202024] p-5 rounded-xl border border-white/[0.02] hover:border-white/[0.08] transition-colors group cursor-pointer"
              >
                <div className="flex items-start gap-3 mb-2">
                  <div className={`p-2 rounded-lg shrink-0 ${item.type === 'pdf' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                    {item.type === 'pdf' ? <FileText size={20} /> : <LinkIcon size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-zinc-100 font-medium truncate" title={item.title}>
                      {item.title || "Untitled Document"}
                    </h3>
                    {item.url ? (
                      <span className="text-xs text-blue-400 truncate block">
                        {item.url}
                      </span>
                    ) : (
                      <span className="text-xs text-purple-400 truncate block">Stored PDF</span>
                    )}
                    {item.status === 'pending' && (
                      <span className="text-xs font-semibold px-2 py-0.5 mt-1.5 inline-block bg-yellow-500/10 text-yellow-500 rounded border border-yellow-500/20 shadow-sm shadow-yellow-500/10">
                        <span className="animate-pulse">Processing AI...</span>
                      </span>
                    )}
                  </div>
                </div>
                
                {item.description && (
                  <p className="text-sm text-zinc-400 mt-3 line-clamp-2">
                    {item.description}
                  </p>
                )}

                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {item.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-zinc-800 text-zinc-300 text-xs rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Extracted Content Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#18181b] border border-white/[0.1] rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 border-b border-white/[0.05]">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-2">
                  {selectedItem.type === 'pdf' ? (
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded">PDF</span>
                  ) : (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">LINK</span>
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
                className="p-2 text-zinc-400 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body - Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
              
              <div className="mb-8">
                <h3 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-2">Extracted Content</h3>
                {selectedItem.content ? (
                  <div className="text-zinc-300 whitespace-pre-wrap leading-relaxed text-sm bg-[#111113] p-4 rounded-xl border border-white/[0.02]">
                    {selectedItem.content}
                  </div>
                ) : (
                  <div className="text-zinc-500 italic p-4 bg-[#111113] rounded-xl border border-white/[0.02]">
                    No readable content could be extracted from this source.
                  </div>
                )}
              </div>
              
              {selectedItem.description && (
                <div className="mb-6">
                  <h3 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-2">Meta Description</h3>
                  <p className="text-zinc-400 text-sm">
                    {selectedItem.description}
                  </p>
                </div>
              )}

              {selectedItem.tags && selectedItem.tags.length > 0 && (
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
};

export default Home;


