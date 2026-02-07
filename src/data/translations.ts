export interface ExperienceItem {
  id: string;
  title: string;
  period: string;
  company: string;
  iconName: string;
  labelPr: string;
  labelAe: string;
  fullHistory: { year: string; label: string; desc: string }[];
}

export interface TranslationData {
  export: string;
  lang: string;
  editing: string;
  color: string;
  effects: string;
  file: string;
  edit: string;
  sequence: string;
  marker: string;
  window: string;
  help: string;
  assets: string;
  items: string;
  name: string;
  mediaType: string;
  artisticProjects: string;
  backToBin: string;
  eduComp: string;
  workspaceTip: string;
  tipDesc: string;
  assetInventory: string;
  masterMetadata: string;
  playing: string;
  paused: string;
  techPipeline: string;
  genAiEngine: string;
  nodes: string;
  inspector: string;
  education_title: string;
  academicHistory: string;
  systemReady: string;
  rendering: string;
  gpuAccel: string;
  ae_warning_title: string;
  ae_warning_desc: string;
  cancel: string;
  download_pdf: string;
  pr_warning_title: string;
  pr_warning_desc: string;
  ignore: string;
  dr_warning_title: string;
  dr_warning_desc: string;
  follow_dr: string;
  job_title: string;
  layerLabel: string;
  nodeInput: string;
  nodeBalance: string;
  nodeGrading: string;
  nodeAiTech: string;
  statusDone: string;
  statusReady: string;
  sourceFile: string;
  statusLabel: string;
  outputPath: string;
  startProcessing: string;
  soft_skills: {
    english: string;
    creativity: string;
    team: string;
    comm: string;
    adapt: string;
  };
  skill_levels: {
    weak: string;
    native: string;
    love: string;
    high: string;
    shifts: string;
  };
  phrases: string[];
  techSkills: { n: string; v: string }[];
  genAiModels: string[];
  exp_data: ExperienceItem[];
  edu_data: { year: string; label: string }[];
  art_data: ExperienceItem[];
}

export const translations: Record<string, TranslationData> = {
  es: {
    export: "Exportar",
    lang: "Idioma: ES",
    editing: "Edición",
    color: "Color",
    effects: "Efectos",
    file: "Archivo",
    edit: "Edición",
    sequence: "Secuencia",
    marker: "Marcador",
    window: "Ventana",
    help: "Ayuda",
    assets: "ACTIVOS",
    items: "ELEMENTOS",
    name: "Nombre",
    mediaType: "Tipo de Medio",
    artisticProjects: "Proyectos_Artísticos",
    backToBin: "Volver al Contenedor",
    eduComp: "Educación.comp",
    workspaceTip: "Consejo del Espacio de Trabajo",
    tipDesc: "Haz doble clic para cargar en el Monitor. Usa Exportar para contacto.",
    assetInventory: "Inventario de Activos",
    masterMetadata: "Metadatos Maestro",
    playing: "REPRODUCIENDO: TIEMPO REAL",
    paused: "PAUSADO: FUENTE",
    techPipeline: "Pipeline Tecnológico",
    genAiEngine: "Motor Gen-AI",
    nodes: "Nodos",
    inspector: "Inspector",
    education_title: "EDUCACIÓN_",
    academicHistory: "Historial Académico",
    systemReady: "SISTEMA LISTO",
    rendering: "RENDERIZANDO PROYECTO",
    gpuAccel: "Aceleración GPU: Mercury Engine (Metal)",
    ae_warning_title: "After Effects - Advertencia",
    ae_warning_desc: "¿Deseas descargar una copia del proyecto en formato PDF estándar? Se recomienda una versión clásica para archivo físico.",
    cancel: "Cancelar",
    download_pdf: "Descargar PDF",
    pr_warning_title: "Premiere Pro - Vinculación de Medios",
    pr_warning_desc: "El sistema ha detectado una versión PDF disponible. ¿Deseas vincular este medio para una lectura convencional?",
    ignore: "Ignorar",
    dr_warning_title: "Exportación de Proyecto Clásica",
    dr_warning_desc: "Esta versión interactiva ha sido etalonada para web. ¿Deseas descargar la versión master en PDF?",
    follow_dr: "Seguir en DaVinci Resolve",
    job_title: "Edición | Broadcast | IA",
    layerLabel: "Capa",
    nodeInput: "Entrada",
    nodeBalance: "Balance",
    nodeGrading: "Etalonaje",
    nodeAiTech: "IA_TECH",
    statusDone: "Hecho",
    statusReady: "Listo",
    sourceFile: "Archivo Origen",
    statusLabel: "Estado",
    outputPath: "Ruta de Salida",
    startProcessing: "Iniciar Procesamiento",
    soft_skills: {
      english: "Inglés_B1",
      creativity: "Creatividad",
      team: "Trabajo en equipo",
      comm: "Comunicación",
      adapt: "Adaptabilidad"
    },
    skill_levels: {
      weak: "No es mi fuerte",
      native: "Nativo",
      love: "Me encanta",
      high: "Alta",
      shifts: "Turnos Rotativos"
    },
    phrases: [
      "Sincronizando la precisión del broadcast con la magia del vídeo.",
      "Creatividad con base técnica.",
      "Audiovisual, técnico y digital en una sola persona.",
      "Donde se cruzan la imagen, la tecnología y la narrativa.",
      "Perfil híbrido para proyectos visuales complejos.",
      "Entiendo la imagen desde la cámara hasta el código.",
      "No solo creo vídeo. Entiendo cómo funciona."
    ],
    techSkills: [
      { n: "Adobe Premiere", v: "PRO" }, { n: "After Effects", v: "EXPERTO" },
      { n: "Resolve DaVinci", v: "MID" }, { n: "Avid Interplay", v: "MID" },
      { n: "Final Cut Pro X", v: "MID" }, { n: "Adobe Illustrator", v: "BÁSICO" }
    ],
    genAiModels: ["Sora", "Grok", "Gemini", "NotebookLM", "Lovable", "Kling"],
    exp_data: [
      {
        id: "motion", title: "Edición / Motion", period: "2014–25", company: "Wata Studio / Inmersive Creature",
        iconName: "Film", labelPr: "#D580A5", labelAe: "#B55A7E",
        fullHistory: [
          { year: "2025 - Actualidad", label: "Wata Studio", desc: "Realización de vídeos promocionales para RRSS, documentales y piezas audiovisuales." },
          { year: "2025", label: "Inmersive Creature", desc: "Edición y animación 2D con After Effects." },
          { year: "2024", label: "Plena Inclusión", desc: "Diseño y desarrollo de vídeo inclusivo en animación 2D con After Effects." }
        ]
      },
      {
        id: "broadcast", title: "Broadcast / MCR", period: "2007–25", company: "Prisa TV / Mediaset / Olympic / Movistar+ / TSA",
        iconName: "Radio", labelPr: "#5E7C9D", labelAe: "#4B7A50",
        fullHistory: [
          { year: "2025", label: "Telefónica TSA", desc: "Operadora de CCG N1 TV y OTT. Monitorado y gestión de alarmas." },
          { year: "2019-2024", label: "Beon Media", desc: "Content Operator MCR. Supervisión técnica y continuidad internacional, directos." },
          { year: "2018-2019", label: "Olympic Channel", desc: "Coordinadora de Medios - Sistemas y Flujos de Trabajo." },
          { year: "2016-2018", label: "Movistar +", desc: "Operadora de Verificación QC. Control de calidad de los contenidos." },
          { year: "2015-2018", label: "Mediaset", desc: "Técnica de emisión operadora de enlaces. Ingesta de Informativos Telecinco y Cuatro, Deportes." }
        ]
      },
      {
        id: "filmmaker", title: "Iluminación / Cámara / Edición", period: "2007–17", company: "Freelance / DSProducción",
        iconName: "Camera", labelPr: "#7B669D", labelAe: "#506B8A",
        fullHistory: [
          { year: "2013-2017", label: "DSProducciones", desc: "Cofundadora. Operadora de cámara e iluminación, edición y color." }
        ]
      }
    ],
    edu_data: [
      { year: "2025", label: "PROGRAMACIÓN EN DISEÑO WEB - ADALAB" },
      { year: "2022", label: "MÁSTER MOTION GRAPHICS - CICE" },
      { year: "2016", label: "LICENCIADA EN COMUNICACIÓN AUDIOVISUAL - UCM" },
      { year: "2007", label: "T.S. IMAGEN - IES PUERTA BONITA" }
    ],
    art_data: [
      { id: "reel", title: "Video Reel 2025", period: "Actual", company: "Tania Salvatella", iconName: "Play", labelPr: "#D580A5", labelAe: "#B55A7E", fullHistory: [{ year: "2025", label: "Showreel", desc: "Compilación de trabajos audiovisuales profesionales." }] }
    ]
  },
  en: {
    export: "Export",
    lang: "Lang: EN",
    editing: "Editing",
    color: "Color",
    effects: "Effects",
    file: "File",
    edit: "Edit",
    sequence: "Sequence",
    marker: "Marker",
    window: "Window",
    help: "Help",
    assets: "ASSETS",
    items: "ITEMS",
    name: "Name",
    mediaType: "Media Type",
    artisticProjects: "Artistic_Projects",
    backToBin: "Back to Bin",
    eduComp: "Education.comp",
    workspaceTip: "Workspace Tip",
    tipDesc: "Double click an item to load into Monitor. Use Export button for contact.",
    assetInventory: "Asset Inventory",
    masterMetadata: "Master Metadata",
    playing: "PLAYING: REALTIME",
    paused: "PAUSED: SOURCE",
    techPipeline: "Tech Pipeline",
    genAiEngine: "Gen-AI Engine",
    nodes: "Nodes",
    inspector: "Inspector",
    education_title: "EDUCATION_",
    academicHistory: "Academic History",
    systemReady: "SYSTEM READY",
    rendering: "RENDERING PROJECT",
    gpuAccel: "GPU Acceleration: Mercury Engine (Metal)",
    ae_warning_title: "After Effects - Warning",
    ae_warning_desc: "Would you like to download a standard PDF copy of the project? A classic version is recommended for physical archiving.",
    cancel: "Cancel",
    download_pdf: "Download PDF",
    pr_warning_title: "Premiere Pro - Media Linking",
    pr_warning_desc: "The system has detected a PDF version available. Would you like to link this media for conventional reading?",
    ignore: "Ignore",
    dr_warning_title: "Classic Project Export",
    dr_warning_desc: "This interactive version has been graded for web. Would you like to download the master PDF version?",
    follow_dr: "Stay in DaVinci Resolve",
    job_title: "Edition | Broadcast | AI",
    layerLabel: "Layer",
    nodeInput: "Input",
    nodeBalance: "Balance",
    nodeGrading: "Grading",
    nodeAiTech: "AI_TECH",
    statusDone: "Done",
    statusReady: "Ready",
    sourceFile: "Source File",
    statusLabel: "Status",
    outputPath: "Output Path",
    startProcessing: "Start Processing",
    soft_skills: {
      english: "English_B1",
      creativity: "Creativity",
      team: "Teamwork",
      comm: "Communication",
      adapt: "Adaptability"
    },
    skill_levels: {
      weak: "Working on it",
      native: "Native",
      love: "I love it",
      high: "High",
      shifts: "Rotating Shifts"
    },
    phrases: [
      "Syncing broadcast precision with video magic.",
      "Creativity with a technical foundation.",
      "Audiovisual, technical, and digital in one person.",
      "Where image, technology, and narrative intersect.",
      "Hybrid profile for complex visual projects.",
      "Understanding the image from camera to code.",
      "I don't just create video. I understand how it works."
    ],
    techSkills: [
      { n: "Adobe Premiere", v: "PRO" }, { n: "After Effects", v: "EXPERT" },
      { n: "Resolve DaVinci", v: "MID" }, { n: "Avid Interplay", v: "MID" },
      { n: "Final Cut Pro X", v: "MID" }, { n: "Adobe Illustrator", v: "BASIC" }
    ],
    genAiModels: ["Sora", "Grok", "Gemini", "NotebookLM", "Lovable", "Kling"],
    exp_data: [
      {
        id: "motion", title: "Editing / Motion", period: "2014–25", company: "Wata Studio / Inmersive Creature",
        iconName: "Film", labelPr: "#D580A5", labelAe: "#B55A7E",
        fullHistory: [
          { year: "2025 - Present", label: "Wata Studio", desc: "Production of promotional videos for social media, documentaries, and audiovisual pieces." },
          { year: "2025", label: "Inmersive Creature", desc: "2D Editing and Animation using After Effects." },
          { year: "2024", label: "Plena Inclusión", desc: "Design and development of inclusive 2D animation videos with After Effects." }
        ]
      },
      {
        id: "broadcast", title: "Broadcast / MCR", period: "2007–25", company: "Prisa TV / Mediaset / Olympic / Movistar+ / TSA",
        iconName: "Radio", labelPr: "#5E7C9D", labelAe: "#4B7A50",
        fullHistory: [
          { year: "2025", label: "Telefónica TSA", desc: "CCG N1 TV and OTT Operator. Alarm monitoring and management." },
          { year: "2019-2024", label: "Beon Media", desc: "MCR Content Operator. Technical supervision and international continuity for live feeds." },
          { year: "2018-2019", label: "Olympic Channel", desc: "Media Coordinator - Systems and workflows." },
          { year: "2016-2018", label: "Movistar +", desc: "QC Verification Operator. Quality control of audiovisual content." },
          { year: "2015-2018", label: "Mediaset", desc: "Broadcast links technician and operator. Ingest for Telecinco and Cuatro News and Sports." }
        ]
      },
      {
        id: "filmmaker", title: "Lighting / Camera / Editing", period: "2007–17", company: "Freelance / DSProducción",
        iconName: "Camera", labelPr: "#7B669D", labelAe: "#506B8A",
        fullHistory: [
          { year: "2013-2017", label: "DSProducciones", desc: "Co-founder. Camera and lighting operator, video editing, and color grading." }
        ]
      }
    ],
    edu_data: [
      { year: "2025", label: "WEB DESIGN PROGRAMMING - ADALAB" },
      { year: "2022", label: "MOTION GRAPHICS MASTER - CICE" },
      { year: "2016", label: "BA IN AUDIOVISUAL COMMUNICATION - UCM" },
      { year: "2007", label: "H.D. IN IMAGE - IES PUERTA BONITA" }
    ],
    art_data: [
      { id: "reel", title: "Video Reel 2025", period: "Current", company: "Tania Salvatella", iconName: "Play", labelPr: "#D580A5", labelAe: "#B55A7E", fullHistory: [{ year: "2025", label: "Showreel", desc: "Compilation of professional audiovisual works." }] }
    ]
  }
};
