import { Plantel, Zone, Semestre } from './types';

export const ZONES: Record<string, Plantel[]> = {
  [Zone.Z01]: [
    { id: "1", name: "1 - Profr. Marcial Ordóñez Ibáñez" },
    { id: "2", name: "2 - Profr. Braulio Pizarro Ceballos" },
    { id: "3", name: "3 - Profra. Velina León de Medina" },
    { id: "4", name: "4 - Profr. Víctor Manuel Rubio Ahumada" },
    { id: "5", name: "5 - Profra. Francisca Guerrero Hermosillo" },
    { id: "6", name: "6 - Ing. José Hernández Terán" },
    { id: "7", name: "7 - Gral. Pablo Macías Valenzuela" },
    { id: "8", name: "8 - Profr. José Rentería" },
    { id: "9", name: "9 - Gral. Benjamín Hill" },
    { id: "43", name: "43 - Profr. Miguel Castillo Cruz" },
    { id: "54", name: "54 - Profr. Jesús Llamas Ramírez" },
    { id: "57", name: "57 - Profr. Ignacio Martínez Gallegos" },
    { id: "58", name: "58 - Ing. Heriberto Valdez Romero" },
    { id: "64", name: "64 - Profra. Evangelina Félix Armenta" },
    { id: "114", name: "114 - Bolsa de Tosalibampo" },
    { id: "115", name: "115 - San José de Ahome" },
    { id: "117", name: "117 - Ejido Mochis" },
    { id: "118", name: "118 - Ejido 9 de Diciembre" },
    { id: "127", name: "127 - Alfonso G. Calderón Velarde" }
  ],
  [Zone.Z02]: [
    { id: "10", name: "10 - Ing. Federico Delgado Pastor" },
    { id: "11", name: "11 - Lic. Alejandro Ríos Espinoza" },
    { id: "12", name: "12 - Profr. José Santos Partida" },
    { id: "13", name: "13 - Lic. Eustaquio Buelna Pérez" },
    { id: "14", name: "14 - Profra. Ignacia Arrayales de Castro" },
    { id: "15", name: "15 - Lic. José G. Heredia" },
    { id: "44", name: "44 - Profra. Enriqueta Castillo Rodríguez" },
    { id: "47", name: "47 - Profr. Miguel C. Castro" },
    { id: "55", name: "55 - Lic. Raúl Cervantes Ahumada" },
    { id: "67", name: "67 - Centro de Estudios Ocoroni" },
    { id: "69", name: "69 - Hermes González Maldonado" },
    { id: "71", name: "71 - León Fonseca" }
  ],
  [Zone.Z03]: [
    { id: "16", name: "16 - Profr. Cipriano Obezo Camargo" },
    { id: "17", name: "17 - Profr. Gabriel Leyva Solano" },
    { id: "18", name: "18 - Lic. Héctor R. Olea Castaños" },
    { id: "19", name: "19 - Gral. Rafael Buelna Tenorio" },
    { id: "20", name: "20 - Profr. Jesús Manuel Ibarra Peiro" },
    { id: "21", name: "21 - Dr. Genaro Salazar Cuellar" },
    { id: "48", name: "48 - Agustina Ramírez" },
    { id: "49", name: "49 - Gral. Teófilo Álvarez Borboa" },
    { id: "56", name: "56 - Gral. Macario Gaxiola Urías" },
    { id: "59", name: "59 - Cristino C. Romo" }
  ],
  [Zone.Z04]: [
    { id: "22", name: "22 - Profr. Miguel Cristo Ontiveros Verne" },
    { id: "23", name: "23 - Profra. María Trinidad Dórame" },
    { id: "24", name: "24 - Gral. Emiliano Zapata" },
    { id: "25", name: "25 - Gral. Salvador Alvarado" },
    { id: "26", name: "26 - Gral. Ángel Flores" },
    { id: "27", name: "27 - Lic. Rodolfo Monjaraz Buelna" },
    { id: "28", name: "28 - Dr. Fernando Uriarte" },
    { id: "29", name: "29 - Profa. Agustina Achoy Guzmán" },
    { id: "30", name: "30 - Ing. Juan de Dios Bátiz" },
    { id: "31", name: "31 - Profra. Irma Garmendia Bazúa" },
    { id: "32", name: "32 - Profr. Higinio G. Maciel" },
    { id: "33", name: "33 - Dr. Rigoberto Aguilar Pico" },
    { id: "45", name: "45 - Profr. Alejandro Calderón Vergara" },
    { id: "46", name: "46 - Gral. Antonio Rosales" },
    { id: "60", name: "60 - Profra. Jesusita Neda" },
    { id: "61", name: "61 - Profr. Enrique Félix Castro" },
    { id: "62", name: "62 - Dr. Albino García Pérez" },
    { id: "63", name: "63 - Profra. Emilia Obeso López" },
    { id: "94", name: "94 - Profr. José Guadalupe García Hernández" },
    { id: "96", name: "96 - Leopoldo Sánchez Celis" },
    { id: "98", name: "98 - El Limón de los Ramos" },
    { id: "130", name: "130 - La Conquista" }
  ],
  [Zone.Z05]: [
    { id: "34", name: "34 - Nicolás T. Bernal" },
    { id: "35", name: "35 - Ignacio Ramírez" },
    { id: "36", name: "36 - José C. Valadés Rocha" },
    { id: "37", name: "37 - Gral. Genaro Estrada Félix" },
    { id: "38", name: "38 - Lic. Marco Antonio Arroyo Camberos" },
    { id: "39", name: "39 - Profr. José Romero Alzate" },
    { id: "40", name: "40 - Lic. Clemente Vizcarra Franco" },
    { id: "41", name: "41 - Pablo de Villavicencio" },
    { id: "42", name: "42 - Profr. Severiano M. Moreno" },
    { id: "50", name: "50 - Gral. Gabriel Leyva Velázquez" },
    { id: "51", name: "51 - Gral. Teófilo Noris" },
    { id: "52", name: "52 - Gilberto Owen" },
    { id: "53", name: "53 - Profra. Francisca López Jiménez" },
    { id: "65", name: "65 - El Pozole" },
    { id: "68", name: "68 - Centro de Estudios Palmillas" },
    { id: "70", name: "70 - Estación Dimas" },
    { id: "95", name: "95 - Las Mañanitas" }
  ]
};

export const SUBJECTS: Record<string, string[]> = {
  [Semestre.FIRST]: [
    "Lengua y comunicación I",
    "Inglés I",
    "Pensamiento matemático I",
    "Cultura digital I",
    "Ciencias Naturales, Experimentales y Tecnología I",
    "Pensamiento Filosófico Humanidades I",
    "Ciencias sociales I",
    "Laboratorio de investigación"
  ],
  [Semestre.SECOND]: [
    "Pensamiento matemático II",
    "Lengua y Comunicación II",
    "Ciencias Naturales, Experimentales y Tecnología II",
    "Ciencias Sociales II",
    "Pensamiento Filosófico y Humanidades II",
    "Cultura Digital II",
    "Inglés II",
    "Taller de Ciencias"
  ],
  [Semestre.THIRD]: [
    "Lengua y comunicación III",
    "Inglés III",
    "Pensamiento matemático III",
    "Ecosistemas: interacciones, energía y dinámica",
    "Humanidades III",
    "Taller de Ciencias II"
  ],
  [Semestre.FOURTH]: [
    "Inglés IV",
    "Temas selectos de matemáticas I",
    "Conciencia histórica I. Perspectivas del México antiguo en los contextos globales",
    "Taller de cultura digital",
    "Reacciones químicas: conservación de la materia en la formación de nuevas sustancias",
    "Espacio y sociedad",
    "Pensamiento literario",
    "Ciencias sociales III"
  ],
  [Semestre.FIFTH]: [
    "Conciencia histórica II. México durante el expansionismo capitalista",
    "La energía en los procesos de la vida diaria",
    "Salud Integral I",
    "Comunicación y sociedad I",
    "Derecho y sociedad I",
    "Pensamiento matemático aplicado a las finanzas I"
  ],
  [Semestre.SIXTH]: [
    "Temas selectos de matemáticas II",
    "Conciencia histórica III. La realidad actual en perspectiva histórica",
    "Organismos: estructuras y procesos. Herencia y evolución biológica",
    "Salud Integral II",
    "Comunicación y sociedad II",
    "Derecho y sociedad I y II",
    "Pensamiento matemático aplicado a las finanzas II"
  ]
};

export const ROLES = ["Autor", "Diseñador", "Editor"];

export const RESOURCE_TYPES = [
  "Experiencia interactiva de aprendizaje",
  "Herramienta",
  "Recurso informativo",
  "Secuencia didáctica"
];

export const CATEGORIES = [
  "Recurso para docente",
  "Recurso para estudiante",
  "Ambos"
];