import { GoogleGenAI, Type } from "@google/genai";
import { FormData } from "../types";

// Helper to determine if text has likely spelling errors or valid structure
// Uses Gemini to be a "smart" validator.
export const validateText = async (text: string, context: string): Promise<string | null> => {
    if (!process.env.API_KEY) return null; // Skip if no key
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze the following text from a teacher's form input (Context: ${context}). 
            If it has significant spelling errors or looks like gibberish, return a short, polite warning message in Spanish starting with "¡Ojo!". 
            If it uses ONLY capital letters, return "No uses solo mayúsculas".
            If it looks fine, return "OK".
            
            Text: "${text}"`,
        });
        
        const result = response.text?.trim();
        return result === "OK" ? null : result;
    } catch (e) {
        console.error("Validation error", e);
        return null;
    }
}

export const generateMetadata = async (data: FormData): Promise<{ keywords: string[], header: string }> => {
  if (!process.env.API_KEY) {
    // Fallback if no API key
    return {
        keywords: [data.asignatura, data.semestre, "Bachillerato"],
        header: `Recurso sobre ${data.tema}`
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      Act as an educational data specialist for a High School (Bachillerato) system in Sinaloa, Mexico.
      Based on the following resource information, generate:
      1. Three specific single-word keywords (Palabras clave) related to the content.
      2. A short, professional header phrase (Encabezado) (max 5 words) describing the resource topic.

      Resource Info:
      Title: ${data.titulo}
      Description: ${data.descripcion}
      Subject: ${data.asignatura}
      Theme: ${data.tema}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            keywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Three single keywords",
            },
            header: {
              type: Type.STRING,
              description: "A short header phrase",
            },
          },
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    return {
        keywords: result.keywords || ["Educación", "COBAES", "Recurso"],
        header: result.header || "Recurso Didáctico Digital"
    };

  } catch (error) {
    console.error("Gemini Error:", error);
    return {
        keywords: [data.asignatura, "Didáctica", "Digital"],
        header: `Recurso: ${data.titulo}`
    };
  }
};