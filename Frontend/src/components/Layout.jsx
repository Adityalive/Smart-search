import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/hook/useAuth';
import { useItems } from '../features/items/hook/useItems';
import { Home, FolderTree, LogOut, Network, Search, Sparkles, Clock, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Layout = () => {
  const { user, handleLogout } = useAuth();
  const { items: savedItems } = useItems();
  const navigate = useNavigate();

  // Robust date extraction from MongoDB ObjectID
  const getTimestampFromId = (id) => {
    if (!id || typeof id !== 'string') return new Date();
    return new Date(parseInt(id.substring(0, 8), 16) * 1000);
  };

  const handleItemClick = (id) => {
    // Navigate to clusters or a specific item view if implemented
    navigate(`/clusters`);
  };

  return (
    <div className="flex h-screen bg-[#111113] text-zinc-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 bg-[#18181b] flex flex-col pt-8">
        <div className="px-6 mb-10">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Smart-search
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <a
            href="/install.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 mb-4 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)] group"
          >
            <HelpCircle size={20} className="group-hover:scale-110 transition-transform" />
            <span className="font-bold tracking-tight">How to use</span>
          </a>

          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive
                  ? 'bg-blue-600/10 text-blue-400'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
              }`
            }
          >
            <Home size={20} />
            <span className="font-medium">Dashboard</span>
          </NavLink>

          <NavLink
            to="/clusters"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive
                  ? 'bg-blue-600/10 text-blue-400'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
              }`
            }
          >
            <FolderTree size={20} />
            <span className="font-medium">Clusters</span>
          </NavLink>

          <NavLink
            to="/graph"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive
                  ? 'bg-purple-600/10 text-purple-400'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
              }`
            }
          >
            <Network size={20} />
            <span className="font-medium">Knowledge Graph</span>
          </NavLink>

          <NavLink
            to="/search"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive
                  ? 'bg-indigo-600/10 text-indigo-400'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
              }`
            }
          >
            <Search size={20} />
            <span className="font-medium">Semantic Search</span>
          </NavLink>

          <NavLink
            to="/resurface"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive
                  ? 'bg-amber-600/10 text-amber-400'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
              }`
            }
          >
            <Sparkles size={20} />
            <span className="font-medium">Memory Resurface</span>
          </NavLink>

          <NavLink
            to="/history"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive
                  ? 'bg-emerald-600/10 text-emerald-400'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
              }`
            }
          >
            <Clock size={20} />
            <span className="font-medium">History</span>
          </NavLink>
        </nav>

        {/* History Section */}
        <div className="flex-1 mt-6 px-4 overflow-hidden flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
          <div className="border-t border-emerald-500/10 pt-6 flex flex-col h-full">
            {/* Clickable Header → navigates to /history */}
            <NavLink
              to="/history"
              className={({ isActive }) =>
                `flex gap-3 mb-5 rounded-xl p-2 transition-all ${
                  isActive ? 'bg-emerald-500/5' : 'hover:bg-emerald-500/[0.03]'
                }`
              }
            >
              {/* History large text — left */}
              <h2 className="text-2xl font-black text-emerald-500 leading-none tracking-tighter opacity-80 shrink-0">
                History
              </h2>

              {/* Vertical separator */}
              <div className="w-[1px] bg-emerald-500/20 self-stretch" />

              {/* Preview — right: last 3 items or no-data */}
              <div className="flex-1 pl-3 flex flex-col justify-center gap-1.5 overflow-hidden">
                {!savedItems || savedItems.length === 0 ? (
                  <span className="text-[10px] text-zinc-600 uppercase tracking-widest">No Data</span>
                ) : (
                  savedItems.slice(0, 3).map(item => (
                    <p
                      key={item._id}
                      className="text-[10px] text-zinc-500 truncate hover:text-emerald-400 transition-colors"
                    >
                      {item.title || "Untitled"}
                    </p>
                  ))
                )}
              </div>
            </NavLink>

            {/* Recent individual clickable items */}
            {savedItems && savedItems.length > 0 && (
              <div className="flex-1 overflow-y-auto space-y-1 scrollbar-hide">
                {savedItems.slice(0, 8).map(item => (
                  <button
                    key={item._id}
                    onClick={() => handleItemClick(item._id)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-[11px] text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/[0.04] transition-all group"
                    title={item.title}
                  >
                    <Clock size={10} className="shrink-0 text-zinc-700 group-hover:text-emerald-500 transition-colors" />
                    <span className="truncate flex-1">{item.title || "Untitled Item"}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* User Footer Snippet inside Sidebar */}
        <div className="p-6 border-t border-zinc-800">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold shrink-0">
               {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-sm font-medium text-zinc-200 truncate">{user?.name || "User"}</p>
               <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
             </div>
             <button
               onClick={handleLogout}
               title="Logout"
               className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
             >
               <LogOut size={16} />
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
