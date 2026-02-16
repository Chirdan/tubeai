
import React from 'react';
import { LayoutDashboard, Palette, Video, Image as ImageIcon, BarChart3, Youtube } from 'lucide-react';
import { ViewType } from '../types';

interface SidebarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const items = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'branding', icon: Palette, label: 'Channel Architect' },
    { id: 'studio', icon: Video, label: 'Content Studio' },
    { id: 'media', icon: ImageIcon, label: 'Media Assets' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
  ];

  return (
    <aside className="w-64 bg-[#0f0f0f] border-r border-zinc-800 flex flex-col h-full">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-red-600 p-2 rounded-lg shadow-lg shadow-red-600/20">
          <Youtube className="text-white w-6 h-6" />
        </div>
        <h1 className="font-bold text-xl tracking-tight">TubeAI</h1>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as ViewType)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
              currentView === item.id 
                ? 'bg-zinc-800 text-white font-medium shadow-sm' 
                : 'text-zinc-500 hover:bg-zinc-900 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-zinc-800">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-500" />
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-bold truncate">Creator Mode</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Active</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
