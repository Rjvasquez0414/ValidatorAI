import { GoogleGenAI, Type } from "@google/genai";
import { Project, AIAnalysis, PortfolioAnalysis } from '../types';

const getAiClient = () => {
    if (!process.env.API_KEY) {
        console.warn("API_KEY is not set in environment variables.");
        return null;
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeProject = async (project: Project): Promise<AIAnalysis> => {
    const ai = getAiClient();
    if (!ai) {
        // Fallback mock response if no API key is present for demo purposes or error
        return {
            recommendation: 'MONITOR',
            score: 50,
            reasoning: 'API Key missing. Unable to generate real analysis.',
            keyStrength: 'Unknown',
            keyRisk: 'Configuration Error',
            strategic_actions: ['Check API Key configuration', 'Ensure environment variables are set', 'Retry analysis']
        };
    }

    const prompt = `
    Act as a Senior Partner at a top-tier startup accelerator (like Y Combinator) and a Growth Expert.
    Your goal is to rigorously validate this MVP based on data, not feelings. 
    You must decide the immediate future of this project to optimize resources and potential returns.
    
    Project Name: ${project.name}
    Description: ${project.description}
    Category: ${project.category}
    
    Metrics History (Month by Month):
    ${JSON.stringify(project.metrics)}
    
    ANALYSIS INSTRUCTIONS:
    1. Calculate implicit Unit Economics (LTV/CAC) and Runway.
    2. Look for "Hockey Stick" growth or "Leaky Bucket" churn.
    3. Make a hard decision: SCALE (aggressive growth), PIVOT (change hypothesis), KILL (cut losses), or MONITOR (need more data).
    
    STRATEGY GENERATION:
    - If SCALE: Focus on paid acquisition channels, automation, and team expansion.
    - If PIVOT: Focus on customer interviews, changing the offer/pricing, or narrowing the niche.
    - If KILL: Focus on asset liquidation, post-mortem, and resource reallocation.
    - If MONITOR: Focus on increasing data granularity and fixing specific weak KPIs.

    Provide a structured JSON response with:
    - recommendation: strictly one of "SCALE", "PIVOT", "KILL", "MONITOR"
    - score: An integer 0-100 (Be harsh. >80 is rare).
    - reasoning: A brutally honest executive summary (max 30 words).
    - keyStrength: The unfair advantage or best metric.
    - keyRisk: The company killer or worst metric.
    - strategic_actions: An array of 3 specific, high-impact, tactical sentences describing EXACTLY what to do next based on the recommendation.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        recommendation: { type: Type.STRING, enum: ["SCALE", "PIVOT", "KILL", "MONITOR"] },
                        score: { type: Type.INTEGER },
                        reasoning: { type: Type.STRING },
                        keyStrength: { type: Type.STRING },
                        keyRisk: { type: Type.STRING },
                        strategic_actions: { 
                            type: Type.ARRAY, 
                            items: { type: Type.STRING },
                            description: "3 specific tactical actions to execute the strategy"
                        }
                    },
                    required: ["recommendation", "score", "reasoning", "keyStrength", "keyRisk", "strategic_actions"],
                },
            },
        });

        if (response.text) {
            return JSON.parse(response.text) as AIAnalysis;
        }
        throw new Error("No response text from Gemini");

    } catch (error) {
        console.error("Error analyzing project:", error);
        return {
            recommendation: 'MONITOR',
            score: 0,
            reasoning: 'Failed to generate analysis due to API error.',
            keyStrength: 'N/A',
            keyRisk: 'API Error',
            strategic_actions: ['Check network connection', 'Verify API quotas', 'Try again later']
        };
    }
};

export const analyzePortfolio = async (projects: Project[]): Promise<PortfolioAnalysis> => {
    const ai = getAiClient();
    if (!ai) {
        return {
            portfolioHealthScore: 0,
            executiveSummary: 'API Key missing.',
            topPerformingProject: 'N/A',
            killCandidates: [],
            allocationStrategy: ['Fix API Key'],
            marketTrend: 'STAGNANT'
        };
    }

    // Simplify data to send less tokens, just latest metrics and status
    const summaryData = projects.map(p => ({
        name: p.name,
        category: p.category,
        status: p.status,
        latestMetrics: p.metrics[p.metrics.length - 1] || 'No Data',
        totalMonths: p.metrics.length
    }));

    const prompt = `
    Act as a Venture Capital Portfolio Manager managing a fund of MVPs.
    Analyze the following list of projects to determine the overall health of the portfolio and make resource allocation decisions.
    
    Projects Data:
    ${JSON.stringify(summaryData)}

    GOAL:
    1. Identify the 'Cash Cows' or 'Stars' (High growth, low burn).
    2. Identify the 'Dogs' (Low growth, high burn, high churn) that should be killed immediately to save runway.
    3. Provide a high-level strategy for the entire fund.

    OUTPUT JSON:
    - portfolioHealthScore: 0-100 (Weighted average of success probability).
    - executiveSummary: A concise, professional overview of the portfolio status (max 50 words).
    - topPerformingProject: Name of the single best project.
    - killCandidates: Array of names of projects that are draining resources without results.
    - allocationStrategy: Array of 3 specific advice strings on where to move money/resources (e.g., "Shift budget from X to Y").
    - marketTrend: "BULLISH" (Growth), "BEARISH" (Decline), "STAGNANT" (Flat).
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        portfolioHealthScore: { type: Type.INTEGER },
                        executiveSummary: { type: Type.STRING },
                        topPerformingProject: { type: Type.STRING },
                        killCandidates: { type: Type.ARRAY, items: { type: Type.STRING } },
                        allocationStrategy: { type: Type.ARRAY, items: { type: Type.STRING } },
                        marketTrend: { type: Type.STRING, enum: ["BULLISH", "BEARISH", "STAGNANT"] }
                    },
                    required: ["portfolioHealthScore", "executiveSummary", "topPerformingProject", "killCandidates", "allocationStrategy", "marketTrend"]
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as PortfolioAnalysis;
        }
        throw new Error("No text response");
    } catch (e) {
        console.error("Portfolio analysis failed", e);
        return {
            portfolioHealthScore: 0,
            executiveSummary: 'Analysis failed.',
            topPerformingProject: 'N/A',
            killCandidates: [],
            allocationStrategy: [],
            marketTrend: 'STAGNANT'
        };
    }
};