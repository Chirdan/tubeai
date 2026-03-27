
import React, { useState, useEffect, useRef } from 'react';
import { ChannelProfile, VideoContent, PlatformCaption, GroundingSource, FreeAsset, AIModel } from '../types';
import { 
  generateContentIdeaWithSearch, 
  generateThumbnail, 
  generateStoryboard, 
  generateClonedVideoVeo, 
  animateImageVeo,
  extendVideoVeo,
  generateVoiceCloneTTS,
  generatePlatformCaptions, 
  thinkComplexQuery, 
  analyzeVideo,
  generateTopicSuggestions,
  searchFreeAssets,
  getAvailableModels,
  getGeminiKey
} from '../services/geminiService';
import { GoogleGenAI, VideoGenerationReferenceType, VideoGenerationReferenceImage } from "@google/genai";
import { 
  FileText, Image as ImageIcon, Layout, Send, Loader2, Wand2, Play, Sparkles, 
  Youtube, Twitter, Instagram, Smartphone, BrainCircuit, Search, Upload, Video, Save, ExternalLink, Mic, User,
  Music, Layers, Globe, Cpu, Info, Plus, Facebook
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
  const [selectedVoice, setSelectedVoice] = useState(profile?.clonedVoice || 'Zephyr');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [magicProgress, setMagicProgress] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [freeAssets, setFreeAssets] = useState<FreeAsset[]>([]);
  const [selectedModel, setSelectedModel] = useState<AIModel>('gemini-3.1-flash-preview');
  const [showModelInfo, setShowModelInfo] = useState(false);
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [veoPrompt, setVeoPrompt] = useState('');
  const [animationImage, setAnimationImage] = useState<string | null>(null);
  const [animationVideo, setAnimationVideo] = useState<{ uri: string, blobUrl: string } | null>(null);
  const [lastOperationVideo, setLastOperationVideo] = useState<{ uri: string, blobUrl: string } | null>(null);
  
  const videoInputRef = useRef<HTMLInputElement>(null);
  const animationInputRef = useRef<HTMLInputElement>(null);
  const animationVideoInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const voicePersonalities = [
    { id: 'Zephyr', label: 'Zephyr', description: 'Calm & Professional' },
    { id: 'Puck', label: 'Puck', description: 'Energetic & Youthful' },
    { id: 'Kore', label: 'Kore', description: 'Warm & Approachable' },
    { id: 'Fenrir', label: 'Fenrir', description: 'Deep & Authoritative' },
    { id: 'Charon', label: 'Charon', description: 'Mysterious & Cinematic' },
  ];

  const activeProfile = profile || {
    name: "AI Creator",
    niche: "General",
    description: "Creative AI workspace",
    brandingStyle: "Cinematic Modern"
  };

  const platforms = [
    { id: 'youtube', icon: Youtube, color: 'text-red-500', bg: 'hover:bg-red-500/10' },
    { id: 'tiktok', icon: Music, color: 'text-cyan-400', bg: 'hover:bg-cyan-500/10' },
    { id: 'facebook', icon: Facebook, color: 'text-blue-600', bg: 'hover:bg-blue-600/10' },
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
      const { content: result, sources } = await generateContentIdeaWithSearch(activeProfile, topic, selectedModel);
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
      const result = await thinkComplexQuery(complexQuery, selectedModel);
      setThinkingResult(result);
      setContent(prev => ({ ...prev, thinkingResult: result }));
    } catch (error) {
      alert("Deep Thinking failed.");
    } finally {
      setLoading(null);
    }
  };

  const handleGenerateThumbnail = async () => {
    if (!content.title) {
      alert("Generate a script/idea first.");
      return;
    }
    setLoading('thumbnail');
    try {
      const url = await generateThumbnail(content.title, activeProfile.brandingStyle);
      setContent(prev => ({ ...prev, thumbnailUrl: url }));
    } catch (error) {
      alert("Thumbnail generation failed.");
    } finally {
      setLoading(null);
    }
  };

  const handleMagicCreate = async () => {
    if (!topic) return;
    setLoading('magic');
    setMagicProgress(0);
    try {
      // 1. Generate Idea
      setMotionStatus("Architecting Content Idea...");
      setMagicProgress(10);
      const { content: ideaResult, sources } = await generateContentIdeaWithSearch(activeProfile, topic, selectedModel);
      
      let currentContent = { ...ideaResult, groundingSources: sources };
      setContent(currentContent);
      setMagicProgress(30);

      // 2. Generate Storyboard
      setMotionStatus("Visualizing Storyboard...");
      const storyboard = await generateStoryboard(currentContent.title, currentContent.script, selectedModel);
      currentContent = { ...currentContent, storyboard };
      setContent(currentContent);
      setMagicProgress(60);

      // 3. Synthesize Voice
      setMotionStatus("Synthesizing Neural Voice...");
      const audioUrl = await generateVoiceCloneTTS(currentContent.script, selectedVoice);
      currentContent = { ...currentContent, audioUrl };
      setContent(currentContent);
      setMagicProgress(80);

      // 4. Adapt Captions
      setMotionStatus("Syncing Social Platforms...");
      const captions = await generatePlatformCaptions(currentContent.title, currentContent.script, selectedPlatforms, selectedModel);
      setSocialCaptions(captions);
      setMagicProgress(90);

      // 5. Generate Thumbnail
      setMotionStatus("Designing Viral Thumbnail...");
      const thumbnailUrl = await generateThumbnail(currentContent.title, activeProfile.brandingStyle);
      currentContent = { ...currentContent, thumbnailUrl };
      setContent(currentContent);
      setMagicProgress(100);

      alert("Magic Production Complete! Your content is ready for review and final synthesis.");
    } catch (error) {
      console.error("Magic Create failed:", error);
      alert("Magic Create encountered an error. Some steps may have been skipped.");
    } finally {
      setLoading(null);
      setMagicProgress(0);
    }
  };

  const handleSuggestTopics = async () => {
    if (!profile) return;
    setLoading('suggest');
    try {
      const suggestedTopics = await generateTopicSuggestions(profile, selectedModel);
      setSuggestions(suggestedTopics);
    } catch (error) {
      console.error("Failed to get suggestions:", error);
    } finally {
      setLoading(null);
    }
  };

  const handleFindResources = async () => {
    if (!topic) return;
    setLoading('resources');
    try {
      const assets = await searchFreeAssets(topic);
      setFreeAssets(assets);
    } catch (error) {
      console.error("Failed to find resources:", error);
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
      const result = await generateStoryboard(content.title, content.script, selectedModel);
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
      const url = await generateVoiceCloneTTS(content.script, selectedVoice);
      setContent(prev => ({ ...prev, audioUrl: url }));
    } catch (error) {
      alert("Voice synthesis failed.");
    } finally {
      setLoading(null);
    }
  };

  const handlePreviewVoice = async (voiceId: string) => {
    setLoading(`preview-${voiceId}`);
    try {
      const url = await generateVoiceCloneTTS("Hello, I am your AI voice clone. How can I help you today?", voiceId);
      const audio = new Audio(url);
      audio.play();
    } catch (error) {
      alert("Voice preview failed.");
    } finally {
      setLoading(null);
    }
  };

  const handleGenerateVeo = async () => {
    if (!content.title && !analysisResult) {
      alert("Generate a script or upload a reference video first.");
      return;
    }
    await ensureApiKey();
    setLoading('video');
    try {
      const prompt = veoPrompt || (analysisResult 
        ? `A cinematic animation inspired by this reference: ${analysisResult}`
        : `A cinematic video featuring the creator. Topic: ${content.title}. Style: ${activeProfile.brandingStyle}. Scene details: ${content.storyboard?.substring(0, 500)}`);
      
      const apiKey = getGeminiKey();
      const ai = new GoogleGenAI({ apiKey });
      
      const referenceImagesPayload: VideoGenerationReferenceImage[] = (activeProfile.clonedLikeness || []).map(img => ({
        image: {
          imageBytes: img.split(',')[1],
          mimeType: 'image/png',
        },
        referenceType: VideoGenerationReferenceType.ASSET,
      }));

      const useLikeness = referenceImagesPayload.length > 0;
      const model = useLikeness ? 'veo-3.1-generate-preview' : 'veo-3.1-fast-generate-preview';

      let operation = await ai.models.generateVideos({
        model: model,
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: aspectRatio,
          ...(useLikeness ? { referenceImages: referenceImagesPayload } : {})
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const videoData = operation.response?.generatedVideos?.[0]?.video;
      const downloadLink = videoData?.uri;
      const response = await fetch(`${downloadLink}&key=${apiKey}`);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      setLastOperationVideo({ uri: videoData?.uri || '', blobUrl });
      setContent(prev => ({ ...prev, videoUrl: blobUrl }));
    } catch (error) {
      alert("Veo generation failed.");
    } finally {
      setLoading(null);
    }
  };

  const handleExtendVideo = async () => {
    if (!lastOperationVideo?.uri) return;
    
    await ensureApiKey();
    setLoading('video');
    setMotionStatus("Extending Cinematic Sequence...");
    try {
      const prompt = veoPrompt || "Continue the scene with more dynamic action and cinematic flair.";
      const result = await extendVideoVeo(lastOperationVideo.uri, prompt, aspectRatio);
      
      setLastOperationVideo(result);
      setContent(prev => ({ ...prev, videoUrl: result.blobUrl }));
    } catch (error) {
      alert("Video extension failed.");
    } finally {
      setLoading(null);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading('video');
    setMotionStatus("Analyzing Reference Video...");
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const result = await analyzeVideo(base64, file.type, "Describe the visual style, motion, and key elements of this video to use as a reference for animation.");
        setAnalysisResult(result);
        setVeoPrompt(prev => prev ? `${prev}\n\nReference Style: ${result}` : `Reference Style: ${result}`);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      alert("Video analysis failed.");
    } finally {
      setLoading(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setAnimationImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnimateImage = async () => {
    if (!animationImage) return;
    
    await ensureApiKey();
    setLoading('video');
    setMotionStatus("Synthesizing Motion...");
    try {
      const prompt = veoPrompt || `Animate this scene beautifully, cinematic motion, 4k. Title: ${content.title || 'Untitled'}`;
      const result = await animateImageVeo(animationImage, prompt, aspectRatio);
      setLastOperationVideo(result);
      setContent(prev => ({ ...prev, videoUrl: result.blobUrl }));
    } catch (error) {
      alert("Image animation failed.");
    } finally {
      setLoading(null);
    }
  };

  const handleAdaptCaptions = async () => {
    if (!content?.title || !content.script) return;
    setLoading('social');
    try {
      const result = await generatePlatformCaptions(content.title, content.script, selectedPlatforms, selectedModel);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 md:space-y-8 pb-32 animate-in fade-in duration-700">
      <div className="flex justify-end mb-2 md:mb-4">
        <button 
          onClick={() => setIsAdvanced(!isAdvanced)}
          className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all"
        >
          {isAdvanced ? <Layout className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
          {isAdvanced ? 'Simple Mode' : 'Advanced Mode'}
        </button>
      </div>

      <div className={`grid grid-cols-1 ${isAdvanced ? 'xl:grid-cols-4' : 'max-w-4xl mx-auto'} gap-4 md:gap-8 transition-all duration-500`} style={{ contentVisibility: 'auto' }}>
        
        {/* AI Lab Sidebar - Only in Advanced Mode */}
        {isAdvanced && (
          <div className="xl:col-span-1 space-y-4 md:space-y-6 animate-in slide-in-from-left-4">
            <div className="bg-zinc-900/80 border border-zinc-800 p-4 md:p-6 rounded-3xl backdrop-blur-md">
            <div className="flex items-center gap-2 text-indigo-400 mb-4 md:mb-6">
              <BrainCircuit className="w-5 h-5" />
              <h3 className="font-bold uppercase tracking-wider text-xs md:text-sm">Clone Lab</h3>
            </div>
            
            <div className="space-y-6">
              {/* Voice Calibration */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Voice Personality</label>
                <div className="grid grid-cols-1 gap-2">
                  {voicePersonalities.map((voice) => (
                    <div
                      key={voice.id}
                      onClick={() => setSelectedVoice(voice.id)}
                      className={`p-3 rounded-2xl border transition-all text-left flex items-center justify-between group cursor-pointer ${
                        selectedVoice === voice.id 
                        ? 'bg-indigo-600/20 border-indigo-500/50 text-white' 
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-black uppercase tracking-wider">{voice.label}</p>
                        <p className="text-[9px] text-zinc-500">{voice.description}</p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreviewVoice(voice.id);
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${
                          selectedVoice === voice.id ? 'bg-indigo-500/20 text-indigo-400' : 'bg-zinc-900 text-zinc-600 hover:text-white'
                        }`}
                      >
                        {loading === `preview-${voice.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-3">Neural Synthesis</label>
                  <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mic className={`w-4 h-4 ${content.audioUrl ? 'text-green-500' : 'text-zinc-700'}`} />
                      <span className="text-xs font-bold text-zinc-400">{selectedVoice} Active</span>
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
                    <audio ref={audioRef} src={content.audioUrl} className="w-full h-8 mt-2 opacity-50" controls />
                  )}
                </div>
              </div>

              {/* Likeness Status */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Neural Likeness</label>
                <div className="flex -space-x-3 overflow-hidden p-1">
                   {activeProfile.clonedLikeness?.map((img, i) => (
                     <img key={i} src={img} loading="lazy" className="w-10 h-10 rounded-full border-2 border-zinc-900 object-cover" />
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

              {/* Video Analysis */}
              <div className="pt-6 border-t border-zinc-800">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Neural Video Analysis</label>
                <div className="mt-2">
                  <input 
                    type="file" 
                    ref={videoInputRef}
                    onChange={handleVideoAnalysis}
                    accept="video/*"
                    className="hidden"
                  />
                  <button 
                    onClick={() => videoInputRef.current?.click()}
                    disabled={!!loading}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-xs flex flex-col items-center justify-center gap-2 hover:border-indigo-500 transition-all group"
                  >
                    {loading === 'analysis' ? (
                      <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                    ) : (
                      <Upload className="w-5 h-5 text-zinc-700 group-hover:text-indigo-500" />
                    )}
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Upload for Analysis</span>
                  </button>
                </div>
                {analysisResult && (
                  <div className="mt-4 p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">Analysis Insights</p>
                    <div className="text-[11px] text-zinc-400 italic leading-relaxed max-h-40 overflow-y-auto custom-scroll">
                      {analysisResult}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

        {/* Main Production Area */}
        <div className={`${isAdvanced ? 'xl:col-span-3' : 'w-full'} space-y-6 md:space-y-8`} style={{ contentVisibility: 'auto' }}>
          <div className={`bg-zinc-900/50 ${isAdvanced ? 'p-4 md:p-8' : 'p-5 md:p-12'} rounded-3xl border border-zinc-800 backdrop-blur-sm shadow-2xl`}>
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4 md:mb-8">
              <div className={!isAdvanced ? 'text-center w-full mb-2 md:mb-4' : ''}>
                <div className={`flex flex-wrap items-center gap-2 md:gap-3 mb-1 ${!isAdvanced ? 'justify-center' : ''}`}>
                  <h2 className={`${isAdvanced ? 'text-lg md:text-3xl' : 'text-2xl md:text-5xl'} font-black tracking-tight text-white flex items-center gap-2 md:gap-3`}>
                    Production Studio <div className="bg-indigo-600 px-2 py-0.5 rounded text-[7px] md:text-[10px] uppercase">Neural Clone</div>
                  </h2>
                  {isAdvanced && (
                    <div className="relative">
                      <button 
                        onClick={() => setShowModelInfo(!showModelInfo)}
                        className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all"
                      >
                        <Cpu className="w-3 h-3 text-indigo-500" />
                        {getAvailableModels().find(m => m.id === selectedModel)?.name}
                        <Info className="w-3 h-3 ml-1" />
                      </button>
                      
                      {showModelInfo && (
                        <div className="absolute left-0 top-full mt-2 w-72 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                          <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">AI Engine Selection</h4>
                          <div className="space-y-3">
                            {getAvailableModels().map(model => (
                              <button
                                key={model.id}
                                onClick={() => {
                                  setSelectedModel(model.id as AIModel);
                                  setShowModelInfo(false);
                                }}
                                className={`w-full text-left p-3 rounded-xl border transition-all ${
                                  selectedModel === model.id 
                                    ? 'bg-indigo-500/10 border-indigo-500/50' 
                                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-bold text-white">{model.name}</span>
                                  <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase font-black ${
                                    model.isLegacy ? 'bg-zinc-800 text-zinc-500' : 'bg-indigo-500 text-white'
                                  }`}>
                                    {model.type}
                                  </span>
                                </div>
                                <p className="text-[10px] text-zinc-500 leading-relaxed mb-2">{model.description}</p>
                                {model.id.includes('hf') || model.id.includes('llama') || model.id.includes('mistral') ? (
                                  !process.env.HUGGINGFACE_API_KEY && (
                                    <div className="flex items-center gap-1.5 text-[8px] text-amber-500 font-bold uppercase tracking-wider">
                                      <Info className="w-2.5 h-2.5" />
                                      Requires HUGGINGFACE_API_KEY
                                    </div>
                                  )
                                ) : null}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <p className={`text-zinc-400 ${isAdvanced ? 'text-sm' : 'text-lg font-medium'}`}>
                  {isAdvanced ? 'Automating your presence with Veo 3.1' : 'The easiest way to create viral AI content in one click.'}
                </p>
              </div>
              
              {isAdvanced && (
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
              )}
            </div>

            <div className={`flex flex-col ${isAdvanced ? 'md:flex-row' : 'gap-4 md:gap-6'} gap-3 md:gap-4 mb-4`}>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="What should your video be about?"
                  className={`w-full bg-zinc-950 border border-zinc-800 rounded-2xl ${isAdvanced ? 'px-4 md:px-5 py-3 md:py-4' : 'px-6 md:px-8 py-4 md:py-6 text-base md:text-xl'} focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all text-white shadow-inner`}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {isAdvanced && (
                    <button
                      onClick={handleSuggestTopics}
                      disabled={!!loading}
                      className="p-1.5 rounded-lg bg-zinc-900 text-zinc-500 hover:text-indigo-400 transition-colors"
                      title="Suggest trending topics"
                    >
                      {loading === 'suggest' ? <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" /> : <Sparkles className="w-3 h-3 md:w-4 md:h-4" />}
                    </button>
                  )}
                  <Search className={`${isAdvanced ? 'w-4 h-4 md:w-5 md:h-5' : 'w-5 h-5 md:w-6 md:h-6'} text-zinc-800`} />
                </div>
              </div>
              <div className={`flex flex-col sm:flex-row ${isAdvanced ? 'gap-2' : 'justify-center gap-3 md:gap-4'}`}>
                {isAdvanced && (
                  <button
                    onClick={handleCreateIdea}
                    disabled={!!loading || !topic}
                    className="bg-zinc-800 text-white font-black px-6 py-3 md:py-4 rounded-2xl hover:bg-zinc-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 text-xs md:text-sm"
                  >
                    {loading === 'content' ? <Loader2 className="animate-spin w-4 h-4 md:w-5 md:h-5" /> : <Wand2 className="w-4 h-4 md:w-5 md:h-5" />}
                    Draft
                  </button>
                )}
                <button
                  onClick={handleMagicCreate}
                  disabled={!!loading || !topic}
                  className={`${isAdvanced ? 'px-6 md:px-8 py-3 md:py-4' : 'px-8 md:px-12 py-4 md:py-6 text-base md:text-xl w-full md:w-auto'} bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-red-600/20 active:scale-95 group relative overflow-hidden`}
                >
                  {loading === 'magic' ? (
                    <Loader2 className="animate-spin w-5 h-5 md:w-6 md:h-6" />
                  ) : (
                    <Sparkles className="w-5 h-5 md:w-6 md:h-6 group-hover:animate-pulse" />
                  )}
                  <span>{loading === 'magic' ? 'Creating...' : 'Magic Create'}</span>
                  {loading === 'magic' && (
                    <div 
                      className="absolute bottom-0 left-0 h-1 bg-white/30 transition-all duration-500" 
                      style={{ width: `${magicProgress}%` }}
                    />
                  )}
                </button>
                <button
                  onClick={handleFindResources}
                  disabled={!!loading || !topic}
                  className={`${isAdvanced ? 'px-6 py-3 md:py-4' : 'px-8 md:px-12 py-4 md:py-6 text-base md:text-xl w-full md:w-auto'} bg-zinc-950 border border-zinc-800 text-zinc-400 font-black rounded-2xl hover:border-indigo-500 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 text-xs md:text-sm`}
                >
                  {loading === 'resources' ? <Loader2 className="animate-spin w-4 h-4 md:w-5 md:h-5" /> : <Globe className="w-4 h-4 md:w-5 md:h-5" />}
                  Find Resources
                </button>
              </div>
            </div>

            {!topic && !content.title && !loading && (
              <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-4 text-center">Need an idea? Try one of these:</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {['AI Revolution 2026', 'Future of Space Travel', 'Life in the Metaverse', 'Quantum Computing Explained', 'Sustainable Tech Hacks'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTopic(t)}
                      className="px-6 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs font-bold text-zinc-400 hover:border-red-500/50 hover:text-white transition-all active:scale-95"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-10 animate-in fade-in slide-in-from-top-2">
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest self-center mr-2">Suggestions:</span>
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setTopic(s);
                      setSuggestions([]);
                    }}
                    className="px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400 hover:border-indigo-500/50 hover:text-white transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {freeAssets.length > 0 && (
              <div className="mb-10 animate-in slide-in-from-top-4">
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-xs font-black text-zinc-300 uppercase tracking-widest">Discovered Free Material</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {freeAssets.map((asset, idx) => (
                    <a 
                      key={idx}
                      href={asset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl hover:border-indigo-500/50 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="p-2 rounded-lg bg-zinc-900 text-zinc-500 group-hover:text-indigo-400 transition-colors">
                          {asset.type === 'image' && <ImageIcon className="w-4 h-4" />}
                          {asset.type === 'video' && <Video className="w-4 h-4" />}
                          {asset.type === 'audio' && <Music className="w-4 h-4" />}
                          {asset.type === 'other' && <FileText className="w-4 h-4" />}
                        </div>
                        <ExternalLink className="w-3 h-3 text-zinc-700 group-hover:text-zinc-400" />
                      </div>
                      <p className="text-xs font-bold text-zinc-300 mb-1 line-clamp-1">{asset.title}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-wider">{asset.source}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-500 uppercase">{asset.type}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {content.title && (
              <div className={`grid grid-cols-1 ${isAdvanced ? 'lg:grid-cols-12' : 'max-w-3xl mx-auto'} gap-10 animate-in slide-in-from-bottom-10`}>
                
                {/* Script column */}
                <div className={`${isAdvanced ? 'lg:col-span-8' : 'w-full'} space-y-8`}>
                  <div className="bg-zinc-950 p-8 rounded-3xl border border-zinc-800 relative group shadow-2xl">
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
                <div className={`${isAdvanced ? 'lg:col-span-4' : 'w-full'} space-y-8`}>
                  {/* Thumbnail Section */}
                  <div className="bg-zinc-950 p-8 rounded-3xl border border-zinc-800 shadow-2xl relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2 text-indigo-500">
                        <ImageIcon className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Viral Thumbnail</span>
                      </div>
                      <button 
                        onClick={handleGenerateThumbnail}
                        disabled={loading === 'thumbnail'}
                        className="bg-zinc-900 border border-zinc-800 text-zinc-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:text-white transition-all disabled:opacity-50"
                      >
                        {loading === 'thumbnail' ? 'Designing...' : 'Regenerate'}
                      </button>
                    </div>
                    
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800">
                      {content.thumbnailUrl ? (
                        <>
                          <img 
                            src={content.thumbnailUrl} 
                            alt="Thumbnail" 
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700"
                            referrerPolicy="no-referrer"
                          />
                          {process.env.MUAPI_API_KEY && (
                            <div className="absolute top-3 right-3 bg-indigo-600 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest shadow-xl">
                              Midjourney Cinema
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-700 gap-3">
                          <ImageIcon className="w-8 h-8 opacity-20" />
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-50">No Thumbnail Generated</p>
                        </div>
                      )}
                    </div>
                    
                    <p className="mt-4 text-[10px] text-zinc-500 italic leading-relaxed">
                      {process.env.MUAPI_API_KEY 
                        ? "Powered by Midjourney v6 via Muapi for ultra-realistic cinematic results."
                        : "Powered by Gemini 2.5 Flash Image for high-speed creative assets."}
                    </p>
                  </div>

                  <div className="bg-zinc-950 p-6 rounded-3xl border border-zinc-800 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-indigo-500">Visual Blueprint</h4>
                      <button onClick={handleGenerateStoryboard} className="text-[10px] underline font-bold text-zinc-600 hover:text-white">Regenerate</button>
                    </div>
                    <div className="h-40 bg-zinc-900 rounded-2xl p-4 overflow-y-auto text-[11px] text-zinc-500 italic leading-relaxed custom-scroll">
                      {content.storyboard || "Awaiting visual planning..."}
                    </div>
                  </div>

                  <div className="bg-zinc-950 p-6 rounded-3xl border border-zinc-800">
                     <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2 text-orange-500">
                          <Video className="w-4 h-4" />
                          <h4 className="text-xs font-black uppercase tracking-widest">Veo 3.1 Cinema</h4>
                        </div>
                        <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                          <input 
                            type="file" 
                            ref={animationInputRef} 
                            onChange={handleImageUpload} 
                            accept="image/*" 
                            className="hidden" 
                          />
                          <input 
                            type="file" 
                            ref={videoInputRef} 
                            onChange={handleVideoUpload} 
                            accept="video/*" 
                            className="hidden" 
                          />
                          <button 
                            onClick={() => setAspectRatio('16:9')} 
                            className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${aspectRatio === '16:9' ? 'bg-orange-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                          >
                            16:9
                          </button>
                          <button 
                            onClick={() => setAspectRatio('9:16')} 
                            className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${aspectRatio === '9:16' ? 'bg-orange-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                          >
                            9:16
                          </button>
                        </div>
                     </div>

                     <div className="space-y-4 mb-6">
                        <div className="grid grid-cols-3 gap-3">
                          <button 
                            onClick={() => animationInputRef.current?.click()}
                            className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 transition-all group"
                          >
                            <div className="p-2 rounded-xl bg-zinc-950 text-zinc-500 group-hover:text-orange-500 transition-colors">
                              <Upload className="w-5 h-5" />
                            </div>
                            <span className="text-[8px] font-black uppercase text-zinc-500 group-hover:text-zinc-300">Base Image</span>
                          </button>

                          <button 
                            onClick={() => videoInputRef.current?.click()}
                            className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 transition-all group"
                          >
                            <div className="p-2 rounded-xl bg-zinc-950 text-zinc-500 group-hover:text-orange-500 transition-colors">
                              <Video className="w-5 h-5" />
                            </div>
                            <span className="text-[8px] font-black uppercase text-zinc-500 group-hover:text-zinc-300">Reference Video</span>
                          </button>
                          
                          <div className="relative rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center">
                            {animationImage ? (
                              <>
                                <img src={animationImage} loading="lazy" className="w-full h-full object-cover opacity-50" />
                                <button 
                                  onClick={() => setAnimationImage(null)}
                                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-lg text-white hover:bg-red-500 transition-colors"
                                >
                                  <Save className="w-3 h-3 rotate-45" />
                                </button>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-[8px] font-black uppercase bg-orange-600 px-2 py-0.5 rounded text-white">Ready</span>
                                </div>
                              </>
                            ) : analysisResult ? (
                              <div className="text-center p-4">
                                <BrainCircuit className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
                                <p className="text-[8px] font-black text-indigo-400 uppercase">Video Analyzed</p>
                              </div>
                            ) : (
                              <div className="text-center p-4">
                                <ImageIcon className="w-5 h-5 text-zinc-800 mx-auto mb-1" />
                                <p className="text-[8px] font-black text-zinc-700 uppercase">No Ref</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <textarea
                          value={veoPrompt}
                          onChange={(e) => setVeoPrompt(e.target.value)}
                          placeholder="Describe the motion or scene (optional)..."
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-[11px] text-zinc-400 focus:border-orange-500 outline-none transition-colors h-20 resize-none"
                        />
                     </div>

                     <div className={`relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 group flex items-center justify-center ${aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[9/16] max-h-[400px] mx-auto'}`}>
                        {content.videoUrl ? (
                          <video 
                            src={content.videoUrl} 
                            autoPlay 
                            loop 
                            muted 
                            playsInline
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="text-center p-6">
                            <div className="w-12 h-12 rounded-full bg-zinc-950 flex items-center justify-center mx-auto mb-3 border border-zinc-800">
                              <Video className="w-6 h-6 text-zinc-800" />
                            </div>
                            <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Cinema Offline</p>
                          </div>
                        )}

                        {loading === 'video' && (
                          <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center p-6 text-center z-20">
                             <div className="relative mb-6">
                               <Loader2 className="w-12 h-12 animate-spin text-orange-600" />
                               <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-orange-400 animate-pulse" />
                             </div>
                             <p className="text-xs font-black uppercase text-white tracking-[0.2em] mb-2">{motionStatus}</p>
                             <div className="w-32 h-1 bg-zinc-800 rounded-full overflow-hidden">
                               <div className="h-full bg-orange-600 animate-shimmer" style={{ width: '60%' }} />
                             </div>
                          </div>
                        )}

                        <div className="absolute inset-x-4 bottom-4 translate-y-full group-hover:translate-y-0 transition-all duration-300 z-10 flex gap-2">
                      <button 
                        onClick={animationImage ? handleAnimateImage : handleGenerateVeo}
                        disabled={!!loading || (!content.storyboard && !animationImage && !analysisResult)}
                        className="flex-1 bg-orange-600 text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-orange-600/30 hover:bg-orange-500 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        {animationImage ? <Sparkles className="w-4 h-4" /> : analysisResult ? <Wand2 className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                        {animationImage ? 'Animate Image' : analysisResult ? 'Video to Animation' : 'Synthesize'}
                      </button>
                           {lastOperationVideo && (
                             <button 
                               onClick={handleExtendVideo}
                               disabled={!!loading}
                               className="bg-zinc-900 border border-zinc-800 text-white px-4 py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
                               title="Extend video by 7 seconds"
                             >
                               <Plus className="w-4 h-4" />
                             </button>
                           )}
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
