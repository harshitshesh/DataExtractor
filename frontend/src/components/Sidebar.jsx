import React from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  Search, 
  History, 
  Settings, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
    { id: 'insights', label: 'Deep Insights', icon: <Sparkles size={18} /> },
    { id: 'history', label: 'History', icon: <History size={18} /> },
  ];

  return (
    <aside className="w-64 h-screen border-r border-border-subtle bg-bg-sidebar flex flex-col p-6 sticky top-0">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
          <Sparkles size={18} fill="currentColor" />
        </div>
        <h1 className="heading-display text-xl tracking-tight">Extract<span className="text-primary">.ai</span></h1>
      </div>

      <nav className="flex-1 space-y-1">
        <div className="text-xs-caps mb-4 px-2">Main Menu</div>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`nav-link w-full text-left cursor-pointer ${activeTab === item.id ? 'active' : ''}`}
          >
            {item.icon}
            <span className="flex-1">{item.label}</span>
            {activeTab === item.id && <ChevronRight size={14} className="opacity-50" />}
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-border-subtle">
        <button className="nav-link w-full text-left cursor-pointer mb-2">
          <Settings size={18} />
          <span>Settings</span>
        </button>
        <div className="px-4 py-3 rounded-xl bg-primary-light flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white border border-border-subtle flex items-center justify-center text-[10px] font-bold text-primary">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate">Admin User</p>
            <p className="text-[10px] text-text-muted truncate">Pro Account</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
