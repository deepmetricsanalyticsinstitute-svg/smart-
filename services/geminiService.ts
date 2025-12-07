

import { GoogleGenAI } from "@google/genai";
import { CalculationParams, CalculationResult, formatCurrency, formatNumber } from "../utils/calculator";

const getSystemInstruction = () => `
You are a savvy, professional, and encouraging financial advisor assistant. 
Your goal is to explain investment calculation results clearly and concisely to a user.
Avoid jargon where possible, or explain it if necessary.
Focus on the power of compound interest, the impact of time, the rate of return, and the effects of inflation.
Do not give specific "buy" or "sell" advice for specific stocks. 
Keep the tone educational and empowering.
Structure the response with a friendly opening, key takeaways (bullet points), and a brief conclusion.
`;

export const generateInvestmentInsight = async (
  params: CalculationParams,
  results: CalculationResult,
  mode: 'FV' | 'PV' | 'RATE' | 'TIME' | 'PMT',
  currency: string,
  goalName?: string
): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key is missing. Unable to generate insights.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let goalContext = "";
    if (goalName) {
      goalContext = `The user is specifically planning for a goal named "${goalName}". `;
    }

    if (mode === 'PV') goalContext += "The user wants to know how much to invest today (Lump Sum) to reach a target future value.";
    if (mode === 'PMT') goalContext += "The user wants to know how much to contribute regularly to reach a target future value.";
    if (mode === 'RATE') goalContext += "The user wants to find the required interest rate to reach a target goal.";
    if (mode === 'TIME') goalContext += "The user wants to know how long it will take to reach a financial goal.";
    if (mode === 'FV') goalContext += "The user is projecting the future value of their current investment.";

    const prompt = `
      Analyze the following investment scenario in ${currency}:
      ${goalContext}
      
      Parameters:
      - Initial Principal: ${formatCurrency(params.principal, currency)}
      - Recurring Contribution: ${formatCurrency(params.contribution, currency)} per period
      - Annual Rate: ${formatNumber(params.rate)}%
      - Time Period: ${formatNumber(params.years)} years
      - Frequency: ${params.compoundsPerYear} times/year
      - Inflation Rate: ${params.inflationRate || 0}%
      
      Outcomes:
      - Future Value (Nominal): ${formatCurrency(results.futureValue, currency)}
      - Future Value (Real/Adjusted for Inflation): ${formatCurrency(results.futureValueReal, currency)}
      - Total Interest Earned: ${formatCurrency(results.totalInterest, currency)}
      
      Please provide a concise analysis. 
      ${goalName ? `Refer to the goal "${goalName}" in your advice.` : ''}
      ${mode === 'TIME' ? 'Comment specifically on the duration timeframe.' : ''}
      ${mode === 'PMT' ? 'Comment on the feasibility of the required contribution amount.' : ''}
      ${mode === 'RATE' ? 'Comment on the feasibility of finding an investment with this return rate.' : ''}
      Explain the role of compound interest, specifically mentioning the impact of regular contributions if applicable, and how inflation affects the purchasing power.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: getSystemInstruction(),
        temperature: 0.7,
      },
    });

    return response.text || "No insights generated.";
  } catch (error) {
    console.error("Error generating insights:", error);
    return "Sorry, I couldn't generate the insights at this moment. Please try again later.";
  }
};
