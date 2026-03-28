import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/hook/useAuth';
import { Home, FolderTree, LogOut, Network, Search } from 'lucide-react';

const Layout = () => {
  const { user, handleLogout } = useAuth();

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
        </nav>

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
