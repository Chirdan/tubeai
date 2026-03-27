
import React, { useMemo } from 'react';
import { VideoContent, ChannelProfile } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Users, Eye, Clock, Share2, 
  ArrowUpRight, Target, Zap, Award
} from 'lucide-react';
import { motion } from 'motion/react';
import { format, subDays, startOfDay } from 'date-fns';

interface AnalyticsViewProps {
  profile: ChannelProfile | null;
  publishedVideos: VideoContent[];
}

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ profile, publishedVideos }) => {
  const totalViews = publishedVideos.length * 12500;
  const totalWatchTime = publishedVideos.length * 450;
  const avgRetention = 68;

  const performanceData = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => {
      const date = subDays(new Date(), 13 - i);
      const dayVideos = publishedVideos.filter(v => 
        startOfDay(new Date(v.createdAt)).getTime() === startOfDay(date).getTime()
      ).length;
      
      return {
        date: format(date, 'MMM d'),
        views: 800 + (dayVideos * 1200) + Math.floor(Math.random() * 1500),
        watchTime: 40 + (dayVideos * 60) + Math.floor(Math.random() * 80),
        engagement: 5 + (dayVideos * 2) + Math.floor(Math.random() * 10),
      };
    });
  }, [publishedVideos]);

  const platformData = [
    { name: 'YouTube', value: 65 },
    { name: 'TikTok', value: 20 },
    { name: 'Instagram', value: 10 },
    { name: 'Twitter', value: 5 },
  ];

  const retentionData = [
    { time: '0:00', value: 100 },
    { time: '0:30', value: 85 },
    { time: '1:00', value: 72 },
    { time: '1:30', value: 65 },
    { time: '2:00', value: 58 },
    { time: '2:30', value: 52 },
    { time: '3:00', value: 48 },
  ];

  if (!profile || publishedVideos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-zinc-500">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-800">
            <BarChart className="w-10 h-10 text-zinc-700" />
          </div>
          <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Neural Analytics Locked</h3>
          <p className="max-w-md mx-auto text-zinc-500 leading-relaxed">
            We need at least one published video to begin tracking neural performance and audience sentiment.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20" style={{ contentVisibility: 'auto' }}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black uppercase tracking-widest text-white">Neural Insights</h3>
          <p className="text-xs text-zinc-500 font-bold mt-1 uppercase tracking-widest">Advanced audience & performance tracking</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all">
            Export Report
          </button>
          <button className="px-4 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all">
            Live Stream Stats
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {[
          { label: 'Total Views', value: `${(totalViews / 1000).toFixed(1)}K`, icon: Eye, trend: '+14.2%', color: 'text-blue-500' },
          { label: 'Watch Time (Hrs)', value: totalWatchTime.toString(), icon: Clock, trend: '+8.4%', color: 'text-purple-500' },
          { label: 'Avg. Retention', value: `${avgRetention}%`, icon: Target, trend: '+2.1%', color: 'text-green-500' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-zinc-900/50 border border-zinc-800 p-6 md:p-8 rounded-3xl"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 md:p-3 rounded-xl md:rounded-2xl bg-zinc-950 border border-zinc-800 ${stat.color}`}>
                <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className="flex items-center gap-1 text-[10px] md:text-xs font-black text-green-500">
                <TrendingUp className="w-3 h-3" /> {stat.trend}
              </div>
            </div>
            <p className="text-zinc-500 text-[10px] md:text-xs font-black uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl md:text-4xl font-black text-white mt-1 md:mt-2 tracking-tight">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4">
            <h4 className="font-black text-white uppercase tracking-widest text-xs md:text-sm">Audience Growth</h4>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-[9px] md:text-[10px] font-black text-zinc-500 uppercase">Views</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-[9px] md:text-[10px] font-black text-zinc-500 uppercase">Watch Time</span>
              </div>
            </div>
          </div>
          <div className="h-[250px] md:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#52525b', fontSize: 10, fontWeight: 700 }} 
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="views" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                <Area type="monotone" dataKey="watchTime" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTime)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8">
          <h4 className="font-black text-white uppercase tracking-widest text-sm mb-8">Platform Distribution</h4>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => <span className="text-[10px] font-black text-zinc-500 uppercase">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 space-y-4">
            {platformData.map((p, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-xs font-bold text-zinc-400">{p.name}</span>
                </div>
                <span className="text-xs font-black text-white">{p.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8">
          <h4 className="font-black text-white uppercase tracking-widest text-sm mb-8">Audience Retention</h4>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={retentionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#52525b', fontSize: 10, fontWeight: 700 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#52525b', fontSize: 10, fontWeight: 700 }} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }}
                />
                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-zinc-500 mt-6 italic text-center uppercase tracking-widest">
            Average drop-off at 1:15 mark. Consider adding a hook at this point.
          </p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8">
          <h4 className="font-black text-white uppercase tracking-widest text-sm mb-8">Neural Achievements</h4>
          <div className="space-y-4">
            {[
              { icon: Zap, label: 'Viral Potential', value: 'High', color: 'text-yellow-500', desc: 'Content matches current trending neural patterns.' },
              { icon: Award, label: 'Quality Score', value: '9.8/10', color: 'text-red-500', desc: 'Production value exceeds 98% of niche competitors.' },
              { icon: Share2, label: 'Shareability', value: '84%', color: 'text-blue-500', desc: 'Audience is highly likely to distribute this content.' },
            ].map((item, i) => (
              <div key={i} className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl flex gap-4">
                <div className={`p-3 rounded-xl bg-zinc-900 ${item.color} flex-shrink-0`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-500">{item.label}</span>
                    <span className={`text-xs font-black ${item.color}`}>{item.value}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
