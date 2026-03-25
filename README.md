# TubeAI Studio

TubeAI Studio is a powerful, AI-driven content creation platform designed for YouTube creators. It leverages advanced AI models to automate the entire content creation workflow, from niche research and branding to scriptwriting, voice cloning, and cinematic video synthesis.

## Features

- **Channel Architect:** Generate a complete brand identity for any YouTube niche.
- **Content Studio:** 
  - **Magic Create:** One-click content generation including scripts, storyboards, and voiceovers.
  - **Neural Voice Cloning:** Synthesize professional voiceovers using advanced TTS models.
  - **Visual Storyboarding:** Automatically plan your video's visual flow.
  - **Social Adaptation:** Sync and adapt your content for YouTube, TikTok, Instagram, and Twitter.
- **AI Lab (Advanced Mode):**
  - **Deep Thinking:** Use Gemini 3.1 Pro for complex strategic reasoning.
  - **Neural Video Analysis:** Upload videos for deep AI-driven insights.
  - **Free Asset Discovery:** Automatically find free-to-use stock images, videos, and music.
- **Analytics Dashboard:** Track your channel's performance with beautiful data visualizations.

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS 4
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Charts:** Recharts
- **AI Integration:** 
  - Google Gemini API (@google/genai)
  - Hugging Face Inference API (@huggingface/inference)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/tubeai-studio.git
   cd tubeai-studio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add your API keys:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   HUGGINGFACE_API_KEY=your_huggingface_api_key_here
   ```
   *Note: You can get a Gemini API key from the [Google AI Studio](https://aistudio.google.com/).*

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## GitHub Compatibility & Security

- **No Hardcoded Keys:** All API keys are managed via environment variables.
- **Comprehensive .gitignore:** Sensitive files and build artifacts are excluded from version control.
- **Production Ready:** Optimized build process and clean dependency management.

## License

This project is licensed under the MIT License.
