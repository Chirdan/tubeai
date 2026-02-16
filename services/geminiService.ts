
import { GoogleGenAI, Type, Modality, VideoGenerationReferenceType, VideoGenerationReferenceImage } from "@google/genai";
import { ChannelProfile, VideoContent, PlatformCaption, GroundingSource } from "../types";

// Guideline: Implement manual base64 decoding for raw PCM audio
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const generateChannelBranding = async (niche: string): Promise<ChannelProfile> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Suggest a YouTube channel profile for the niche: "${niche}".`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          brandingStyle: { type: Type.STRING, description: "Visual style description (e.g. minimalist, futuristic, retro)" },
        },
        required: ["name", "description", "brandingStyle"]
      }
    }
  });

  const data = JSON.parse(response.text || '{}');
  return { ...data, niche };
};

export const generateContentIdeaWithSearch = async (channel: ChannelProfile, topic: string): Promise<{ content: Partial<VideoContent>, sources: GroundingSource[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Act as a YouTube strategist for a channel called "${channel.name}" in the niche "${channel.niche}". 
  Using current trends and up-to-date information, generate a video concept based on topic: "${topic}". 
  Include title, description, keywords, and a short script. Return the result in JSON format with keys: title, description, script, tags (array).`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    }
  });

  const text = response.text || '';
  let content = {};
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      content = JSON.parse(jsonMatch[0]);
    } else {
      content = { title: topic, description: text, script: text, tags: [] };
    }
  } catch (e) {
    content = { title: topic, description: text, script: text, tags: [] };
  }
  
  const sources = (response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingSource[]) || [];
  return { content, sources };
};

export const generateVoiceCloneTTS = async (script: string, voiceName: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Read the following script naturally and professionally: ${script}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voiceName || 'Zephyr' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio generated");

  // Create a blob from raw PCM
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), audioContext, 24000, 1);
  
  // Convert buffer to Wav blob for storage (simplified version)
  const wavBlob = await audioBufferToWav(audioBuffer);
  return URL.createObjectURL(wavBlob);
};

// Simplified AudioBuffer to Wav helper
async function audioBufferToWav(buffer: AudioBuffer): Promise<Blob> {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  
  const data = new Int16Array(buffer.length * numChannels);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < buffer.length; i++) {
      data[i * numChannels + channel] = Math.max(-1, Math.min(1, channelData[i])) * 32767;
    }
  }

  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + data.buffer.byteLength, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, data.buffer.byteLength, true);
  
  return new Blob([header, data.buffer], { type: 'audio/wav' });
}

export const generateClonedVideoVeo = async (
  prompt: string, 
  likenessImages: string[], 
  aspectRatio: '16:9' | '9:16' = '16:9'
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Explicitly type the reference images payload and use the correct enum
  const referenceImagesPayload: VideoGenerationReferenceImage[] = likenessImages.map(img => ({
    image: {
      imageBytes: img.split(',')[1],
      mimeType: 'image/png',
    },
    referenceType: VideoGenerationReferenceType.ASSET,
  }));

  // If we have likeness images, we must use veo-3.1-generate-preview
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

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

export const thinkComplexQuery = async (query: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: query,
    config: {
      thinkingConfig: { thinkingBudget: 32768 }
    }
  });
  return response.text || "Thinking failed.";
};

export const analyzeVideo = async (videoBase64: string, mimeType: string, prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        {
          inlineData: {
            data: videoBase64,
            mimeType: mimeType
          }
        },
        { text: prompt }
      ]
    }
  });
  return response.text || "Could not analyze video.";
};

export const generateThumbnail = async (title: string, style: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: `High-quality YouTube thumbnail for a video titled "${title}". Style: ${style}. Vibrant colors, eye-catching text placement, 4k, cinematic.` }]
    },
    config: {
      imageConfig: { aspectRatio: "16:9" }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Failed to generate image asset");
};

export const generateStoryboard = async (title: string, script: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Based on the video title "${title}" and script, create a detailed visual storyboard. 
  Describe exactly what should be shown on screen for each major scene. Break it down into "Scene 1: Visuals...", "Scene 2: Visuals...". 
  Focus on lighting, camera angles, and action.
  
  Script: ${script}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt
  });

  return response.text || "No storyboard generated.";
};

// Added missing export: Generate engaging social media captions for multiple platforms
export const generatePlatformCaptions = async (title: string, script: string, platforms: string[]): Promise<PlatformCaption[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Adapt the following content for social media captions.
    Title: ${title}
    Script: ${script}
    Platforms: ${platforms.join(', ')}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            platform: { type: Type.STRING },
            caption: { type: Type.STRING }
          },
          required: ["platform", "caption"]
        }
      }
    }
  });

  return JSON.parse(response.text || '[]');
};
