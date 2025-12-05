export enum Zone {
  Z01 = "Zona 01",
  Z02 = "Zona 02",
  Z03 = "Zona 03",
  Z04 = "Zona 04",
  Z05 = "Zona 05"
}

export enum Semestre {
  FIRST = "Primero",
  SECOND = "Segundo",
  THIRD = "Tercero",
  FOURTH = "Cuarto",
  FIFTH = "Quinto",
  SIXTH = "Sexto"
}

export enum CollabCount {
  ONE = "1",
  TWO = "2"
}

export interface FormData {
  zona: string;
  planteles: string[];
  titulo: string;
  tipoRecurso: string; // Link o tipo
  descripcion: string;
  numColaboradores: CollabCount;
  // Colaborador 1 (Author default if 1)
  rol1: string;
  nombre1: string;
  // Colaborador 2 (Only if count is 2)
  rol2: string;
  nombre2: string;
  
  tipoRecursoEducativo: string;
  categoria: string;
  objetivo: string;
  semestre: string;
  asignatura: string;
  tema: string;
}

export interface Plantel {
  id: string;
  name: string;
}

export const INITIAL_DATA: FormData = {
  zona: "",
  planteles: [],
  titulo: "",
  tipoRecurso: "",
  descripcion: "",
  numColaboradores: CollabCount.ONE,
  rol1: "Autor",
  nombre1: "",
  rol2: "",
  nombre2: "",
  tipoRecursoEducativo: "",
  categoria: "",
  objetivo: "",
  semestre: "",
  asignatura: "",
  tema: ""
};

export interface ExcelRow {
  number: number;
  titulo: string;
  link: string;
  descripcion: string;
  keyword1: string;
  keyword2: string;
  keyword3: string;
  responsabilidad: string;
  tipoEducativo: string;
  categoria: string;
  usoEducativo: string;
  encabezados: string;
  semestre: string;
  asignatura: string;
}