import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, HeadingLevel, AlignmentType, Header } from "docx";
import FileSaver from "file-saver";
import { FormData } from "../types";
import { generateMetadata } from "./geminiService";

// ÚLTIMA MODIFICACION: 05/12/2025
// DESCRIPCIÓN: Servicio para exportar datos. 
// APLICACIÓN DE PARCHE DE SEGURIDAD: Se elimina la variable GOOGLE_SCRIPT_URL del frontend 
// y se utiliza un proxy seguro en el backend (/api/save-resource).
// El frontend solo se comunica con su propio servidor, protegiendo así la llave secreta.

// --- CONFIGURACIÓN DE CONEXIÓN SEGURA ---
// Usamos la URL relativa para comunicarnos con nuestro propio backend (Vercel Serverless Function).
const API_URL = "/api"; 
// NOTA DIDÁCTICA: Eliminamos la constante GOOGLE_SCRIPT_URL de aquí, ya que el backend la usará.

/**
 * Función auxiliar para crear el documento de Word (Comprobante).
 * Mantenemos esto igual para que el usuario tenga un respaldo físico con el diseño corporativo.
 */
const createWordDocument = async (data: FormData) => {
  // Definición de estilos corporativos (colores y fuentes)
  const greenColor = "006847";
  const burgundyColor = "802434";
  const fontFace = "Georgia";
  const fontSize = 20; // En Word, 20 half-points equivalen a 10pt

  // Helper didáctico: Función para crear filas de la tabla de forma limpia y repetible
  const createRow = (label: string, value: string) => {
    return new TableRow({
      children: [
        // Celda de la etiqueta (Izquierda, fondo verde claro)
        new TableCell({
          width: { size: 30, type: WidthType.PERCENTAGE },
          shading: { fill: "f0fdf4" }, 
          children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, color: greenColor, font: fontFace, size: fontSize })] })],
          verticalAlign: "center",
          margins: { top: 100, bottom: 100, left: 100, right: 100 },
        }),
        // Celda del valor (Derecha)
        new TableCell({
          width: { size: 70, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: value, font: fontFace, size: fontSize })] })],
          verticalAlign: "center",
           margins: { top: 100, bottom: 100, left: 100, right: 100 },
        }),
      ],
    });
  };

  // Formateamos los colaboradores dependiendo de si es 1 o 2
  const collaborators = data.numColaboradores === "1" 
    ? `${data.rol1}: ${data.nombre1}` 
    : `${data.rol1}: ${data.nombre1}\n${data.rol2}: ${data.nombre2}`;

  // Construcción de la tabla principal con bordes y estilos definidos
  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: greenColor },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: greenColor },
        left: { style: BorderStyle.SINGLE, size: 1, color: greenColor },
        right: { style: BorderStyle.SINGLE, size: 1, color: greenColor },
        insideHorizontal: { style: BorderStyle.DOTTED, size: 1, color: "aaaaaa" },
        insideVertical: { style: BorderStyle.SINGLE, size: 1, color: greenColor },
    },
    rows: [
      createRow("Zona Educativa", data.zona),
      createRow("Plantel(es)", data.planteles.join(", ")),
      createRow("Título del Recurso", data.titulo),
      createRow("Link / Tipo", data.tipoRecurso),
      createRow("Descripción", data.descripcion),
      createRow("Colaboradores", collaborators),
      createRow("Tipo de Recurso Educativo", data.tipoRecursoEducativo),
      createRow("Categoría", data.categoria),
      createRow("Objetivo", data.objetivo),
      createRow("Semestre", data.semestre),
      createRow("Asignatura", data.asignatura),
      createRow("Tema(s) Central(es)", data.tema),
    ],
  });

  // Estructura del documento final (Encabezado y cuerpo)
  const doc = new Document({
    sections: [
      {
        properties: {},
        headers: {
            default: new Header({
                children: [
                    new Paragraph({
                        text: "Dirección Académica - Registro Digital",
                        alignment: AlignmentType.RIGHT,
                        border: { bottom: { style: BorderStyle.SINGLE, size: 6, space: 1, color: burgundyColor } },
                        children: [new TextRun({ font: fontFace, size: fontSize, color: "54565A" })]
                    })
                ]
            })
        },
        children: [
          new Paragraph({
            children: [
                new TextRun({ 
                    text: data.titulo, 
                    bold: true, 
                    color: "000000", 
                    font: fontFace,
                    size: 28 
                })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 300, before: 300 },
          }),
          table,
          new Paragraph({
             children: [
                 new TextRun({ 
                     text: "Este documento sirve como comprobante de tu registro en el sistema central.",
                     font: fontFace,
                     size: 16, 
                     italics: true,
                     color: "888888"
                 })
             ],
             alignment: AlignmentType.CENTER,
             spacing: { before: 500 },
          })
        ],
      },
    ],
  });

  // Generamos el archivo blob y forzamos la descarga
  const blob = await Packer.toBlob(doc);
  const saveAs = (FileSaver as any).saveAs || FileSaver;
  saveAs(blob, `Registro_${data.titulo.substring(0, 15)}.docx`);
};

/**
 * FUNCIÓN CRÍTICA DE SEGURIDAD: Envío de datos al proxy de Google Sheets
 * Esta función ahora llama a NUESTRA propia API Serverless (/api/save-resource).
 * El backend (api/index.js) es quien tiene el secreto (GOOGLE_SCRIPT_URL) y hace el envío final.
 */
const saveToGoogleSheets = async (data: FormData, aiMeta: { keywords: string[], header: string }) => {
  
  // No necesitamos la URL aquí, el proxy del servidor la manejará.

  // 1. Preparamos el "Paquete" de datos (Payload)
  // Enviamos todo el payload que el servidor necesita para reenviar a Google Apps Script.
  const payload = {
    titulo: data.titulo,
    linkTipo: data.tipoRecurso, // Mapeo: Link del recurso
    descripcion: data.descripcion,
    palabraClave1: aiMeta.keywords[0] || "",
    palabraClave2: aiMeta.keywords[1] || "",
    palabraClave3: aiMeta.keywords[2] || "",
    responsabilidad: data.numColaboradores === "1" 
        ? `${data.rol1}: ${data.nombre1}` 
        : `${data.rol1}: ${data.nombre1}; ${data.rol2}: ${data.nombre2}`,
    tipoRecurso: data.tipoRecursoEducativo, // Mapeo: Tipo educativo (Experiencia, Herramienta, etc.)
    categoria: data.categoria,
    usoEducativo: data.objetivo,
    encabezados: aiMeta.header,
    semestre: data.semestre,
    asignatura: data.asignatura
  };

  try {
    // 2. Enviamos el paquete al PROXY seguro de nuestro backend
    const response = await fetch(`${API_URL}/save-resource`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        // CAMBIO IMPORTANTE: Enviamos JSON estándar, que es lo que espera el proxy de Express/Vercel
        "Content-Type": "application/json", 
      },
    });
    
    // Si el servidor proxy nos responde que no fue exitoso (ej. 500 Internal Server Error)
    if (!response.ok) {
        throw new Error(`Error en el servidor proxy: ${response.statusText}`);
    }

    console.log("Datos enviados al servidor proxy correctamente");
    return true;

  } catch (error) {
    console.error("Error al enviar al proxy:", error);
    // Mensaje de fallback al usuario, ya que la comunicación con el servidor falló
    alert("Hubo un error de conexión con el servidor de la nube, pero se descargará tu respaldo en Word.");
    return false;
  }
};

/**
 * FUNCIÓN PRINCIPAL EXPORTADA
 * Orquesta todo el proceso: IA -> Nube (vía Proxy) -> Word
 */
export const handleExports = async (data: FormData, logoUrl: string) => {
    // 1. Generar Metadatos con Inteligencia Artificial
    const meta = await generateMetadata(data);
    
    // 2. Guardar en la base de datos (Google Sheets) vía el proxy seguro
    await saveToGoogleSheets(data, meta);

    // 3. Generar y descargar comprobante en Word
    await createWordDocument(data);
};