// services/geminiService.ts
// ÚLTIMA MODIFICACION: 04/12/2025
// DESCRIPCIÓN: Se ajusta la URL del API para ser una ruta relativa.
// Esto permite que el frontend se comunique con la función serverless '/api' de Vercel.

import { FormData } from "../types";

// MODIFICACIÓN PARA VERCEL: Se elimina la URL completa de localhost.
// En Vercel, la URL base del API es el mismo dominio + /api.
// Si deseas seguir usando 'npm run dev' con el servidor Express local, esta configuración fallará.
// Se recomienda usar el comando 'vercel dev' para simular el entorno de producción localmente.
const API_URL = "/api"; 

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
        return null; 
    }
}

export const generateMetadata = async (data: FormData): Promise<{ keywords: string[], header: string }> => {
  // Intentamos conectar con el servidor seguro
  try {
    const response = await fetch(`${API_URL}/metadata`, { // Se usa la nueva ruta base '/api'
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