
import { GoogleGenAI } from "@google/genai";

export interface DebugReport {
  error: string;
  stack?: string;
  componentStack?: string;
  analysis?: string;
  suggestion?: string;
}

export const analyzeError = async (error: Error, componentStack?: string): Promise<DebugReport> => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    return {
      error: error.message,
      stack: error.stack,
      componentStack,
      analysis: "API Key missing. Cannot perform AI analysis.",
      suggestion: "Please ensure GEMINI_API_KEY is set in your environment variables."
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `
    You are an expert React and TypeScript debugger. 
    An error occurred in a YouTube content automation app called "TubeAI Studio".
    
    Error Message: ${error.message}
    Stack Trace: ${error.stack}
    Component Stack: ${componentStack || 'N/A'}
    
    Please analyze this error and provide:
    1. A clear explanation of what went wrong.
    2. A specific, actionable suggestion to fix it.
    
    Format your response as a JSON object with keys "analysis" and "suggestion".
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const result = JSON.parse(response.text || '{}');
    return {
      error: error.message,
      stack: error.stack,
      componentStack,
      analysis: result.analysis || "Could not analyze the error.",
      suggestion: result.suggestion || "No specific suggestion available."
    };
  } catch (e) {
    console.error("AI Debugging failed:", e);
    return {
      error: error.message,
      stack: error.stack,
      componentStack,
      analysis: "AI analysis failed due to a technical error.",
      suggestion: "Check the console for more details or try refreshing."
    };
  }
};
