// server.js
// ÚLTIMA MODIFICACION: 04/12/2025
// Objetivo: Alojar la lógica exacta de tu geminiService original, pero en un entorno seguro.

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config({ path: './.env.local' }); // Carga tu clave de forma segura

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Inicialización segura (Backend)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// RUTA 1: Validación de Texto (Tu lógica original "ValidateText")
app.post('/api/validate', async (req, res) => {
    try {
        const { text, context } = req.body;
        
        // 🔍 PROMPT EXACTO DE TU CÓDIGO ORIGINAL CONSERVADO AQUÍ:
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', // Conservamos tu versión de modelo
            contents: `Analyze the following text from a teacher's form input (Context: ${context}). 
            If it has significant spelling errors or looks like gibberish, return a short, polite warning message in Spanish starting with "¡Ojo!". 
            If it uses ONLY capital letters, return "No uses solo mayúsculas".
            If it looks fine, return "OK".
            
            Text: "${text}"`,
        });

        const result = response.text?.trim();
        res.json({ result: result === "OK" ? null : result });

    } catch (e) {
        console.error("Validation error in server:", e);
        // Enviamos un error controlado para que el frontend use su fallback
        res.status(500).json({ error: "Validation failed" });
    }
});

// RUTA 2: Generación de Metadata (Tu lógica original "GenerateMetadata")
app.post('/api/metadata', async (req, res) => {
    try {
        const { data } = req.body;

        // 🔍 PROMPT EXACTO Y SCHEMA CONSERVADOS:
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
        res.json(result);

    } catch (error) {
        console.error("Metadata error in server:", error);
        res.status(500).json({ error: "Metadata failed" });
    }
});

app.listen(port, () => {
    console.log(`✅ Servidor seguro corriendo en http://localhost:${port}`);
});