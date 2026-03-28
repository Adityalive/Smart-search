import React, { useState } from 'react';
import { useItems } from '../features/items/hook/useItems';
import { Link as LinkIcon, Upload, Tag } from 'lucide-react';

const Home = () => {
  const { loading, error, addItem } = useItems();

  const [activeTab, setActiveTab] = useState('url'); // 'url' or 'file'
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState(null);

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
    <div className="p-8 max-w-4xl mx-auto w-full">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent mb-3">
           Content Dashboard
        </h2>
        <p className="text-zinc-500">
          Save your links, PDFs, and articles here. Our AI will automatically tag, semantically embed, and cluster them in the background.
        </p>
      </div>

      {/* Save Item Form */}
      <div className="bg-[#18181b] border border-white/[0.05] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative flair */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex gap-3 mb-8">
            <button
              onClick={() => setActiveTab('url')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'url' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-[#09090b] text-zinc-400 border border-white/[0.08] hover:border-white/[0.2]'
              }`}
            >
              <LinkIcon size={18} /> Save Link
            </button>
            <button
              onClick={() => setActiveTab('file')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'file' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'bg-[#09090b] text-zinc-400 border border-white/[0.08] hover:border-white/[0.2]'
              }`}
            >
              <Upload size={18} /> Upload Document
            </button>
          </div>

          {typeof error === 'string' && error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {activeTab === 'url' ? (
              <input
                type="url"
                required
                placeholder="Paste the URL here e.g., https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-5 py-4 bg-[#09090b] border border-white/[0.08] rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
                disabled={loading}
              />
            ) : (
              <div className="w-full px-5 py-8 bg-[#09090b] border border-white/[0.08] border-dashed rounded-xl relative hover:border-purple-500 transition-colors cursor-pointer group shadow-inner flex flex-col items-center justify-center">
                <input
                  id="file-upload"
                  type="file"
                  required
                  accept=".pdf,image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  disabled={loading}
                />
                <div className="w-12 h-12 bg-white/[0.03] group-hover:bg-purple-500/10 rounded-full flex items-center justify-center mb-3 transition-colors text-zinc-400 group-hover:text-purple-400">
                    <Upload size={24} />
                </div>
                <span className="text-zinc-400 font-medium">{file ? file.name : 'Click or drag to upload PDF or Image'}</span>
                <span className="text-zinc-600 text-sm mt-1">Upload files to extract text and categorize</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-5">
              <input
                type="text"
                placeholder="Custom title (optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-5 py-3 bg-[#09090b] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                disabled={loading}
              />
              <div className="relative">
                <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                <input
                  type="text"
                  placeholder="Manual tags (comma separated)"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full pl-11 pr-5 py-3 bg-[#09090b] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
            >
              {loading ? 'Processing & Saving Content...' : `Save ${activeTab === 'url' ? 'URL' : 'Document'}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Home;
