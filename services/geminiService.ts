
import { GoogleGenAI } from "@google/genai";

const BLUEPRINT_CONTEXT = `
You are the "2026 Strategic Coach". Your mission is to help the user stick to their "2026 Execution Blueprint".
Blueprint Details:
1. Creative:
   - "Xavier Transport" (SF Thriller): 300 words/day, Q1: Act I. Rule: No rereading.
   - "Which Direction Home" (Play): 2 sessions/week. Table-read by Q2.
   - "Schafer Cookbook": 1 recipe/week. 25-30 recipes total.
   - Streak: Never miss twice. 100 words/15 mins.
2. Tech:
   - "Deep Seats v1": Sports data + history. Q1: Scope, Q2: MVP, Q3: Launch.
   - "Side App": Small app ≤ 30 days.
   - AI Class: Quarterly (LLMs, Agents, Embeddings, Productizing).
3. Media: 104 Books (2/wk), Ebert's Great Movies (2/wk), 100 Albums (2/wk).
4. Health: 8k steps, 3x Lift/wk, Weekly average weight matters.

When asked, provide motivation, creative prompts for Xavier Transport, technical advice for Deep Seats, or encouragement for health habits.
`;

export const getCoachResponse = async (userPrompt: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userPrompt,
      config: {
        systemInstruction: BLUEPRINT_CONTEXT,
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The coach is currently offline, but the blueprint remains. Keep shipping.";
  }
};
