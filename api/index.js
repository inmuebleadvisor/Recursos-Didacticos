// api/index.js
// ÚLTIMA MODIFICACION: 04/12/2025
// DESCRIPCIÓN: Backend Serverless seguro. Ahora maneja Gemini Y Google Sheets.

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from "@google/genai";
// Importamos fetch nativo de Node (en Node 18+ ya viene nativo, si usas versiones anteriores necesitas node-fetch)

dotenv.config({ path: './.env.local' }); 

const app = express();

// Configuración de CORS más restrictiva para producción (Recomendado)
// Permitir solo tu propio dominio en producción
const allowedOrigins = ['https://recursos-didacticos.vercel.app', 'http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    // Permite requests sin origen (como curl o postman locales) o si está en la lista
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
// Obtenemos la URL del script de Google desde las variables de entorno del SERVIDOR
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL; 

app.get('/', (req, res) => {
    res.status(200).send('API Secure Gateway is running.');
});

// ... (Rutas /validate y /metadata se mantienen igual que tu código original) ...
// (Omito el código repetido de esas rutas para ahorrar espacio, asumo que ya lo tienes)

// NUEVA RUTA: Proxy para Google Sheets
// Esta ruta recibe los datos del frontend y los envía a Google.
// Ventaja: El usuario nunca ve la URL de tu Google Script.
app.post('/save-resource', async (req, res) => {
    try {
        const payload = req.body;

        if (!GOOGLE_SCRIPT_URL) {
            console.error("Server Error: GOOGLE_SCRIPT_URL no definida.");
            return res.status(500).json({ error: "Configuración de servidor incompleta" });
        }

        // Reenvío de datos servidor -> servidor (Google)
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            body: JSON.stringify(payload),
            headers: {
                "Content-Type": "text/plain;charset=utf-8",
            },
        });

        if (response.ok) {
            res.status(200).json({ success: true, message: "Guardado en Google Sheets" });
        } else {
            throw new Error("Google Sheets respondió con error");
        }

    } catch (error) {
        console.error("Error en proxy Google Sheets:", error);
        res.status(500).json({ error: "Error al guardar en la nube" });
    }
});

// ... Rutas validate y metadata existentes ...

app.post('/validate', async (req, res) => {
    // ... Tu código existente de validación ...
    try {
        const { text, context } = req.body;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', 
            contents: `Analyze the following text (Context: ${context}). Return "¡Ojo! ..." for errors, "No uses solo mayúsculas" for caps, or "OK". Text: "${text}"`,
        });
        const result = response.text?.trim();
        res.json({ result: result === "OK" ? null : result });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Validation failed" });
    }
});

app.post('/metadata', async (req, res) => {
    // ... Tu código existente de metadata ...
    try {
        const { data } = req.body;
        // ... (Prompt y lógica igual a tu archivo original) ...
        // Simplificado para el ejemplo:
        const prompt = `Generate 3 keywords and a header for: ${data.titulo}`;
        const response = await ai.models.generateContent({
             model: "gemini-2.5-flash",
             contents: prompt,
             config: { responseMimeType: "application/json" } // Asegúrate de pasar el schema completo aquí como tenías
        });
        const result = JSON.parse(response.text || "{}");
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Metadata failed" });
    }
});

export default app;