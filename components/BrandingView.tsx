
import React, { useState, useEffect, useRef } from 'react';
import { ChannelProfile } from '../types';
import { generateChannelBranding } from '../services/geminiService';
import { Sparkles, Save, RefreshCw, Type as TypeIcon, AlignLeft, Palette, User, Mic, Trash2, Plus } from 'lucide-react';

interface BrandingViewProps {
  profile: ChannelProfile | null;
  onUpdate: (profile: ChannelProfile) => void;
}

const voices = ['Zephyr', 'Puck', 'Kore', 'Fenrir', 'Charon'];

const BrandingView: React.FC<BrandingViewProps> = ({ profile, onUpdate }) => {
  const [niche, setNiche] = useState(profile?.niche || '');
  const [loading, setLoading] = useState(false);
  const [localProfile, setLocalProfile] = useState<ChannelProfile | null>(profile);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile && !localProfile) {
      setLocalProfile(profile);
    }
  }, [profile]);

  const handleGenerate = async () => {
    if (!niche) return;
    setLoading(true);
    try {
      const result = await generateChannelBranding(niche);
      setLocalProfile({ ...result, clonedVoice: localProfile?.clonedVoice, clonedLikeness: localProfile?.clonedLikeness });
    } catch (error) {
      console.error(error);
      alert("Something went wrong while generating branding.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ChannelProfile, value: any) => {
    if (localProfile) {
      setLocalProfile({ ...localProfile, [field]: value });
    }
  };

  const handleLikenessUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    // Explicitly casting the file to File/Blob to fix type inference errors with readAsDataURL
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const current = localProfile?.clonedLikeness || [];
        if (current.length < 3) {
          handleInputChange('clonedLikeness', [...current, base64]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSave = () => {
    if (localProfile) {
      onUpdate({ ...localProfile, niche });
      alert("Channel Profile Saved!");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Basic Brand Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800 backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-2 text-white flex items-center gap-2">
              <Palette className="w-6 h-6 text-red-500" /> Channel Architect
            </h2>
            <p className="text-zinc-400 mb-6">Define your niche and let AI build your brand identity.</p>
            
            <div className="flex flex-col md:flex-row gap-4 mb-10">
              <input
                type="text"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="e.g., Quantum Physics Explained, Street Food Tours"
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all placeholder:text-zinc-700"
              />
              <button
                onClick={handleGenerate}
                disabled={loading || !niche}
                className="bg-white text-black font-bold px-8 py-4 rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                Architect
              </button>
            </div>

            {localProfile && (
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Channel Name</label>
                  <input
                    type="text"
                    value={localProfile.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Branding Style</label>
                  <input
                    type="text"
                    value={localProfile.brandingStyle}
                    onChange={(e) => handleInputChange('brandingStyle', e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Description</label>
                  <textarea
                    value={localProfile.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white resize-none text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cloning Chamber */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-zinc-900/80 border border-zinc-800 p-8 rounded-3xl backdrop-blur-md relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-purple-600/5 pointer-events-none" />
            
            <h2 className="text-xl font-black mb-6 text-white flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-500" /> Cloning Chamber
            </h2>

            <div className="space-y-8">
              {/* Likeness */}
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 block">Visual Likeness (Max 3)</label>
                <div className="flex gap-3">
                  {localProfile?.clonedLikeness?.map((img, i) => (
                    <div key={i} className="w-20 h-20 rounded-xl overflow-hidden border border-zinc-700 relative group/img">
                      <img src={img} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => handleInputChange('clonedLikeness', localProfile.clonedLikeness?.filter((_, idx) => idx !== i))}
                        className="absolute inset-0 bg-red-600/80 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                  {(localProfile?.clonedLikeness?.length || 0) < 3 && (
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 rounded-xl border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center text-zinc-600 hover:border-indigo-500 hover:text-indigo-500 transition-all"
                    >
                      <Plus className="w-5 h-5 mb-1" />
                      <span className="text-[8px] font-black uppercase">Add Foto</span>
                    </button>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleLikenessUpload} multiple accept="image/*" className="hidden" />
                </div>
              </div>

              {/* Voice */}
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 block flex items-center gap-2">
                  <Mic className="w-3 h-3" /> Voice Personality
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {voices.map(v => (
                    <button
                      key={v}
                      onClick={() => handleInputChange('clonedVoice', v)}
                      className={`px-4 py-3 rounded-xl border text-left transition-all flex items-center justify-between group ${
                        localProfile?.clonedVoice === v 
                          ? 'bg-indigo-600 border-indigo-500 text-white' 
                          : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-600'
                      }`}
                    >
                      <span className="text-sm font-bold">{v}</span>
                      {localProfile?.clonedVoice === v && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleSave}
            className="w-full bg-red-600 text-white font-black py-4 rounded-2xl hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-red-600/10 active:scale-95"
          >
            <Save className="w-5 h-5" /> SYNC ARCHITECT
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrandingView;
