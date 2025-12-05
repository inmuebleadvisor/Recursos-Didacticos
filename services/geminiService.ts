// services/geminiService.ts
// ÚLTIMA MODIFICACION: 04/12/2025
// Este archivo conecta con tu server.js. Mantiene los fallbacks originales.

import { FormData } from "../types";

const API_URL = "http://localhost:3001/api";

export const validateText = async (text: string, context: string): Promise<string | null> => {
    try {
        const response = await fetch(`${API_URL}/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, context }),
        });

        if (!response.ok) throw new Error("Server error");

        const data = await response.json();
        return data.result;
    } catch (e) {
        console.error("Validation error (client fallback):", e);
        return null; // Comportamiento original: si falla, asume que está bien.
    }
}

export const generateMetadata = async (data: FormData): Promise<{ keywords: string[], header: string }> => {
  // Intentamos conectar con el servidor seguro
  try {
    const response = await fetch(`${API_URL}/metadata`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
    });

    if (!response.ok) throw new Error("Server error");

    const result = await response.json();
    
    // Devolvemos lo que mandó el servidor, o defaults seguros si viene vacío
    return {
        keywords: result.keywords || ["Educación", "COBAES", "Recurso"],
        header: result.header || "Recurso Didáctico Digital"
    };

  } catch (error) {
    console.error("Gemini Error (usando fallback local):", error);
    
    // 🛡️ RED DE SEGURIDAD ORIGINAL CONSERVADA
    // Si el servidor falla, usamos tu lógica original de fallback:
    return {
        keywords: [data.asignatura, "Didáctica", "Digital"],
        header: `Recurso: ${data.titulo}`
    };
  }
};