// api/index.js
// ÚLTIMA MODIFICACION: 04/12/2025
// DESCRIPCIÓN: Adaptación del servidor Express para Vercel Serverless Functions.
// 1. Se elimina la llamada a 'app.listen' (Vercel maneja la ejecución).
// 2. La aplicación Express se exporta (export default app).
// 3. Se cambia el prefijo de las rutas de '/api/ruta' a '/ruta', ya que Vercel mapea el archivo 'api/index.js' al prefijo '/api'.

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from "@google/genai";

// Carga tu clave de forma segura (Importante para desarrollo local con 'vercel dev')
dotenv.config({ path: './.env.local' }); 

const app = express();
// NOTA DIDÁCTICA: Eliminamos la inicialización del puerto (app.listen) 
// y el console.log, ya que Vercel no corre un servidor persistente, 
// sino funciones bajo demanda.

app.use(cors());
app.use(express.json());

// Inicialización segura (Backend)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// RUTA DE PRUEBA: Vercel mapea esto a /api
app.get('/', (req, res) => {
    res.status(200).send('API is running. Use /api/validate or /api/metadata.');
});


// RUTA 1: Validación de Texto
// ANTES: app.post('/api/validate', ... )
// AHORA: Solo '/validate' porque el archivo está en la carpeta 'api' y Vercel agrega el prefijo.
app.post('/validate', async (req, res) => {
    try {
        const { text, context } = req.body;
        
        // 🔍 PROMPT EXACTO DE TU CÓDIGO ORIGINAL CONSERVADO AQUÍ:
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', 
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
        res.status(500).json({ error: "Validation failed" });
    }
});

// RUTA 2: Generación de Metadata
// ANTES: app.post('/api/metadata', ... )
// AHORA: Solo '/metadata'
app.post('/metadata', async (req, res) => {
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

// PUNTO CLAVE DIDÁCTICO: Exportamos la app. 
// En un servidor Node.js normal, usarías app.listen(). 
// En Vercel, exportas el objeto 'app' para que la plataforma lo use como la función Serverless.
export default app;