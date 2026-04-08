
import React from 'react';
import { LayoutDashboard, Palette, Video, Image as ImageIcon, BarChart3, Youtube, X, LogOut } from 'lucide-react';
import { ViewType } from '../types';
import SystemStatus from './SystemStatus';
import { User } from 'firebase/auth';

interface SidebarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isOpen, onClose, user, onLogout }) => {
  const items = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'branding', icon: Palette, label: 'Channel Architect' },
    { id: 'studio', icon: Video, label: 'Content Studio' },
    { id: 'media', icon: ImageIcon, label: 'Media Assets' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
  ];

  const handleItemClick = (id: ViewType) => {
    setView(id);
    onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#0f0f0f] border-r border-zinc-800 flex flex-col h-full transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2 rounded-lg shadow-lg shadow-red-600/20">
              <Youtube className="text-white w-6 h-6" />
            </div>
            <h1 className="font-bold text-xl tracking-tight">TubeAI</h1>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 text-zinc-500 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id as ViewType)}
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

        <div className="p-4 space-y-4 border-t border-zinc-800">
          <SystemStatus />
          
          {user && (
            <div className="flex items-center gap-3 px-2">
              <img src={user.photoURL || ''} className="w-8 h-8 rounded-full border border-zinc-800" referrerPolicy="no-referrer" />
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold truncate">{user.displayName}</p>
                <button 
                  onClick={onLogout}
                  className="text-[10px] text-zinc-500 uppercase tracking-widest font-black hover:text-red-500 transition-colors flex items-center gap-1"
                >
                  <LogOut className="w-2.5 h-2.5" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
