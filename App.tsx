
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import BrandingView from './components/BrandingView';
import StudioView from './components/StudioView';
import DashboardView from './components/DashboardView';
import AnalyticsView from './components/AnalyticsView';
import { Toaster } from 'sonner';
import { ViewType, ChannelProfile, VideoContent } from './types';
import { BarChart3, Clock, Menu } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setView] = useState<ViewType>('dashboard');
  const [channelProfile, setChannelProfile] = useState<ChannelProfile | null>(null);
  const [publishedVideos, setPublishedVideos] = useState<VideoContent[]>([]);
  const [draftVideos, setDraftVideos] = useState<VideoContent[]>([]);
  const [activeDraft, setActiveDraft] = useState<VideoContent | undefined>(undefined);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handlePost = (video: VideoContent) => {
    setPublishedVideos(prev => [video, ...prev]);
    setDraftVideos(prev => prev.filter(d => d.id !== video.id));
    setActiveDraft(undefined);
    setView('dashboard');
  };

  const handleSaveDraft = (video: VideoContent) => {
    setDraftVideos(prev => {
      const exists = prev.find(d => d.id === video.id);
      if (exists) return prev.map(d => d.id === video.id ? video : d);
      return [video, ...prev];
    });
    setActiveDraft(undefined);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView profile={channelProfile} publishedVideos={publishedVideos} setView={setView} />;
      case 'branding':
        return <BrandingView profile={channelProfile} onUpdate={setChannelProfile} />;
      case 'studio':
        return (
          <StudioView 
            profile={channelProfile} 
            onPost={handlePost} 
            onSaveDraft={handleSaveDraft}
            initialDraft={activeDraft}
          />
        );
      case 'analytics':
        return <AnalyticsView profile={channelProfile} publishedVideos={publishedVideos} />;
      case 'media':
        return (
          <div className="space-y-12">
            <div className="space-y-6">
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-6 h-6 text-zinc-500" /> Drafts
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {draftVideos.map(v => (
                  <div 
                    key={v.id} 
                    onClick={() => { setActiveDraft(v); setView('studio'); }}
                    className="space-y-3 group cursor-pointer"
                  >
                    <div className="aspect-video bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 relative">
                       {v.thumbnailUrl && <img src={v.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />}
                       <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] font-black uppercase bg-white text-black px-3 py-1 rounded-full">Edit Draft</span>
                       </div>
                    </div>
                    <p className="text-xs font-bold truncate px-1 text-zinc-300">{v.title || 'Untitled Project'}</p>
                  </div>
                ))}
                {draftVideos.length === 0 && <p className="col-span-full text-zinc-600 italic text-sm">No work-in-progress drafts.</p>}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-widest">Published Media</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {publishedVideos.map(v => (
                  <div key={v.id} className="space-y-3 group">
                    <div className="aspect-video bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 relative">
                       {(v.videoUrl || v.thumbnailUrl) && <img src={v.videoUrl || v.thumbnailUrl} className="w-full h-full object-cover" />}
                    </div>
                    <p className="text-xs font-bold truncate px-1">{v.title}</p>
                  </div>
                ))}
                {publishedVideos.length === 0 && (
                   <p className="col-span-full py-10 text-zinc-600 italic text-sm">Your AI media library is empty.</p>
                )}
              </div>
            </div>
          </div>
        );
      default:
        return <DashboardView profile={channelProfile} publishedVideos={publishedVideos} setView={setView} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#060606] text-white overflow-hidden font-inter">
      <Toaster position="top-center" richColors />
      <Sidebar 
        currentView={currentView} 
        setView={setView} 
        isOpen={isSidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <main className="flex-1 overflow-y-auto relative">
        <header className="sticky top-0 z-30 bg-[#060606]/80 backdrop-blur-md border-b border-zinc-900 px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-zinc-400 hover:text-white transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-[10px] md:text-sm font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-zinc-500">{currentView}</h2>
            {channelProfile && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-zinc-900 rounded-full border border-zinc-800">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{channelProfile.name}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 md:gap-6">
            <div className="hidden xs:flex -space-x-3">
               {['A', 'B', 'C'].map((char, i) => (
                 <div key={i} className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-[#060606] bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500 uppercase">
                   {char}
                 </div>
               ))}
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-gradient-to-tr from-zinc-800 to-zinc-950 border border-zinc-800 flex items-center justify-center">
              <div className="w-3 h-3 md:w-4 md:h-4 bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 pb-24">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
