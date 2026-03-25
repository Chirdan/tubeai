
import React, { useMemo } from 'react';
import { ChannelProfile, VideoContent, ViewType } from '../types';
import { 
  Play, Eye, Users, ThumbsUp, Youtube, Twitter, Instagram, Smartphone, 
  TrendingUp, Plus, Settings, Share2, BarChart2, ArrowUpRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { motion } from 'motion/react';
import { format, subDays } from 'date-fns';

interface DashboardViewProps {
  profile: ChannelProfile | null;
  publishedVideos: VideoContent[];
  setView: (view: ViewType) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ profile, publishedVideos, setView }) => {
  // Generate some mock chart data based on published videos
  const chartData = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dayVideos = publishedVideos.filter(v => 
        new Date(v.createdAt).toDateString() === date.toDateString()
      ).length;
      
      return {
        name: format(date, 'EEE'),
        views: 1200 + (dayVideos * 500) + Math.floor(Math.random() * 800),
        subs: 45 + (dayVideos * 10) + Math.floor(Math.random() * 20),
      };
    });
  }, [publishedVideos]);

  const stats = useMemo(() => {
    const totalVideos = publishedVideos.length;
    const baseViews = totalVideos * 12500;
    const baseLikes = totalVideos * 850;
    
    return [
      { icon: Eye, label: 'Views', value: baseViews > 0 ? `${(baseViews / 1000).toFixed(1)}K` : '0', color: 'text-blue-500', trend: '+12%' },
      { icon: Users, label: 'Subscribers', value: profile ? '45.8K' : '0', color: 'text-green-500', trend: '+5%' },
      { icon: ThumbsUp, label: 'Likes', value: baseLikes > 0 ? `${(baseLikes / 1000).toFixed(1)}K` : '0', color: 'text-red-500', trend: '+8%' },
      { icon: Play, label: 'Videos', value: totalVideos.toString(), color: 'text-purple-500', trend: 'New' },
    ];
  }, [publishedVideos, profile]);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'youtube': return <Youtube className="w-3 h-3 text-red-500" />;
      case 'tiktok': return <Smartphone className="w-3 h-3 text-cyan-400" />;
      case 'instagram': return <Instagram className="w-3 h-3 text-pink-500" />;
      case 'twitter': return <Twitter className="w-3 h-3 text-sky-400" />;
      default: return null;
    }
  };

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-zinc-500">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl"
        >
          <div className="w-20 h-20 bg-red-600/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-600/20">
            <Youtube className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-4xl font-black mb-4 text-white tracking-tight">
            Welcome to TubeAI Studio
          </h2>
          <p className="text-lg text-zinc-400 mb-12 leading-relaxed">
            Your AI-powered command center for YouTube automation. 
            Start by architecting your channel's brand identity to unlock the full potential of the studio.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
              { step: '01', title: 'Architect', desc: 'Define your niche, voice, and visual branding.', action: () => setView('branding') },
              { step: '02', title: 'Automate', desc: 'Generate scripts and media in the AI Studio.', action: () => setView('studio') },
              { step: '03', title: 'Analyze', desc: 'Track performance and optimize your growth.', action: () => setView('analytics') }
            ].map((item, i) => (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(24, 24, 27, 0.8)' }}
                onClick={item.action}
                className="p-6 bg-zinc-900/50 rounded-3xl border border-zinc-800 cursor-pointer transition-all group"
              >
                <span className="text-xs font-black text-red-600 tracking-widest mb-2 block">{item.step}</span>
                <h4 className="font-bold text-white mb-2 group-hover:text-red-500 transition-colors">{item.title}</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
          
          <button 
            onClick={() => setView('branding')}
            className="mt-12 px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-full hover:bg-zinc-200 transition-colors flex items-center gap-3 mx-auto"
          >
            Start Architecting <ArrowUpRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black uppercase tracking-widest text-white">Channel Overview</h3>
          <p className="text-xs text-zinc-500 font-bold mt-1 uppercase tracking-widest">Real-time performance metrics</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setView('studio')}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Content
          </button>
          <button className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors">
            <Share2 className="w-4 h-4 text-zinc-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl relative overflow-hidden group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl bg-zinc-950 border border-zinc-800 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                {stat.trend}
              </span>
            </div>
            <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">{stat.label}</p>
            <p className="text-3xl font-black text-white mt-2 tracking-tight">{stat.value}</p>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                </div>
                <h4 className="font-bold text-white">Performance Growth</h4>
              </div>
              <select className="bg-zinc-950 border border-zinc-800 text-[10px] font-black uppercase tracking-widest rounded-lg px-3 py-1.5 outline-none">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#52525b', fontSize: 10, fontWeight: 700 }} 
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorViews)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Recently Published</h3>
              <button 
                onClick={() => setView('media')}
                className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
              >
                View All Library
              </button>
            </div>
            {publishedVideos.length === 0 ? (
              <div className="bg-zinc-900/30 border border-dashed border-zinc-800 rounded-3xl p-12 text-center">
                <Play className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                <p className="text-zinc-500 font-medium">No videos published yet.</p>
                <button 
                  onClick={() => setView('studio')}
                  className="mt-4 text-xs font-black uppercase tracking-widest text-red-500 hover:text-red-400"
                >
                  Create your first video
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {publishedVideos.slice(0, 3).map(video => (
                  <motion.div 
                    key={video.id} 
                    whileHover={{ x: 4 }}
                    className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex gap-4 hover:border-zinc-700 transition-all cursor-pointer group"
                  >
                    <div className="w-40 aspect-video bg-zinc-950 rounded-xl overflow-hidden flex-shrink-0 relative">
                      <img src={video.thumbnailUrl || 'https://picsum.photos/320/180'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <Play className="w-6 h-6 text-white fill-white" />
                      </div>
                    </div>
                    <div className="flex-1 py-1 flex flex-col justify-between overflow-hidden">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bold truncate text-white text-sm">{video.title}</h4>
                          <div className="flex gap-1 flex-shrink-0">
                            {video.platforms?.map(p => (
                              <div key={p} className="bg-zinc-800 p-1 rounded-md border border-zinc-700">
                                {getPlatformIcon(p)}
                              </div>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{video.description}</p>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                        <span>{format(new Date(video.createdAt), 'MMM d, yyyy')}</span>
                        <span className="text-green-500 flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          Live
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
            <div className="h-24 bg-gradient-to-br from-red-600 via-red-500 to-indigo-600 relative">
              <div className="absolute inset-0 bg-black/20" />
            </div>
            <div className="p-6 -mt-12 relative">
               <div className="w-20 h-20 rounded-2xl bg-zinc-950 border-4 border-zinc-900 shadow-2xl flex items-center justify-center text-3xl font-black text-white mb-4 overflow-hidden">
                 {profile.name.charAt(0)}
               </div>
               <h4 className="text-xl font-black text-white tracking-tight">{profile.name}</h4>
               <p className="text-xs font-bold text-zinc-500 mt-1 uppercase tracking-widest">{profile.niche}</p>
               
               <div className="mt-8 space-y-4">
                 <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                      <span className="text-zinc-500">Brand Style</span>
                      <span className="text-white">{profile.brandingStyle}</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                      <div className="h-full bg-red-600 w-3/4" />
                    </div>
                 </div>
                 
                 <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                      <span className="text-zinc-500">Sentiment</span>
                      <span className="text-green-400">94% Positive</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 w-[94%]" />
                    </div>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-3 mt-8">
                 <button 
                  onClick={() => setView('branding')}
                  className="py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors flex items-center justify-center gap-2"
                 >
                   <Settings className="w-3 h-3" /> Edit
                 </button>
                 <button 
                  onClick={() => setView('analytics')}
                  className="py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors flex items-center justify-center gap-2"
                 >
                   <BarChart2 className="w-3 h-3" /> Stats
                 </button>
               </div>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-6">Quick Actions</h4>
            <div className="space-y-3">
              {[
                { icon: Plus, label: 'Create New Script', action: () => setView('studio') },
                { icon: Eye, label: 'Preview Channel', action: () => {} },
                { icon: TrendingUp, label: 'View Analytics', action: () => setView('analytics') },
              ].map((action, i) => (
                <button 
                  key={i}
                  onClick={action.action}
                  className="w-full p-4 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <action.icon className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                    <span className="text-xs font-bold text-zinc-400 group-hover:text-white transition-colors">{action.label}</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-zinc-800 group-hover:text-red-500 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
