export interface ExperienceItem {
  id: string;
  title: string;
  period: string;
  company: string;
  iconName: string;
  labelPr: string;
  labelAe: string;
  fullHistory: { year: string; label: string; desc: string }[];
  type?: string;
  color?: string;
  duration?: string;
  url?: string;
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
  broadcastSys: string;
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
  transferring: string;
  selectClip: string;
  undo_toast: string;

  // Signal & Monitor
  rec_play: string;
  poor_signal: string;
  connection_lost: string;
  weak_signal: string;
  no_signal: string;
  buffering: string;
  source_label: string;
  clip_label: string;
  desktop_mode: string;
  social_mode: string;

  // Tabs & Panels
  project_bin: string;
  media_browser: string;
  gallery: string;
  media_pool: string;
  project: string;
  assets_lib: string;

  // Inspector
  selected_item: string;
  no_clip: string;
  select_hint: string;
  tech_specs: string;
  frame_rate: string;
  resolution: string;
  reset: string;

  // Timeline
  empty_track: string;

  // Mobile tabs
  mob_bin: string;
  mob_monitor: string;
  mob_timeline: string;
  mob_info: string;

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
  broadcastSystemsList: string[];
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
    artisticProjects: "Proyectos",
    backToBin: "Volver a Bandeja",
    eduComp: "Educación.comp",
    workspaceTip: "INFO DE NAVEGACIÓN",
    tipDesc: "Interacciona con las pantallas. Usa Exportar para contacto.",
    assetInventory: "Inventario de Activos",
    masterMetadata: "Metadatos Maestro",
    playing: "REPRODUCIENDO: TIEMPO REAL",
    paused: "PAUSADO: FUENTE",
    techPipeline: "Pipeline Tecnológico",
    genAiEngine: "Motor Gen-AI",
    broadcastSys: "Sistemas Broadcast & IT",
    nodes: "Nodos",
    inspector: "Inspector",
    education_title: "EDUCACIÓN_",
    academicHistory: "Historial Académico",
    systemReady: "SISTEMA LISTO",
    rendering: "RENDERIZANDO PROYECTO",
    gpuAccel: "Aceleración GPU: Mercury Engine (Metal)",
    ae_warning_title: "After Effects - Advertencia",
    ae_warning_desc:
      "¿Deseas descargar una copia del proyecto en formato PDF estándar? Se recomienda una versión clásica para archivo físico.",
    cancel: "Cancelar",
    download_pdf: "Descargar PDF",
    pr_warning_title: "Premiere Pro - Vinculación de Medios",
    pr_warning_desc:
      "El sistema ha detectado una versión PDF disponible. ¿Deseas vincular este medio para una lectura convencional?",
    ignore: "Ignorar",
    dr_warning_title: "Exportación de Proyecto Clásica",
    dr_warning_desc: "Esta versión interactiva ha sido etalonada para web. ¿Deseas descargar la versión master en PDF?",
    follow_dr: "Seguir en Davinci Resolve",
    job_title: "Edición | Broadcast | IA",
    layerLabel: "Nombre de capa",
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
    transferring: "Transfiriendo...",
    selectClip: "Arrastra un clip aquí",
    undo_toast: "Deshacer (Ctrl+Z) no disponible en la vida real 😉",

    // Signal & Monitor
    rec_play: "GRAB [PLAY]",
    poor_signal: "SEÑAL DÉBIL",
    connection_lost: "CONEXIÓN PERDIDA",
    weak_signal: "SEÑAL INESTABLE",
    no_signal: "SIN SEÑAL",
    buffering: "CARGANDO...",
    source_label: "Fuente: CV_Tania.prproj",
    clip_label: "Clip: Salida_Maestro",
    desktop_mode: "Escritorio",
    social_mode: "Social",

    // Tabs & Panels
    project_bin: "Bandeja Proyecto",
    media_browser: "Navegador Medios",
    gallery: "Galería",
    media_pool: "Contenedor Medios",
    project: "Proyecto",
    assets_lib: "Librería Activos",

    // Inspector
    selected_item: "Elemento Seleccionado",
    no_clip: "Ningún clip seleccionado",
    select_hint: "Selecciona un clip de la bandeja",
    tech_specs: "Especificaciones Técnicas",
    frame_rate: "Velocidad de Fotograma",
    resolution: "Resolución",
    reset: "Resetear",

    // Timeline
    empty_track: "--- PISTA VACÍA ---",

    // Mobile tabs
    mob_bin: "Bandeja",
    mob_monitor: "Monitor",
    mob_timeline: "Línea Tiempo",
    mob_info: "Info",

    soft_skills: {
      english: "Inglés_B1",
      creativity: "Creatividad",
      team: "Trabajo en equipo",
      comm: "Comunicación",
      adapt: "Adaptabilidad",
    },
    skill_levels: {
      weak: "No es mi fuerte",
      native: "Nativo",
      love: "Me encanta",
      high: "Alta",
      shifts: "Turnos Rotativos",
    },
    phrases: [
      "Sin drop frames.",
      "Señal estable.",
      "Todo en sync.",
      "Frame a frame.",
      "Broadcast safe.",
      "Timecode continuo.",
      "Edición invisible.",
      "Ritmo en cada corte.",
      "Luz lista. Cámara lista.",
      "Render limpio.",
    ],
    techSkills: [
      { n: "Adobe Premiere", v: "PRO" },
      { n: "After Effects", v: "MID" },
      { n: "Resolve Davinci", v: "MID" },
      { n: "Avid Interplay", v: "MID" },
      { n: "Final Cut Pro X", v: "MID" },
      { n: "Adobe Illustrator", v: "BÁSICO" },
      { n: "Cinema 4D", v: "BÁSICO" },
    ],
    genAiModels: ["Sora", "ElevenLabs", "Grok", "Gemini", "NotebookLM", "Lovable", "Kling"],
    broadcastSystemsList: [
      "OpenText",
      "MPX",
      "Forge",
      "VPMS",
      "iNews",
      "Vantage",
      "FileZilla",
      "EVS",
      "Dalet",
      "Jira",
      "Confluence",
      "Kayako",
      "Slack",
      "Splunk Grafana",
      "Microsoft 365",
    ],
    exp_data: [
      {
        id: "motion",
        title: "Edición / Motion",
        period: "2024–25",
        company: "Wata Studio / Inmersive Creature",
        iconName: "Film",
        labelPr: "#E085B2",
        labelAe: "#A680B8",
        fullHistory: [
          {
            year: "2025 - Actualidad",
            label: "Wata Studio",
            desc: "Realización de vídeos promocionales para RRSS, documentales y piezas audiovisuales.",
          },
          { year: "2025", label: "Inmersive Creature", desc: "Edición y animación 2D con After Effects." },
          {
            year: "2024",
            label: "Dim Sum Producciones",
            desc: "Diseño y desarrollo de vídeo inclusivo para Plena Inclusión en animación 2D con After Effects.",
          },
        ],
      },
      {
        id: "broadcast",
        title: "Broadcast / MCR",
        period: "2007–25",
        company: "Prisa TV / Mediaset / Olympic / Movistar+ / TSA",
        iconName: "Radio",
        labelPr: "#5E7C9D",
        labelAe: "#6A8B9D",
        fullHistory: [
          {
            year: "2025",
            label: "Telefónica TSA",
            desc: "Operadora de CCG N1 TV y OTT. Monitorado y gestión de alarmas.",
          },
          {
            year: "2019-2024",
            label: "Beon Media",
            desc: "MCR Content Operator. Supervisión técnica y continuidad internacional de feeds en vivo.",
          },
          {
            year: "2018-2019",
            label: "Olympic Channel",
            desc: "Coordinadora de Medios - Sistemas y Flujos de Trabajo.",
          },
          {
            year: "2016-2018",
            label: "Movistar +",
            desc: "Operadora de Verificación QC. Control de calidad de los contenidos.",
          },
          {
            year: "2015-2018",
            label: "Mediaset",
            desc: "Técnica de emisión operadora de enlaces. Ingesta de Informativos Telecinco y Cuatro, Deportes.",
          },
          {
            year: "2007-2014",
            label: "Prisa TV",
            desc: "Técnica de emisión operadora de enlaces. Ingesta de eventos deportivos.",
          },
        ],
      },
      {
        id: "filmmaker",
        title: "Iluminación / Cámara / Edición",
        period: "2007–17",
        company: "Freelance / DSProducción",
        iconName: "Camera",
        labelPr: "#7B669D",
        labelAe: "#9D807B",
        fullHistory: [
          {
            year: "2013-2017",
            label: "DS Producciones",
            desc: "Cofundadora. Operadora de cámara e iluminación, edición y color.",
          },
          {
            year: "2011-2017",
            label: "Freelance",
            desc: "Operadora de cámara e iluminación, edición y color para diferentes proyectos.",
          },
        ],
      },
    ],
    edu_data: [
      { year: "2025", label: "PROGRAMACIÓN DISEÑO WEB - ADALAB" },
      { year: "2025", label: "DOCENCIA FORMACIÓN PROFESIONAL - SSCE0110" },
      { year: "2022", label: "MÁSTER MOTION GRAPHICS - CICE" },
      { year: "2016", label: "GRADO COMUNICACIÓN AUDIOVISUAL - UCM" },
      { year: "2007", label: "TÉCNICO SUPERIOR IMAGEN - IES PUERTA BONITA" },
    ],
    art_data: [
      {
        id: "id1",
        title: "Showreel 2025",
        period: "",
        company: "",
        iconName: "Play",
        labelPr: "#FF4B4B",
        labelAe: "#FF4B4B",
        color: "#FF4B4B",
        duration: "00:02:30",
        type: "video",
        fullHistory: [],
        url: "https://vimeo.com/1171547123?share=copy&fl=sv&fe=ci",
      },
      {
        id: "vid2",
        title: "Docu: Legacy - WATA",
        period: "",
        company: "",
        iconName: "Play",
        labelPr: "#4BFF4B",
        labelAe: "#4BFF4B",
        color: "#4BFF4B",
        duration: "00:15:00",
        type: "video",
        fullHistory: [],
        url: "https://www.youtube.com/watch?v=7M8TEeqD4Wc&t=1s",
      },
      {
        id: "vid3",
        title: "Reels RRSS: Gournay - WATA",
        period: "",
        company: "",
        iconName: "Play",
        labelPr: "#4B4BFF",
        labelAe: "#4B4BFF",
        color: "#4B4BFF",
        duration: "00:08:45",
        type: "video",
        fullHistory: [],
        url: "https://www.instagram.com/gournay_es?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
      },
      {
        id: "vid4",
        title: "Reel Ozono",
        period: "",
        company: "",
        iconName: "Play",
        labelPr: "#FFFF4B",
        labelAe: "#FFFF4B",
        color: "#FFFF4B",
        duration: "00:00:30",
        type: "video",
        fullHistory: [],
        url: "https://ozonofilms.com/",
      },
      {
        id: "vid5",
        title: "Reel WATA",
        period: "",
        company: "",
        iconName: "Play",
        labelPr: "#FF4BFF",
        labelAe: "#FF4BFF",
        color: "#FF4BFF",
        duration: "00:03:12",
        type: "video",
        fullHistory: [],
        url: "https://watastudio.com/marketing-digital/",
      },
      {
        id: "vid6",
        title: "Vimeo: Olds Works",
        period: "",
        company: "",
        iconName: "Play",
        labelPr: "#4BFFFF",
        labelAe: "#4BFFFF",
        color: "#4BFFFF",
        duration: "00:01:20",
        type: "video",
        fullHistory: [],
        url: "https://vimeo.com/taniasalvatella",
      },
    ],
  },
  en: {
    export: "Export",
    lang: "Language: EN",
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
    artisticProjects: "Projects",
    backToBin: "Back to Bin",
    eduComp: "Education.comp",
    workspaceTip: "NAVIGATION INFO",
    tipDesc: "Interact with the screens. Use Export for contact.",
    assetInventory: "Asset Inventory",
    masterMetadata: "Master Metadata",
    playing: "PLAYING: REALTIME",
    paused: "PAUSED: SOURCE",
    techPipeline: "Tech Pipeline",
    genAiEngine: "Gen-AI Engine",
    broadcastSys: "Broadcast & IT Systems",
    nodes: "Nodes",
    inspector: "Inspector",
    education_title: "EDUCATION_",
    academicHistory: "Academic History",
    systemReady: "SYSTEM READY",
    rendering: "RENDERING PROJECT",
    gpuAccel: "GPU Acceleration: Mercury Engine (Metal)",
    ae_warning_title: "After Effects - Warning",
    ae_warning_desc:
      "Do you want to download a copy of the project in standard PDF format? A classic version is recommended for physical archiving.",
    cancel: "Cancel",
    download_pdf: "Download PDF",
    pr_warning_title: "Premiere Pro - Media Linking",
    pr_warning_desc:
      "The system has detected an available PDF version. Do you want to link this media for conventional reading?",
    ignore: "Ignore",
    dr_warning_title: "Classic Project Export",
    dr_warning_desc:
      "This interactive version has been graded for web. Do you want to download the master version in PDF?",
    follow_dr: "Continue in Davinci Resolve",
    job_title: "Editing | Broadcast | AI",
    layerLabel: "Layer Name",
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
    transferring: "Transferring...",
    selectClip: "Drag a clip here",
    undo_toast: "Undo (Ctrl+Z) not available in real life 😉",

    // Signal & Monitor
    rec_play: "REC [PLAY]",
    poor_signal: "POOR SIGNAL",
    connection_lost: "CONNECTION LOST",
    weak_signal: "WEAK SIGNAL",
    no_signal: "NO SIGNAL",
    buffering: "BUFFERING...",
    source_label: "Source: CV_Tania.prproj",
    clip_label: "Clip: Master_Output",
    desktop_mode: "Desktop",
    social_mode: "Social",

    // Tabs & Panels
    project_bin: "Project Bin",
    media_browser: "Media Browser",
    gallery: "Gallery",
    media_pool: "Media Pool",
    project: "Project",
    assets_lib: "Assets Library",

    // Inspector
    selected_item: "Selected Item",
    no_clip: "No Clip Selected",
    select_hint: "Select a clip from the Bin",
    tech_specs: "Technical Specs",
    frame_rate: "Frame Rate",
    resolution: "Resolution",
    reset: "Reset",

    // Timeline
    empty_track: "--- EMPTY TRACK ---",

    // Mobile tabs
    mob_bin: "Bin",
    mob_monitor: "Monitor",
    mob_timeline: "Timeline",
    mob_info: "Info",

    soft_skills: {
      english: "English_B1",
      creativity: "Creativity",
      team: "Teamwork",
      comm: "Communication",
      adapt: "Adaptability",
    },
    skill_levels: {
      weak: "Not my forte",
      native: "Native",
      love: "Love it",
      high: "High",
      shifts: "Rotating Shifts",
    },
    phrases: [
      "No drop frames.",
      "Stable signal.",
      "All in sync.",
      "Frame by frame.",
      "Broadcast safe.",
      "Continuous timecode.",
      "Invisible editing.",
      "Rhythm in every cut.",
      "Lights ready. Camera ready.",
      "Clean render.",
    ],
    techSkills: [
      { n: "Adobe Premiere", v: "PRO" },
      { n: "After Effects", v: "MID" },
      { n: "Resolve Davinci", v: "MID" },
      { n: "Avid Interplay", v: "MID" },
      { n: "Final Cut Pro X", v: "MID" },
      { n: "Adobe Illustrator", v: "BASIC" },
      { n: "Cinema 4D", v: "BASIC" },
    ],
    genAiModels: ["Sora", "ElevenLabs", "Grok", "Gemini", "NotebookLM", "Lovable", "Kling"],
    broadcastSystemsList: [
      "OpenText",
      "MPX",
      "Forge",
      "VPMS",
      "iNews",
      "Vantage",
      "FileZilla",
      "EVS",
      "Dalet",
      "Jira",
      "Confluence",
      "Kayako",
      "Slack",
      "Splunk Grafana",
      "Microsoft 365",
    ],
    exp_data: [
      {
        id: "motion",
        title: "Editing / Motion",
        period: "2024–25",
        company: "Wata Studio / Inmersive Creature",
        iconName: "Film",
        labelPr: "#E085B2",
        labelAe: "#A680B8",
        fullHistory: [
          {
            year: "2025 - Present",
            label: "Wata Studio",
            desc: "Production of promotional videos for social media, documentaries, and audiovisual pieces.",
          },
          { year: "2025", label: "Inmersive Creature", desc: "Editing and 2D animation with After Effects." },
          {
            year: "2024",
            label: "Dim Sum Producciones",
            desc: "Design and development of inclusive video for Plena Inclusión in 2D animation with After Effects.",
          },
        ],
      },
      {
        id: "broadcast",
        title: "Broadcast / MCR",
        period: "2007–25",
        company: "Prisa TV / Mediaset / Olympic / Movistar+ / TSA",
        iconName: "Radio",
        labelPr: "#5E7C9D",
        labelAe: "#6A8B9D",
        fullHistory: [
          {
            year: "2025",
            label: "Telefónica TSA",
            desc: "CCG N1 TV and OTT Operator. Monitoring and alarm management.",
          },
          {
            year: "2019-2024",
            label: "Beon Media",
            desc: "MCR Content Operator. Technical supervision and international continuity for live feeds.",
          },
          { year: "2018-2019", label: "Olympic Channel", desc: "Media Coordinator - Systems and Workflows." },
          { year: "2016-2018", label: "Movistar +", desc: "QC Verification Operator. Quality control of content." },
          {
            year: "2015-2018",
            label: "Mediaset",
            desc: "Broadcast Technician Link Operator. Ingest for Telecinco and Cuatro News, Sports.",
          },
          {
            year: "2007-2014",
            label: "Prisa TV",
            desc: "Broadcast Technician Link Operator. Ingest of sports events.",
          },
        ],
      },
      {
        id: "filmmaker",
        title: "Lighting / Camera / Editing",
        period: "2007–17",
        company: "Freelance / DSProducción",
        iconName: "Camera",
        labelPr: "#7B669D",
        labelAe: "#9D807B",
        fullHistory: [
          {
            year: "2013-2017",
            label: "DS Producciones",
            desc: "Co-founder. Camera and lighting operator, editing and color.",
          },
          {
            year: "2011-2017",
            label: "Freelance",
            desc: "Camera and lighting operator, editing and color for various projects.",
          },
        ],
      },
    ],
    edu_data: [
      { year: "2025", label: "WEB DESIGN PROGRAMMING - ADALAB" },
      { year: "2025", label: "VOCATIONAL TRAINING TEACHING - SSCE0110" },
      { year: "2022", label: "MASTER MOTION GRAPHICS - CICE" },
      { year: "2016", label: "AUDIOVISUAL COMMUNICATION DEGREE - UCM" },
      { year: "2007", label: "HIGHER TECHNICIAN IMAGE - IES PUERTA BONITA" },
    ],
    art_data: [
      {
        id: "id1",
        title: "Showreel 2025",
        period: "",
        company: "",
        iconName: "Play",
        labelPr: "#FF4B4B",
        labelAe: "#FF4B4B",
        color: "#FF4B4B",
        duration: "00:02:30",
        type: "video",
        fullHistory: [],
        url: "https://vimeo.com/1171547123?share=copy&fl=sv&fe=ci",
      },
      {
        id: "vid2",
        title: "Docu: Legacy - WATA",
        period: "",
        company: "",
        iconName: "Play",
        labelPr: "#4BFF4B",
        labelAe: "#4BFF4B",
        color: "#4BFF4B",
        duration: "00:15:00",
        type: "video",
        fullHistory: [],
        url: "https://www.youtube.com/watch?v=7M8TEeqD4Wc&t=1s",
      },
      {
        id: "vid3",
        title: "Reels RRSS: Gournay - WATA",
        period: "",
        company: "",
        iconName: "Play",
        labelPr: "#4B4BFF",
        labelAe: "#4B4BFF",
        color: "#4B4BFF",
        duration: "00:08:45",
        type: "video",
        fullHistory: [],
        url: "https://www.instagram.com/gournay_es?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
      },
      {
        id: "vid4",
        title: "Reel Ozono",
        period: "",
        company: "",
        iconName: "Play",
        labelPr: "#FFFF4B",
        labelAe: "#FFFF4B",
        color: "#FFFF4B",
        duration: "00:00:30",
        type: "video",
        fullHistory: [],
        url: "https://ozonofilms.com/",
      },
      {
        id: "vid5",
        title: "Reel WATA",
        period: "",
        company: "",
        iconName: "Play",
        labelPr: "#FF4BFF",
        labelAe: "#FF4BFF",
        color: "#FF4BFF",
        duration: "00:03:12",
        type: "video",
        fullHistory: [],
        url: "https://watastudio.com/marketing-digital/",
      },
      {
        id: "vid6",
        title: "Vimeo: Olds Works",
        period: "",
        company: "",
        iconName: "Play",
        labelPr: "#4BFFFF",
        labelAe: "#4BFFFF",
        color: "#4BFFFF",
        duration: "00:01:20",
        type: "video",
        fullHistory: [],
        url: "https://vimeo.com/taniasalvatella",
      },
    ],
  },
};
