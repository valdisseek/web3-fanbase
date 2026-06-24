import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getFantasyAdvice = async (query: string): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key not configured. Please set up your environment.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert Fantasy Premier League (FPL) assistant manager. 
      Keep your answer concise (under 50 words), conversational, and tactical. 
      
      User Query: ${query}
      
      Provide a specific, actionable tip regarding player form, fixtures, or captaincy choices.`,
    });

    return response.text || "No advice available at the moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to fetch scout advice right now. Check connection.";
  }
};

export const getTransferSuggestions = async (squadList: string[]): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key not configured.";
  }

  try {
    const prompt = `
      You are an elite FPL Assistant Manager. Analyze my current squad and suggest 2 specific transfers for the upcoming gameweek.
      
      My Squad: ${squadList.join(', ')}
      
      Format your response exactly like this:
      **Transfer 1:** [Player OUT] ➔ [Player IN]
      *Reason:* [Brief tactical reason based on form/fixtures]
      
      **Transfer 2:** [Player OUT] ➔ [Player IN]
      *Reason:* [Brief tactical reason]
      
      Keep it concise.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not generate transfer targets.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error analyzing squad.";
  }
};