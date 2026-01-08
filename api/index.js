// api/index.js
// ÚLTIMA MODIFICACION: 05/12/2025
// DESCRIPCIÓN: Backend Serverless seguro. Se corrigen las rutas para incluir el prefijo '/api' 
// necesario para que coincidan con el rewrite de Vercel.

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from "@google/genai"; // Asegúrate de importar Type si lo usas en el Schema
import rateLimit from 'express-rate-limit';

// Cargar variables de entorno
dotenv.config({ path: './.env.local' });

const app = express();

// 1. SEGURIDAD: Lista blanca de orígenes permitidos
const allowedOrigins = [
  'https://recursos-didacticos.vercel.app',
  'http://localhost:3000', // Para desarrollo local
  'http://localhost:5173'  // Vite por defecto
];

// 2. SEGURIDAD: Configuración CORS
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.error(`[CORS-DEBUG] Bloqueando acceso desde: ${origin}`);
      callback(new Error(`Bloqueado por CORS. Origen no permitido: ${origin}`));
    }
  },
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// 3. SEGURIDAD: Limitar el tamaño del body
app.use(express.json({ limit: '10kb' }));

// Inicialización de Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

// --- RATE LIMITING ---
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: (req, res) => {
    res.status(429).json({
      error: "Has excedido el límite de peticiones. Por favor, intenta de nuevo en 15 minutos."
    });
  }
});

// Validación de payload
const isValidResourcePayload = (data) => {
  if (!data) return false;
  const requiredFields = ['titulo', 'descripcion', 'responsabilidad'];
  for (const field of requiredFields) {
    if (!data[field] || typeof data[field] !== 'string') return false;
    if (data[field].startsWith('=')) return false;
  }
  return true;
};

// --- RUTAS (CORREGIDAS CON PREFIJO /api) ---

app.get('/api', (req, res) => {
  res.status(200).send('API Segura de COBAES activa.');
});

// RUTA 1: Proxy a Google Sheets
// AHORA ESCUCHA EN '/api/save-resource'
app.post('/api/save-resource', apiLimiter, async (req, res) => {
  try {
    const payload = req.body;

    if (!isValidResourcePayload(payload)) {
      return res.status(400).json({ error: "Datos inválidos o incompletos." });
    }

    if (!GOOGLE_SCRIPT_URL) {
      console.error("Server Error: GOOGLE_SCRIPT_URL no definida.");
      return res.status(500).json({ error: "Error de configuración del servidor." });
    }

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "text/plain;charset=utf-8" },
    });

    if (response.ok) {
      res.status(200).json({ success: true, message: "Guardado exitosamente." });
    } else {
      throw new Error("Google Sheets rechazó la conexión.");
    }

  } catch (error) {
    console.error("Error en proxy:", error);
    res.status(500).json({ error: "Error interno al guardar." });
  }
});

// RUTA 2: Validación de Texto
// AHORA ESCUCHA EN '/api/validate'
app.post('/api/validate', apiLimiter, async (req, res) => {
  try {
    const { text, context } = req.body;

    if (!text || typeof text !== 'string' || text.length > 1000) {
      return res.status(400).json({ error: "Texto inválido o demasiado largo." });
    }

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
    console.error("Error validando texto:", e);
    res.status(500).json({ error: "Fallo en validación IA" });
  }
});

// RUTA 3: Metadata
// AHORA ESCUCHA EN '/api/metadata'
app.post('/api/metadata', apiLimiter, async (req, res) => {
  try {
    const { data } = req.body;

    if (!data || !data.titulo) {
      return res.status(400).json({ error: "Datos insuficientes." });
    }

    // Schema explícito para Gemini
    const schema = {
      type: Type.OBJECT,
      properties: {
        keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Three single keywords" },
        header: { type: Type.STRING, description: "A short header phrase" }
      }
    };

    const prompt = `
          Act as an educational data specialist.
          Based on: Title: ${data.titulo}, Description: ${data.descripcion}, Subject: ${data.asignatura}.
          Generate JSON with: keywords (array of 3 strings), header (string max 5 words).
        `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);

  } catch (error) {
    console.error("Error generando metadata:", error);
    res.status(500).json({ error: "Fallo en generación IA" });
  }
});

export default app;