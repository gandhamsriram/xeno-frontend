import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Layers, 
  Send, 
  Sparkles, 
  LogOut,
  User as UserIcon,
  Bot,
  Cpu
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', name: 'Customers', icon: Users },
    { id: 'segments', name: 'Segments', icon: Layers },
    { id: 'campaigns', name: 'Campaigns', icon: Send },
    { id: 'ai-assistant', name: 'AI Assistant', icon: Sparkles },
    { id: 'campaign-agent', name: 'AI Agent', icon: Bot },
    { id: 'architecture', name: 'Architecture', icon: Cpu },
  ];

  return (
    <aside className="w-64 bg-crmCard border-r border-gray-800 flex flex-col justify-between h-screen fixed left-0 top-0 text-gray-300">
      <div className="flex flex-col">
        {/* Logo Banner */}
        <div className="h-20 flex items-center px-6 border-b border-gray-800 gap-3">
          <div className="w-10 h-10 rounded-xl bg-crmAccent flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Sparkles className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-wider">XenoCRM</h1>
            <p className="text-xs text-purple-400 font-medium">D2C Engagement</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="mt-8 px-4 space-y-2 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-crmAccent text-white shadow-lg shadow-purple-500/20'
                    : 'hover:bg-gray-800 hover:text-white text-gray-400'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Logout */}
      {user && (
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-3 py-2 bg-gray-900/50 rounded-xl mb-3 border border-gray-850">
            <div className="w-9 h-9 rounded-full bg-purple-650 flex items-center justify-center text-white font-bold text-sm uppercase">
              {user.name.substring(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
          >
            <LogOut className="w-5 h-5 text-red-400" />
            Sign Out
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
