import type { Context } from "@netlify/functions";

const NICHES = [
  "Technology", "Gaming", "Education", "Finance", "Health & Fitness",
  "Travel", "Cooking", "Science", "Entertainment", "Music"
];

const TOPIC_TEMPLATES: Record<string, string[]> = {
  Technology: [
    "The Future of {trend} in {year}",
    "Why {trend} Will Change Everything",
    "{trend} vs {alt}: Which One Wins?",
    "I Tested {trend} for 30 Days — Here's What Happened",
    "Top 10 {trend} Tools You Need to Know"
  ],
  Gaming: [
    "This {trend} Strategy Breaks the Game",
    "{trend}: Tips the Pros Don't Tell You",
    "I Played {trend} So You Don't Have To",
    "The Hidden Secrets of {trend}",
    "Why {trend} Is the Best Game of {year}"
  ],
  Education: [
    "Learn {trend} in Just 10 Minutes",
    "The Science Behind {trend}",
    "{trend} Explained Simply",
    "What Schools Don't Teach You About {trend}",
    "Master {trend}: A Complete Beginner's Guide"
  ],
  Finance: [
    "How {trend} Can Make You Money in {year}",
    "{trend}: The Investment Nobody Talks About",
    "I Tried {trend} for a Month — My Results",
    "Why {trend} Is the Future of Finance",
    "Avoid These {trend} Mistakes at All Costs"
  ],
  default: [
    "The Ultimate Guide to {trend}",
    "Why Everyone Is Talking About {trend}",
    "{trend}: What You Need to Know in {year}",
    "I Tried {trend} and Here's My Honest Review",
    "The Truth About {trend} Nobody Tells You"
  ]
};

const TRENDS: Record<string, string[]> = {
  Technology: ["AI Agents", "Spatial Computing", "Quantum Computing", "Edge AI", "Robotics"],
  Gaming: ["Open World Survival", "AI NPCs", "Cloud Gaming", "VR MMOs", "Indie Roguelikes"],
  Education: ["AI Tutoring", "Microlearning", "STEM Coding", "Visual Note-Taking", "Spaced Repetition"],
  Finance: ["AI Trading Bots", "Tokenized Assets", "Passive Income Apps", "Micro-Investing", "DeFi Lending"],
  default: ["AI Tools", "Productivity Hacks", "Side Hustles", "Self-Improvement", "Minimalism"]
};

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generateSuggestions(niche: string, count: number) {
  const templates = TOPIC_TEMPLATES[niche] || TOPIC_TEMPLATES.default;
  const trends = TRENDS[niche] || TRENDS.default;
  const year = new Date().getFullYear();

  const suggestions = [];
  const selectedTemplates = pickRandom(templates, Math.min(count, templates.length));
  const selectedTrends = pickRandom(trends, Math.min(count, trends.length));

  for (let i = 0; i < count; i++) {
    const template = selectedTemplates[i % selectedTemplates.length];
    const trend = selectedTrends[i % selectedTrends.length];
    const altTrend = selectedTrends[(i + 1) % selectedTrends.length];

    const title = template
      .replace("{trend}", trend)
      .replace("{alt}", altTrend)
      .replace("{year}", String(year));

    suggestions.push({
      id: `sug-${Date.now()}-${i}`,
      title,
      niche,
      trend,
      estimatedViews: Math.floor(Math.random() * 50000) + 5000,
      difficulty: pickRandom(["easy", "medium", "hard"], 1)[0],
      tags: [niche.toLowerCase(), trend.toLowerCase().replace(/\s+/g, "-"), "trending"]
    });
  }

  return suggestions;
}

export default async (req: Request, _context: Context) => {
  const url = new URL(req.url);
  const niche = url.searchParams.get("niche") || "Technology";
  const count = Math.min(parseInt(url.searchParams.get("count") || "5"), 10);

  if (!NICHES.includes(niche) && niche !== "all") {
    return Response.json(
      { error: `Invalid niche. Available: ${NICHES.join(", ")}` },
      { status: 400 }
    );
  }

  const suggestions = niche === "all"
    ? NICHES.flatMap(n => generateSuggestions(n, 1)).slice(0, count)
    : generateSuggestions(niche, count);

  return Response.json({
    niche,
    count: suggestions.length,
    suggestions,
    generatedAt: new Date().toISOString()
  });
};

export const config = {
  path: "/api/content-suggestions"
};
