
export interface ChannelProfile {
  name: string;
  niche: string;
  description: string;
  brandingStyle: string;
  logoUrl?: string;
  bannerUrl?: string;
  clonedVoice?: string; // Voice name: Zephyr, Puck, Kore, Fenrir, Charon
  clonedLikeness?: string[]; // Array of base64 images
  preferredModel?: AIModel;
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

export interface FreeAsset {
  title: string;
  url: string;
  type: 'image' | 'video' | 'audio' | 'other';
  source: string;
}

export type AIModel = 
  | 'gemini-3.1-pro-preview' 
  | 'gemini-3-flash-preview' 
  | 'gemini-3.1-flash-lite-preview' 
  | 'gemini-flash-latest'
  | 'llama-3-70b'
  | 'mistral-large';

export interface ModelMetadata {
  id: AIModel;
  name: string;
  description: string;
  type: string;
  isLegacy: boolean;
  stats: {
    intelligence: number;
    speed: number;
    cost: string;
  };
}

export type ViewType = 'dashboard' | 'branding' | 'studio' | 'media' | 'analytics';
