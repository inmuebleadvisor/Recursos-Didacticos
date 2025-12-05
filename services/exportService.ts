import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, HeadingLevel, AlignmentType, Header } from "docx";
import * as XLSX from "xlsx";
import FileSaver from "file-saver";
import { FormData, ExcelRow } from "../types";
import { generateMetadata } from "./geminiService";

// Helper to create the Word document
const createWordDocument = async (data: FormData) => {
  // Define styles
  const greenColor = "006847";
  const burgundyColor = "802434";
  const fontFace = "Georgia";
  const fontSize = 20; // 20 half-points = 10pt

  // Create table rows for Q&A
  const createRow = (label: string, value: string) => {
    return new TableRow({
      children: [
        new TableCell({
          width: { size: 30, type: WidthType.PERCENTAGE },
          shading: { fill: "f0fdf4" }, // Light green bg
          children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, color: greenColor, font: fontFace, size: fontSize })] })],
          verticalAlign: "center",
          margins: { top: 100, bottom: 100, left: 100, right: 100 },
        }),
        new TableCell({
          width: { size: 70, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: value, font: fontFace, size: fontSize })] })],
          verticalAlign: "center",
           margins: { top: 100, bottom: 100, left: 100, right: 100 },
        }),
      ],
    });
  };

  const collaborators = data.numColaboradores === "1" 
    ? `${data.rol1}: ${data.nombre1}` 
    : `${data.rol1}: ${data.nombre1}\n${data.rol2}: ${data.nombre2}`;

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

  const doc = new Document({
    sections: [
      {
        properties: {},
        headers: {
            default: new Header({
                children: [
                    // Removed Image as requested
                    new Paragraph({
                        text: "Dirección Académica",
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
                    color: "000000", // Black Title
                    font: fontFace,
                    size: 28 // Slightly larger for title (14pt)
                })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 300, before: 300 },
          }),
          table,
          new Paragraph({
             children: [
                 new TextRun({ 
                     text: "Generado automáticamente por el Sistema de Registro de Recursos.",
                     font: fontFace,
                     size: 16, // 8pt
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

  const blob = await Packer.toBlob(doc);
  const saveAs = (FileSaver as any).saveAs || FileSaver;
  saveAs(blob, `${data.titulo}.docx`);
};

// Helper to create Excel
const createExcel = (data: FormData, aiMeta: { keywords: string[], header: string }) => {
  const row: ExcelRow = {
    number: 1,
    titulo: data.titulo,
    link: data.tipoRecurso,
    descripcion: data.descripcion,
    keyword1: aiMeta.keywords[0] || "",
    keyword2: aiMeta.keywords[1] || "",
    keyword3: aiMeta.keywords[2] || "",
    responsabilidad: data.numColaboradores === "1" 
        ? `${data.rol1}: ${data.nombre1}` 
        : `${data.rol1}: ${data.nombre1}; ${data.rol2}: ${data.nombre2}`,
    tipoEducativo: data.tipoRecursoEducativo,
    categoria: data.categoria,
    usoEducativo: data.objetivo,
    encabezados: aiMeta.header,
    semestre: data.semestre,
    asignatura: data.asignatura
  };

  // Define headers as per prompt instructions
  const headers = [
      "Número", "Título del recurso", "Link o tipo de recurso", "Descripción", 
      "Palabra clave (1)", "Palabra clave (2)", "Palabras clave (3)", 
      "Mención de responsabilidad", "Tipo de recurso educativo", "Categoría", 
      "Descripción del uso educativo (objetivo)", "Encabezados", "Semestre", "Asignatura"
  ];
  
  const values = [
      row.number, row.titulo, row.link, row.descripcion, 
      row.keyword1, row.keyword2, row.keyword3, 
      row.responsabilidad, row.tipoEducativo, row.categoria,
      row.usoEducativo, row.encabezados, row.semestre, row.asignatura
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, values]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Recursos");
  XLSX.writeFile(wb, "Registro_Recursos.xlsx");
};

export const handleExports = async (data: FormData, logoUrl: string) => {
    // 1. Generate Metadata with Gemini
    const meta = await generateMetadata(data);
    
    // 2. Export Word
    await createWordDocument(data);

    // 3. Export Excel
    createExcel(data, meta);
};