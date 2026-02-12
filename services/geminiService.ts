
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateStoryDraft = async (rawInput: string, lang: 'en' | 'de') => {
  const isEn = lang === 'en';
  
  const systemInstruction = isEn 
    ? `Help a user create an EMOTIONAL narrative outline for a family tribute video. 
       Focus on: Storytelling, emotions, heart, and legacy. 
       Structure: 3-4 sentence warm intro, 3 emotional chapters, and a sensory question.`
    : `Helfen Sie einem Benutzer, einen STRUKTURIERTEN Entwurf für ein Lebensgeschichten-Video zu erstellen. 
       Fokus auf: Chronologie, Meilensteine, Werte und sachliche Würde. 
       Struktur: 3-4 Sätze würdevolle Einleitung, 3 chronologische Kapitel, und eine präzise biografische Frage.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `${systemInstruction} Input: "${rawInput}". Respond in ${isEn ? 'US English' : 'German'}. No AI mentions.`,
      config: {
        temperature: 0.75,
        topP: 0.95,
      }
    });

    if (!response || !response.text) {
      throw new Error("Empty response received from Gemini API");
    }

    return response.text;
  } catch (error) {
    console.error("Detailed error in generateStoryDraft:", error);
    if (error instanceof Error) {
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
    }
    throw error; // Re-throw so the UI can handle or report it
  }
};
