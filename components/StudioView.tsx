
import React, { useState, useEffect, useRef } from 'react';
import { ChannelProfile, VideoContent, PlatformCaption, GroundingSource } from '../types';
import { 
  generateContentIdeaWithSearch, 
  generateThumbnail, 
  generateStoryboard, 
  generateClonedVideoVeo, 
  generateVoiceCloneTTS,
  generatePlatformCaptions, 
  thinkComplexQuery, 
  analyzeVideo 
} from '../services/geminiService';
import { 
  FileText, Image as ImageIcon, Layout, Send, Loader2, Wand2, Play, Sparkles, 
  Youtube, Twitter, Instagram, Smartphone, BrainCircuit, Search, Upload, Video, Save, ExternalLink, Mic, User
} from 'lucide-react';

interface StudioViewProps {
  profile: ChannelProfile | null;
  onPost: (video: VideoContent) => void;
  onSaveDraft: (video: VideoContent) => void;
  initialDraft?: Partial<VideoContent>;
}

const StudioView: React.FC<StudioViewProps> = ({ profile, onPost, onSaveDraft, initialDraft }) => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [content, setContent] = useState<Partial<VideoContent>>(initialDraft || {});
  const [motionStatus, setMotionStatus] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(initialDraft?.platforms || ['youtube']);
  const [socialCaptions, setSocialCaptions] = useState<PlatformCaption[]>(initialDraft?.socialCaptions || []);
  const [complexQuery, setComplexQuery] = useState('');
  const [thinkingResult, setThinkingResult] = useState(initialDraft?.thinkingResult || '');
  const [analysisResult, setAnalysisResult] = useState(initialDraft?.analysisResult || '');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const activeProfile = profile || {
    name: "AI Creator",
    niche: "General",
    description: "Creative AI workspace",
    brandingStyle: "Cinematic Modern"
  };

  const platforms = [
    { id: 'youtube', icon: Youtube, color: 'text-red-500', bg: 'hover:bg-red-500/10' },
    { id: 'tiktok', icon: Smartphone, color: 'text-cyan-400', bg: 'hover:bg-cyan-500/10' },
    { id: 'instagram', icon: Instagram, color: 'text-pink-500', bg: 'hover:bg-pink-500/10' },
    { id: 'twitter', icon: Twitter, color: 'text-sky-400', bg: 'hover:bg-sky-500/10' },
  ];

  const loadingMessages = [
    "Veo 3.1 Initializing...",
    "Extracting Character Likeness...",
    "Calibrating Clone Voice Profile...",
    "Synthesizing Neural Visuals...",
    "Finalizing Visual Masterpiece..."
  ];

  useEffect(() => {
    let interval: number;
    if (loading === 'video' || loading === 'audio') {
      let idx = 0;
      setMotionStatus(loadingMessages[0]);
      interval = window.setInterval(() => {
        idx = (idx + 1) % loadingMessages.length;
        setMotionStatus(loadingMessages[idx]);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleCreateIdea = async () => {
    if (!topic) return;
    setLoading('content');
    try {
      const { content: result, sources } = await generateContentIdeaWithSearch(activeProfile, topic);
      setContent(prev => ({ ...prev, ...result, groundingSources: sources }));
    } catch (error) {
      alert("Search grounding failed.");
    } finally {
      setLoading(null);
    }
  };

  const handleThinkQuery = async () => {
    if (!complexQuery) return;
    setLoading('thinking');
    try {
      const result = await thinkComplexQuery(complexQuery);
      setThinkingResult(result);
      setContent(prev => ({ ...prev, thinkingResult: result }));
    } catch (error) {
      alert("Deep Thinking failed.");
    } finally {
      setLoading(null);
    }
  };

  const handleVideoAnalysis = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading('analysis');
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const result = await analyzeVideo(base64, file.type, "Analyze this video and provide key takeaways for a content creator.");
        setAnalysisResult(result);
        setContent(prev => ({ ...prev, analysisResult: result }));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      alert("Video analysis failed.");
    } finally {
      setLoading(null);
    }
  };

  const handleGenerateStoryboard = async () => {
    if (!content.title || !content.script) {
      alert("Generate a script first.");
      return;
    }
    setLoading('storyboard');
    try {
      const result = await generateStoryboard(content.title, content.script);
      setContent(prev => ({ ...prev, storyboard: result }));
    } catch (error) {
      alert("Storyboard generation failed.");
    } finally {
      setLoading(null);
    }
  };

  const ensureApiKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio && typeof aistudio.hasSelectedApiKey === 'function') {
      const hasKey = await aistudio.hasSelectedApiKey();
      if (!hasKey) await aistudio.openSelectKey();
    }
  };

  const handleCloneVoice = async () => {
    if (!content.script) {
      alert("Generate a script first.");
      return;
    }
    setLoading('audio');
    try {
      const url = await generateVoiceCloneTTS(content.script, activeProfile.clonedVoice || 'Zephyr');
      setContent(prev => ({ ...prev, audioUrl: url }));
    } catch (error) {
      alert("Voice synthesis failed.");
    } finally {
      setLoading(null);
    }
  };

  const handleGenerateVeo = async () => {
    if (!content.title || !content.storyboard) {
      alert("Generate a storyboard first.");
      return;
    }
    await ensureApiKey();
    setLoading('video');
    try {
      const prompt = `A cinematic video featuring the creator. Topic: ${content.title}. Style: ${activeProfile.brandingStyle}. Scene details: ${content.storyboard.substring(0, 500)}`;
      const url = await generateClonedVideoVeo(prompt, activeProfile.clonedLikeness || [], aspectRatio);
      setContent(prev => ({ ...prev, videoUrl: url }));
    } catch (error) {
      alert("Veo generation failed.");
    } finally {
      setLoading(null);
    }
  };

  const handleAdaptCaptions = async () => {
    if (!content?.title || !content.script) return;
    setLoading('social');
    try {
      const result = await generatePlatformCaptions(content.title, content.script, selectedPlatforms);
      setSocialCaptions(result);
    } catch (error) {
      alert("Social adaptation failed.");
    } finally {
      setLoading(null);
    }
  };

  const handleSaveDraft = () => {
    onSaveDraft({
      ...content as VideoContent,
      id: content.id || Math.random().toString(36).substr(2, 9),
      platforms: selectedPlatforms,
      socialCaptions: socialCaptions,
      status: 'draft',
      createdAt: new Date().toISOString()
    });
    alert("Draft saved.");
  };

  const handlePost = () => {
    if (content?.title) {
      onPost({
        ...content as VideoContent,
        id: content.id || Math.random().toString(36).substr(2, 9),
        platforms: selectedPlatforms,
        socialCaptions: socialCaptions,
        status: 'published',
        createdAt: new Date().toISOString()
      });
      alert("Project published!");
      setContent({});
      setTopic('');
      setSocialCaptions([]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* AI Lab Sidebar */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-3xl backdrop-blur-md">
            <div className="flex items-center gap-2 text-indigo-400 mb-6">
              <BrainCircuit className="w-5 h-5" />
              <h3 className="font-bold uppercase tracking-wider text-sm">Clone Lab</h3>
            </div>
            
            <div className="space-y-6">
              {/* Voice Calibration */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Voice Calibration</label>
                <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <Mic className={`w-4 h-4 ${content.audioUrl ? 'text-green-500' : 'text-zinc-700'}`} />
                     <span className="text-xs font-bold text-zinc-400">{activeProfile.clonedVoice || 'Default'} Voice</span>
                   </div>
                   <button 
                    onClick={handleCloneVoice}
                    disabled={!!loading || !content.script}
                    className="p-2 hover:bg-zinc-800 rounded-lg text-indigo-500 disabled:opacity-30"
                   >
                     {loading === 'audio' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                   </button>
                </div>
                {content.audioUrl && (
                  <audio ref={audioRef} src={content.audioUrl} className="w-full h-8 opacity-50" controls />
                )}
              </div>

              {/* Likeness Status */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Neural Likeness</label>
                <div className="flex -space-x-3 overflow-hidden p-1">
                   {activeProfile.clonedLikeness?.map((img, i) => (
                     <img key={i} src={img} className="w-10 h-10 rounded-full border-2 border-zinc-900 object-cover" />
                   ))}
                   {(!activeProfile.clonedLikeness || activeProfile.clonedLikeness.length === 0) && (
                     <div className="w-10 h-10 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center text-zinc-600">
                        <User className="w-5 h-5" />
                     </div>
                   )}
                </div>
                <p className="text-[9px] text-zinc-500 italic uppercase">
                  {activeProfile.clonedLikeness?.length || 0} reference shots calibrated
                </p>
              </div>

              <div className="pt-6 border-t border-zinc-800">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Deep Thinker</label>
                <textarea 
                  value={complexQuery}
                  onChange={(e) => setComplexQuery(e.target.value)}
                  placeholder="Ask a complex strategic question..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs resize-none h-20 focus:border-indigo-500 outline-none transition-colors mt-2"
                />
                <button 
                  onClick={handleThinkQuery}
                  disabled={!!loading || !complexQuery}
                  className="w-full mt-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 border border-indigo-600/30 py-2 rounded-xl text-[10px] font-black uppercase transition-all"
                >
                  {loading === 'thinking' ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : 'Execute Neural Reasoning'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Production Area */}
        <div className="xl:col-span-3 space-y-8">
          <div className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-black tracking-tight text-white mb-1 flex items-center gap-3">
                  Production Studio <div className="bg-indigo-600 px-2 py-0.5 rounded text-[10px] uppercase">Neural Clone</div>
                </h2>
                <p className="text-zinc-400 text-sm">Automating your presence with Veo 3.1</p>
              </div>
              
              <div className="flex items-center gap-2 bg-zinc-950 p-1 rounded-2xl border border-zinc-800">
                {platforms.map(p => (
                  <button
                    key={p.id}
                    onClick={() => togglePlatform(p.id)}
                    className={`p-3 rounded-xl transition-all ${
                      selectedPlatforms.includes(p.id) ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-700 hover:text-zinc-500'
                    }`}
                  >
                    <p.icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 mb-10">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter a topic for your next hit..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all text-white shadow-inner"
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-800" />
              </div>
              <button
                onClick={handleCreateIdea}
                disabled={!!loading || !topic}
                className="bg-red-600 text-white font-black px-10 py-4 rounded-2xl hover:bg-red-700 transition-all flex items-center gap-2 disabled:opacity-50 shadow-xl shadow-red-600/10 active:scale-95"
              >
                {loading === 'content' ? <Loader2 className="animate-spin w-5 h-5" /> : <Wand2 className="w-5 h-5" />}
                Draft Master
              </button>
            </div>

            {content.title && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in slide-in-from-bottom-10">
                
                {/* Script column */}
                <div className="lg:col-span-8 space-y-8">
                  <div className="bg-zinc-950 p-8 rounded-3xl border border-zinc-800 relative group">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2 text-red-500">
                        <span className="text-xs font-black uppercase tracking-[0.2em]">Clone Script</span>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={handleCloneVoice}
                          className="bg-zinc-900 border border-zinc-800 text-zinc-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:text-white transition-all"
                        >
                          Synthesize Voice
                        </button>
                        <button 
                          onClick={handleAdaptCaptions}
                          className="bg-white/5 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all"
                        >
                          Sync Socials
                        </button>
                      </div>
                    </div>
                    <h3 className="text-3xl font-black mb-6 leading-tight">{content.title}</h3>
                    <p className="text-zinc-400 whitespace-pre-line leading-relaxed h-[350px] overflow-y-auto pr-6 custom-scroll text-sm italic">
                      {content.script}
                    </p>
                  </div>

                  {socialCaptions.length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                      {socialCaptions.map((sc, i) => (
                        <div key={i} className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-3xl">
                           <span className="text-[10px] font-black uppercase text-zinc-600 block mb-2">{sc.platform}</span>
                           <p className="text-xs text-zinc-400 line-clamp-3">"{sc.caption}"</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Synthesis column */}
                <div className="lg:col-span-4 space-y-8">
                  <div className="bg-zinc-950 p-6 rounded-3xl border border-zinc-800">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-indigo-500">Visual Blueprint</h4>
                      <button onClick={handleGenerateStoryboard} className="text-[10px] underline font-bold text-zinc-600 hover:text-white">Regenerate</button>
                    </div>
                    <div className="h-40 bg-zinc-900 rounded-2xl p-4 overflow-y-auto text-[11px] text-zinc-500 italic leading-relaxed custom-scroll">
                      {content.storyboard || "Awaiting visual planning..."}
                    </div>
                  </div>

                  <div className="bg-zinc-950 p-6 rounded-3xl border border-zinc-800">
                     <div className="flex items-center justify-between mb-4 text-orange-500">
                        <h4 className="text-xs font-black uppercase tracking-widest">AI Double Synthesis</h4>
                        <button onClick={() => setAspectRatio(aspectRatio === '16:9' ? '9:16' : '16:9')} className="text-[9px] bg-zinc-900 px-2 py-1 rounded text-zinc-500 font-bold">{aspectRatio}</button>
                     </div>

                     <div className="aspect-video bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 relative group flex items-center justify-center">
                        {content.videoUrl ? (
                          <video src={content.videoUrl} autoPlay loop muted className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center p-6">
                            <Video className="w-8 h-8 text-zinc-800 mx-auto mb-2" />
                            <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Clone Offline</p>
                          </div>
                        )}

                        {loading === 'video' && (
                          <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center p-6 text-center">
                             <Loader2 className="w-10 h-10 animate-spin text-red-600 mb-4" />
                             <p className="text-xs font-black uppercase text-white tracking-[0.2em]">{motionStatus}</p>
                          </div>
                        )}

                        <div className="absolute bottom-4 left-4 right-4 translate-y-full group-hover:translate-y-0 transition-transform">
                           <button 
                             onClick={handleGenerateVeo}
                             disabled={!!loading || !content.storyboard}
                             className="w-full bg-red-600 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-red-600/20"
                           >
                             Synthesize AI Double
                           </button>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={handleSaveDraft} className="bg-zinc-800 hover:bg-zinc-700 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-2 transition-all">
                      <Save className="w-5 h-5" /> DRAFT
                    </button>
                    <button onClick={handlePost} disabled={!content.videoUrl} className="bg-white text-black font-black py-5 rounded-2xl hover:bg-zinc-200 flex items-center justify-center gap-2 transition-all disabled:opacity-30">
                      <Send className="w-5 h-5" /> PUBLISH
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudioView;
