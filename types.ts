
export interface ChannelProfile {
  name: string;
  niche: string;
  description: string;
  brandingStyle: string;
  logoUrl?: string;
  bannerUrl?: string;
  clonedVoice?: string; // Voice name: Zephyr, Puck, Kore, Fenrir, Charon
  clonedLikeness?: string[]; // Array of base64 images
}

export interface PlatformCaption {
  platform: string;
  caption: string;
}

export interface GroundingSource {
  web?: { uri: string; title: string };
  maps?: { uri: string; title: string };
}

export interface VideoContent {
  id: string;
  title: string;
  description: string;
  script: string;
  tags: string[];
  thumbnailUrl?: string;
  storyboard?: string;
  videoUrl?: string;
  audioUrl?: string;
  platforms: string[];
  socialCaptions?: PlatformCaption[];
  status: 'draft' | 'scheduled' | 'published';
  createdAt: string;
  thinkingResult?: string;
  groundingSources?: GroundingSource[];
  analysisResult?: string;
}

export type ViewType = 'dashboard' | 'branding' | 'studio' | 'media' | 'analytics';
