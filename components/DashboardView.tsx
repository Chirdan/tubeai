
import React from 'react';
import { ChannelProfile, VideoContent } from '../types';
import { Play, Eye, Users, ThumbsUp, Youtube, Twitter, Instagram, Smartphone } from 'lucide-react';

interface DashboardViewProps {
  profile: ChannelProfile | null;
  publishedVideos: VideoContent[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ profile, publishedVideos }) => {
  const stats = [
    { icon: Eye, label: 'Views', value: '1.2M', color: 'text-blue-500' },
    { icon: Users, label: 'Subscribers', value: '45.8K', color: 'text-green-500' },
    { icon: ThumbsUp, label: 'Likes', value: '89.2K', color: 'text-red-500' },
    { icon: Play, label: 'Videos', value: publishedVideos.length.toString(), color: 'text-purple-500' },
  ];

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
      <div className="flex flex-col items-center justify-center h-full text-zinc-500">
        <h2 className="text-3xl font-bold mb-4 text-white">Welcome to TubeAI</h2>
        <p className="max-w-md text-center mb-8">
          The ultimate automation suite for YouTube creators. Get started by architecting your channel brand.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 bg-zinc-900 rounded-3xl border border-zinc-800">
             <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center mb-3">1</div>
             <p className="font-bold">Architect</p>
          </div>
          <div className="p-6 bg-zinc-900 rounded-3xl border border-zinc-800">
             <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center mb-3">2</div>
             <p className="font-bold">Automate</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl">
            <stat.icon className={`${stat.color} w-6 h-6 mb-4`} />
            <p className="text-zinc-500 text-sm font-medium">{stat.label}</p>
            <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold">Recently Published</h3>
          {publishedVideos.length === 0 ? (
            <div className="bg-zinc-900/30 border border-dashed border-zinc-800 rounded-3xl p-12 text-center text-zinc-500">
              No videos published yet. Start creating in the studio.
            </div>
          ) : (
            <div className="space-y-4">
              {publishedVideos.map(video => (
                <div key={video.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex gap-4 hover:border-zinc-700 transition-colors cursor-pointer group">
                  <div className="w-48 aspect-video bg-zinc-950 rounded-lg overflow-hidden flex-shrink-0 relative">
                    <img src={video.thumbnailUrl || 'https://picsum.photos/320/180'} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <Play className="w-8 h-8 text-white fill-white" />
                    </div>
                  </div>
                  <div className="flex-1 py-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold line-clamp-1 text-white">{video.title}</h4>
                        <div className="flex gap-1">
                          {video.platforms?.map(p => (
                            <div key={p} className="bg-zinc-800 p-1 rounded-md border border-zinc-700">
                              {getPlatformIcon(p)}
                            </div>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-zinc-500 mt-1 line-clamp-2">{video.description}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-bold text-zinc-600 uppercase">
                      <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                      <span className="text-green-500 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Live
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold">Channel Brand</h3>
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-red-600 to-indigo-600" />
            <div className="p-6 -mt-12">
               <div className="w-16 h-16 rounded-2xl bg-zinc-950 border-4 border-zinc-900 shadow-xl flex items-center justify-center text-2xl font-bold text-white mb-4">
                 {profile.name.charAt(0)}
               </div>
               <h4 className="text-xl font-bold">{profile.name}</h4>
               <p className="text-sm text-zinc-500 mt-1">{profile.niche}</p>
               <div className="mt-6 space-y-3">
                 <div className="flex justify-between text-sm">
                   <span className="text-zinc-500">Brand Style:</span>
                   <span className="text-white font-medium capitalize">{profile.brandingStyle}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                   <span className="text-zinc-500">Sentiment:</span>
                   <span className="text-green-400 font-medium">94% Positive</span>
                 </div>
               </div>
               <button className="w-full mt-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-colors">
                 Customize Layout
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
