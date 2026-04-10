
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import BrandingView from './components/BrandingView';
import StudioView from './components/StudioView';
import DashboardView from './components/DashboardView';
import AnalyticsView from './components/AnalyticsView';
import { Toaster, toast } from 'sonner';
import { ViewType, ChannelProfile, VideoContent } from './types';
import { BarChart3, Clock, Menu, LogIn, LogOut, User as UserIcon, AlertCircle, Loader2 } from 'lucide-react';
import { useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { App as CapApp } from '@capacitor/app';
import { auth, db, signInWithGoogle, logout, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, collection, query, orderBy, deleteDoc } from 'firebase/firestore';

// Error Boundary Component
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred.";
      try {
        const parsed = JSON.parse(this.state.error.message);
        if (parsed.error) errorMessage = `Firebase Error: ${parsed.error}`;
      } catch (e) {
        errorMessage = this.state.error.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-[#060606] text-white flex flex-col items-center justify-center p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
          <h1 className="text-2xl font-black uppercase tracking-widest mb-4">System Failure</h1>
          <p className="text-zinc-400 max-w-md mb-8 font-mono text-sm">{errorMessage}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-200 transition-all"
          >
            Reboot System
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const App: React.FC = () => {
  const [currentView, setView] = useState<ViewType>('dashboard');
  const [channelProfile, setChannelProfile] = useState<ChannelProfile | null>(null);
  const [publishedVideos, setPublishedVideos] = useState<VideoContent[]>([]);
  const [draftVideos, setDraftVideos] = useState<VideoContent[]>([]);
  const [activeDraft, setActiveDraft] = useState<VideoContent | undefined>(undefined);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>({ uid: 'default-user', displayName: 'Studio Creator', email: 'creator@tubeai.studio', photoURL: 'https://picsum.photos/seed/creator/100/100' });
  const [isAuthReady, setIsAuthReady] = useState(true);

  useEffect(() => {
    // Handle native status bar
    const setupNative = async () => {
      try {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#060606' });
      } catch (e) {
        console.log('Native StatusBar not available');
      }
    };

    setupNative();

    // Handle back button for Android
    const backListener = CapApp.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) {
        CapApp.exitApp();
      } else {
        window.history.back();
      }
    });

    return () => {
      backListener.then(l => l.remove());
    };
  }, []);

  // Firestore listeners
  useEffect(() => {
    if (!user || !isAuthReady) {
      setChannelProfile(null);
      setPublishedVideos([]);
      setDraftVideos([]);
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribeProfile = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        setChannelProfile(snapshot.data() as ChannelProfile);
      } else {
        // Initialize profile if it doesn't exist
        const initialProfile: ChannelProfile = {
          name: user.displayName || 'AI Creator',
          niche: 'General',
          description: 'Creative AI workspace',
          brandingStyle: 'Cinematic Modern',
          clonedVoice: 'Zephyr',
          clonedLikeness: []
        };
        setDoc(userDocRef, {
          ...initialProfile,
          uid: user.uid,
          email: user.email,
          createdAt: new Date().toISOString()
        }).catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}`));
      }
    }, (e) => handleFirestoreError(e, OperationType.GET, `users/${user.uid}`));

    const videosRef = collection(db, 'users', user.uid, 'videos');
    const q = query(videosRef, orderBy('createdAt', 'desc'));
    const unsubscribeVideos = onSnapshot(q, (snapshot) => {
      const videos = snapshot.docs.map(doc => doc.data() as VideoContent);
      setPublishedVideos(videos.filter(v => v.status === 'published'));
      setDraftVideos(videos.filter(v => v.status === 'draft'));
    }, (e) => handleFirestoreError(e, OperationType.GET, `users/${user.uid}/videos`));

    return () => {
      unsubscribeProfile();
      unsubscribeVideos();
    };
  }, [user, isAuthReady]);

  const handlePost = async (video: VideoContent) => {
    if (!user) return;
    const videoData = {
      ...video,
      uid: user.uid,
      status: 'published' as const,
      createdAt: video.createdAt || new Date().toISOString()
    };
    
    try {
      await setDoc(doc(db, 'users', user.uid, 'videos', videoData.id), videoData);
      setActiveDraft(undefined);
      setView('dashboard');
      toast.success("Project published to cloud!");
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}/videos/${videoData.id}`);
    }
  };

  const handleSaveDraft = async (video: VideoContent) => {
    if (!user) return;
    const videoData = {
      ...video,
      uid: user.uid,
      status: 'draft' as const,
      createdAt: video.createdAt || new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'users', user.uid, 'videos', videoData.id), videoData);
      setActiveDraft(undefined);
      toast.success("Draft synced to cloud.");
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}/videos/${videoData.id}`);
    }
  };

  const handleUpdateProfile = async (profile: ChannelProfile) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid), {
        ...profile,
        uid: user.uid,
        email: user.email,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      toast.success("Profile synced.");
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView profile={channelProfile} publishedVideos={publishedVideos} setView={setView} />;
      case 'branding':
        return <BrandingView profile={channelProfile} onUpdate={handleUpdateProfile} />;
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
                       {v.thumbnailUrl && <img src={v.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />}
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
                       {(v.videoUrl || v.thumbnailUrl) && <img src={v.videoUrl || v.thumbnailUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
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
    <ErrorBoundary>
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
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-gradient-to-tr from-zinc-800 to-zinc-950 border border-zinc-800 flex items-center justify-center">
                <div className="w-3 h-3 md:w-4 md:h-4 bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
              </div>
            </div>
          </header>

          <div className="p-4 md:p-8 pb-24">
            {isAuthReady ? renderView() : (
              <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
              </div>
            )}
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default App;
