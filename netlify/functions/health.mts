import type { Context } from "@netlify/functions";

const APP_VERSION = "1.0.0";
const APP_NAME = "TubeAI Studio";

interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "unavailable";
  configured: boolean;
}

function checkServices(): ServiceStatus[] {
  return [
    {
      name: "Gemini AI",
      status: process.env.GEMINI_API_KEY ? "operational" : "unavailable",
      configured: !!process.env.GEMINI_API_KEY
    },
    {
      name: "Hugging Face",
      status: process.env.HUGGINGFACE_API_KEY ? "operational" : "unavailable",
      configured: !!process.env.HUGGINGFACE_API_KEY
    },
    {
      name: "Midjourney (Muapi)",
      status: process.env.MUAPI_API_KEY ? "operational" : "unavailable",
      configured: !!process.env.MUAPI_API_KEY
    }
  ];
}

export default async (req: Request, context: Context) => {
  const services = checkServices();
  const operationalCount = services.filter(s => s.status === "operational").length;
  const overallStatus = operationalCount === services.length
    ? "healthy"
    : operationalCount > 0
      ? "degraded"
      : "unhealthy";

  const availableModels = [
    "gemini-3.1-pro-preview",
    "gemini-3.1-flash-preview",
    "gemini-3.1-flash-lite-preview",
    "gemini-flash-latest",
    "llama-3-70b",
    "mistral-large"
  ];

  const features = {
    scriptGeneration: services.some(s => s.name === "Gemini AI" && s.configured) || services.some(s => s.name === "Hugging Face" && s.configured),
    thumbnailGeneration: services.some(s => s.name === "Gemini AI" && s.configured),
    midjourneyThumbnails: services.some(s => s.name === "Midjourney (Muapi)" && s.configured),
    voiceCloning: services.some(s => s.name === "Gemini AI" && s.configured),
    videoGeneration: services.some(s => s.name === "Gemini AI" && s.configured),
    deepThinking: services.some(s => s.name === "Gemini AI" && s.configured)
  };

  return Response.json({
    app: APP_NAME,
    version: APP_VERSION,
    status: overallStatus,
    region: context.geo?.country || "unknown",
    services,
    features,
    availableModels,
    timestamp: new Date().toISOString()
  });
};

export const config = {
  path: "/api/health"
};
