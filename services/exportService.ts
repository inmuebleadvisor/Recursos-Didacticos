import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, HeadingLevel, AlignmentType, Header } from "docx";
import FileSaver from "file-saver";
import { FormData } from "../types";
import { generateMetadata } from "./geminiService";

// ÚLTIMA MODIFICACION: 04/12/2025
// DESCRIPCIÓN: Servicio para exportar datos. Gestiona la conexión con Google Sheets y la generación del comprobante en Word.

// --- CONFIGURACIÓN DE CONEXIÓN ---
// MODIFICACIÓN: Se utiliza la variable de entorno para seguridad. 
// Si no encuentra la variable (ej. en desarrollo local sin .env), usa una cadena vacía para evitar errores de compilación, 
// aunque se valida más adelante.
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || "";

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
 * NUEVA FUNCIÓN: Envío de datos a Google Sheets
 * Esta función toma los datos del formulario y los envía a tu Web App de Google.
 */
const saveToGoogleSheets = async (data: FormData, aiMeta: { keywords: string[], header: string }) => {
  
  // Verificación de seguridad: Si no hay URL configurada, advertimos.
  if (!GOOGLE_SCRIPT_URL) {
      console.error("FALTA CONFIGURACIÓN: No se encontró la URL del Script en el archivo .env");
      alert("Error de configuración: No se pudo conectar con el servidor. Verifica tu archivo .env.");
      return false;
  }

  // 1. Preparamos el "Paquete" de datos (Payload)
  // Las claves coinciden con las que espera tu función doPost en Google Apps Script.
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
    // 2. Enviamos el paquete usando 'fetch'
    // 'no-cors' permite enviar datos a Google sin que el navegador bloquee la solicitud por seguridad estricta.
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
    });
    
    console.log("Datos enviados a Google Sheets correctamente");
    return true;

  } catch (error) {
    console.error("Error al enviar a Google Sheets:", error);
    alert("Hubo un error de conexión con la nube, pero se descargará tu respaldo en Word.");
    return false;
  }
};

/**
 * FUNCIÓN PRINCIPAL EXPORTADA
 * Orquesta todo el proceso: IA -> Nube -> Word
 */
export const handleExports = async (data: FormData, logoUrl: string) => {
    // 1. Generar Metadatos con Inteligencia Artificial
    const meta = await generateMetadata(data);
    
    // 2. Guardar en la base de datos (Google Sheets)
    await saveToGoogleSheets(data, meta);

    // 3. Generar y descargar comprobante en Word
    await createWordDocument(data);
};