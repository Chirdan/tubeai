import type { Context } from "@netlify/functions";

interface VideoStats {
  videoId: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  watchTimeMinutes: number;
  avgViewDuration: number;
  ctr: number;
  publishedAt: string;
}

interface ChannelStats {
  totalViews: number;
  totalSubscribers: number;
  totalVideos: number;
  avgViewsPerVideo: number;
  avgEngagementRate: number;
  topPerformingVideo: VideoStats;
  recentVideos: VideoStats[];
  dailyTrend: { date: string; views: number; subscribers: number }[];
}

function generateMockVideoStats(id: number, daysAgo: number): VideoStats {
  const views = Math.floor(Math.random() * 100000) + 1000;
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);

  return {
    videoId: `vid-${id}`,
    title: `Video #${id}`,
    views,
    likes: Math.floor(views * (Math.random() * 0.08 + 0.02)),
    comments: Math.floor(views * (Math.random() * 0.01 + 0.002)),
    shares: Math.floor(views * (Math.random() * 0.005 + 0.001)),
    watchTimeMinutes: Math.floor(views * (Math.random() * 3 + 1)),
    avgViewDuration: Math.floor(Math.random() * 300 + 60),
    ctr: parseFloat((Math.random() * 8 + 2).toFixed(1)),
    publishedAt: date.toISOString()
  };
}

function generateChannelStats(period: string): ChannelStats {
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 14;
  const videoCount = Math.floor(Math.random() * 20) + 10;

  const recentVideos = Array.from({ length: Math.min(videoCount, 10) }, (_, i) =>
    generateMockVideoStats(i + 1, Math.floor(Math.random() * days))
  ).sort((a, b) => b.views - a.views);

  const totalViews = recentVideos.reduce((sum, v) => sum + v.views, 0);
  const totalLikes = recentVideos.reduce((sum, v) => sum + v.likes, 0);

  const dailyTrend = Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    return {
      date: date.toISOString().split("T")[0],
      views: Math.floor(Math.random() * 5000) + 500,
      subscribers: Math.floor(Math.random() * 50) + 5
    };
  });

  return {
    totalViews,
    totalSubscribers: Math.floor(Math.random() * 50000) + 1000,
    totalVideos: videoCount,
    avgViewsPerVideo: Math.floor(totalViews / recentVideos.length),
    avgEngagementRate: parseFloat(((totalLikes / totalViews) * 100).toFixed(2)),
    topPerformingVideo: recentVideos[0],
    recentVideos,
    dailyTrend
  };
}

export default async (req: Request, _context: Context) => {
  const url = new URL(req.url);
  const period = url.searchParams.get("period") || "14d";
  const videoId = url.searchParams.get("videoId");

  if (!["7d", "14d", "30d"].includes(period)) {
    return Response.json(
      { error: "Invalid period. Use 7d, 14d, or 30d." },
      { status: 400 }
    );
  }

  if (videoId) {
    const stats = generateMockVideoStats(parseInt(videoId.replace("vid-", "")) || 1, 0);
    return Response.json({
      videoId,
      stats,
      generatedAt: new Date().toISOString()
    });
  }

  const channelStats = generateChannelStats(period);

  return Response.json({
    period,
    channel: channelStats,
    generatedAt: new Date().toISOString()
  });
};

export const config = {
  path: "/api/video-stats"
};
