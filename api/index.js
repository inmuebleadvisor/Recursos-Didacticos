// api/index.js
// ÚLTIMA MODIFICACION: 05/12/2025
// DESCRIPCIÓN: Backend Serverless seguro con validación, protección de headers y Rate Limiting.
// NOTA DIDÁCTICA: Implementamos el limitador de peticiones para proteger tu cuota de Gemini y tu base de datos de abusos.

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from "@google/genai";
import rateLimit from 'express-rate-limit'; // 🔍 Paso 1: Importamos la librería de limitación

// Cargar variables de entorno
dotenv.config({ path: './.env.local' });

const app = express();

// 1. SEGURIDAD: Lista blanca de orígenes permitidos
const allowedOrigins = [
  'https://recursos-didacticos.vercel.app', 
  'http://localhost:3000', // Para desarrollo local
  'http://localhost:5173'  // Vite por defecto usa 5173, lo agrego por si acaso
];

// 2. SEGURIDAD: Configuración CORS
app.use(cors({
  origin: function (origin, callback) {
    // Permitimos requests sin origen (como mobile apps o curl) Y los de la lista blanca
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado por CORS: Origen no permitido'));
    }
  },
  methods: ['POST', 'GET', 'OPTIONS'], // Solo permitimos estos métodos
  allowedHeaders: ['Content-Type']
}));

// 3. SEGURIDAD: Limitar el tamaño del body para evitar ataques de denegación de servicio (DoS) por payload gigante
app.use(express.json({ limit: '10kb' })); 

// Inicialización de Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

// --- 🛡️ CONFIGURACIÓN DE RATE LIMITING ---
// Didáctico: Este middleware limita las peticiones de una misma IP.
// Es crucial para proteger tu cuota de Gemini y tu base de datos.

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // La ventana de tiempo es de 15 minutos (900,000 milisegundos)
  max: 100, // Límite de 100 peticiones dentro de esa ventana por cada IP.
  standardHeaders: true, // Incluye headers estándar de límite (RateLimit-Limit, RateLimit-Remaining)
  legacyHeaders: false, // Deshabilita headers X-RateLimit-* antiguos
  message: (req, res) => {
    // Mensaje personalizado en español que se envía al usuario si excede el límite (código 429)
    res.status(429).json({ 
        error: "Has excedido el límite de peticiones. Por favor, intenta de nuevo en 15 minutos." 
    });
  }
});

// --- FUNCIONES DE VALIDACIÓN (Didáctico: Nunca confíes en los datos que entran) ---

// Validamos que el objeto tenga los campos mínimos necesarios y que sean strings
const isValidResourcePayload = (data) => {
    if (!data) return false;
    // Lista de campos obligatorios que esperamos recibir
    const requiredFields = ['titulo', 'descripcion', 'responsabilidad'];
    
    // Verificamos que existan y sean cadenas de texto
    for (const field of requiredFields) {
        if (!data[field] || typeof data[field] !== 'string') {
            return false; 
        }
        // Validación extra: Evitar inyecciones de fórmulas de Excel (comienzan con =)
        if (data[field].startsWith('=')) {
             return false;
        }
    }
    return true;
};

app.get('/', (req, res) => {
    res.status(200).send('API Segura de COBAES activa.');
});

// RUTA: Proxy seguro para Google Sheets (APLICAMOS LIMITE)
// Didáctico: Solo se permite acceder 100 veces cada 15 minutos a esta ruta de guardado.
app.post('/save-resource', apiLimiter, async (req, res) => {
    try {
        const payload = req.body;

        // 4. SEGURIDAD: Verificación de Integridad antes de procesar
        if (!isValidResourcePayload(payload)) {
            console.warn("Intento de envío de datos inválidos o maliciosos.");
            return res.status(400).json({ error: "Datos inválidos o incompletos." });
        }

        if (!GOOGLE_SCRIPT_URL) {
            console.error("Server Error: GOOGLE_SCRIPT_URL no definida.");
            return res.status(500).json({ error: "Error de configuración del servidor." });
        }

        // Enviamos a Google Sheets
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

// RUTA: Validación de Texto con Gemini (APLICAMOS LIMITE)
// Didáctico: Limita las peticiones de validación que usan la IA para ahorrar recursos y costos.
app.post('/validate', apiLimiter, async (req, res) => {
    try {
        const { text, context } = req.body;
        
        // Validación simple de entrada
        if(!text || typeof text !== 'string' || text.length > 1000) {
             return res.status(400).json({ error: "Texto inválido o demasiado largo." });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', 
            // Prompt original conservado
            contents: `Analyze the following text (Context: ${context}). Return "¡Ojo! ..." for errors, "No uses solo mayúsculas" for caps, or "OK". Text: "${text}"`,
        });
        const result = response.text?.trim();
        res.json({ result: result === "OK" ? null : result });
    } catch (e) {
        console.error("Error validando texto:", e);
        res.status(500).json({ error: "Fallo en validación IA" });
    }
});

// RUTA: Generación de Metadata con Gemini (APLICAMOS LIMITE)
// Didáctico: Limita las peticiones de generación de metadatos, otra función costosa de IA.
app.post('/metadata', apiLimiter, async (req, res) => {
    try {
        const { data } = req.body;

        if (!data || !data.titulo) {
             return res.status(400).json({ error: "Datos insuficientes para generar metadata." });
        }

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
                // Esquema simplificado para asegurar estructura JSON
                responseSchema: {
                    type:  "OBJECT",
                    properties: {
                        keywords: { type: "ARRAY", items: { type: "STRING" } },
                        header: { type: "STRING" }
                    }
                }
             } 
        });
        
        const result = JSON.parse(response.text || "{}");
        res.json(result);
    } catch (error) {
        console.error("Error generando metadata:", error);
        res.status(500).json({ error: "Fallo en generación IA" });
    }
});

// Exportación por defecto para Vercel Serverless Functions
export default app;