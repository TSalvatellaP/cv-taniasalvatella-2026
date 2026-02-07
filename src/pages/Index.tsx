import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Settings, Sparkles,
  Monitor, Maximize2, Volume2,
  Eye, Lock, ChevronRight, ChevronDown,
  Sliders, Film, GraduationCap, Calendar, Code, Zap,
  Folder, List, Filter, Share, X,
  Activity, Grid, Radio, Camera, Crosshair, BarChart,
  Layers2, Languages, BookOpen, BrainCircuit, Users, MessageSquare, Video, Search
} from 'lucide-react';
import { generateCV } from '@/utils/generateCV';
import { translations, type ExperienceItem } from '@/data/translations';
import { ResolveIcon, AdobeAeIcon, AdobePrIcon, AeCompIcon, PrSequenceIcon, DrSequenceIcon } from '@/components/cv/CvIcons';
import { ExportModal } from '@/components/cv/ExportModal';
import { AEWarning, PRWarning, DRWarning } from '@/components/cv/Warnings';

type Mode = 'editing' | 'effects' | 'color';

const getExpIcon = (iconName: string, size: number) => {
  switch (iconName) {
    case 'Film': return <Film size={size} />;
    case 'Radio': return <Radio size={size} />;
    case 'Camera': return <Camera size={size} />;
    case 'Play': return <Play size={size} />;
    default: return <Film size={size} />;
  }
};

const Index = () => {
  const [lang, setLang] = useState<string>('es');
  const t = translations[lang];
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeMode, setActiveMode] = useState<Mode>('editing');
  const [selectedExp, setSelectedExp] = useState<ExperienceItem | null>(null);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [showEducation, setShowEducation] = useState(false);
  const [currentFolder, setCurrentFolder] = useState('root');
  const [playheadPos, setPlayheadPos] = useState(30);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [activeProjectTab, setActiveProjectTab] = useState('project');
  const [expandedLayers, setExpandedLayers] = useState<Record<string, boolean>>({ motion: true });
  const [keyframes, setKeyframes] = useState([
    { id: 'kf1', layerId: 'motion', pos: 25 },
    { id: 'kf2', layerId: 'motion', pos: 45 },
    { id: 'kf3', layerId: 'broadcast', pos: 40 },
    { id: 'kf4', layerId: 'broadcast', pos: 60 }
  ]);
  const [draggingKf, setDraggingKf] = useState<string | null>(null);
  const [wheelStates, setWheelStates] = useState({
    lift: { x: 50, y: 50 },
    gamma: { x: 50, y: 50 },
    gain: { x: 50, y: 50 }
  });
  const [draggingWheel, setDraggingWheel] = useState<string | null>(null);

  const timelineContentRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  useEffect(() => {
    let animationFrame: number;
    const step = () => {
      if (isPlaying) {
        setPlayheadPos(prev => (prev + 0.05) % 100);
        animationFrame = requestAnimationFrame(step);
      }
    };
    if (isPlaying) animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (!isPlaying) {
      interval = setInterval(() => {
        setIsFading(true);
        setTimeout(() => {
          setPhraseIndex(prev => (prev + 1) % t.phrases.length);
          setIsFading(false);
        }, 600);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, t.phrases.length, lang]);

  const toggleAudio = useCallback(() => {
    if (isAudioActive) {
      if (oscillatorRef.current) { oscillatorRef.current.stop(); oscillatorRef.current = null; }
      setIsAudioActive(false);
    } else {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
        if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();
        osc.frequency.setValueAtTime(1000, audioCtxRef.current.currentTime);
        gain.gain.setValueAtTime(0.05, audioCtxRef.current.currentTime);
        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        osc.start();
        oscillatorRef.current = osc;
        setIsAudioActive(true);
      } catch (e) { console.error(e); }
    }
  }, [isAudioActive]);

  const getTimecode = (percent: number) => {
    const totalFrames = 3000;
    const currentFrame = Math.floor((percent / 100) * totalFrames);
    const mm = Math.floor(currentFrame / (25 * 60)).toString().padStart(2, '0');
    const ss = Math.floor((currentFrame % (25 * 60)) / 25).toString().padStart(2, '0');
    const ff = (currentFrame % 25).toString().padStart(2, '0');
    return `00:${mm}:${ss}:${ff}`;
  };

  const handleGlobalMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggingKf && timelineContentRef.current) {
      const rect = timelineContentRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      let percent = (x / rect.width) * 100;
      percent = Math.max(0, Math.min(100, percent));
      setKeyframes(prev => prev.map(kf => kf.id === draggingKf ? { ...kf, pos: percent } : kf));
    }
    if (draggingWheel) {
      const el = document.getElementById(`wheel-${draggingWheel}`);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const radius = rect.width / 2;
      const centerX = rect.left + radius;
      const centerY = rect.top + radius;
      let dx = e.clientX - centerX;
      let dy = e.clientY - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > radius - 10) {
        const angle = Math.atan2(dy, dx);
        dx = Math.cos(angle) * (radius - 10);
        dy = Math.sin(angle) * (radius - 10);
      }
      const xPercent = 50 + (dx / radius) * 50;
      const yPercent = 50 + (dy / radius) * 50;
      setWheelStates(prev => ({ ...prev, [draggingWheel]: { x: xPercent, y: yPercent } }));
    }
  }, [draggingKf, draggingWheel]);

  const handleGlobalMouseUp = useCallback(() => {
    setDraggingKf(null);
    setDraggingWheel(null);
  }, []);

  const handleDownloadPDF = () => {
    generateCV(lang as 'es' | 'en');
    setShowWarning(false);
  };

  const getHeaderInfo = () => {
    switch (activeMode) {
      case 'color': return { icon: <ResolveIcon />, title: "DaVinci Resolve - Tania_Salvatella_CV.drp", accent: "#f39c12", bg: "bg-[#121212]" };
      case 'effects': return { icon: <AdobeAeIcon />, title: "After Effects - Tania_Salvatella_CV.aep", accent: "#d191ff", bg: "bg-[#1C1C1C]" };
      default: return { icon: <AdobePrIcon />, title: "Premiere Pro - Tania_Salvatella_CV.prproj", accent: "#31A8FF", bg: "bg-[#232323]" };
    }
  };

  const headerInfo = getHeaderInfo();

  const softSkills = [
    { id: "english", title: t.soft_skills.english, icon: <BookOpen size={14} />, color: "#31A8FF", level: t.skill_levels.weak, codec: "Global_Lang" },
    { id: "creativity", title: t.soft_skills.creativity, icon: <BrainCircuit size={14} />, color: "#D191FF", level: t.skill_levels.native, codec: "Visual_Craft" },
    { id: "team", title: t.soft_skills.team, icon: <Users size={14} />, color: "#f39c12", level: t.skill_levels.love, codec: "Agile_Sync" },
    { id: "comm", title: t.soft_skills.comm, icon: <MessageSquare size={14} />, color: "#10b981", level: t.skill_levels.high, codec: "Client_Rel" },
    { id: "adapt", title: t.soft_skills.adapt, icon: <MessageSquare size={14} />, color: "#10b981", level: t.skill_levels.shifts, codec: "Flex_Ops" }
  ];

  const tabs = activeMode === 'color'
    ? [{ id: 'project', label: lang === 'es' ? 'Galería' : 'Gallery' }, { id: 'skills', label: lang === 'es' ? 'Contenedor Medios' : 'Media Pool' }]
    : activeMode === 'effects'
    ? [{ id: 'project', label: lang === 'es' ? 'Proyecto' : 'Project' }, { id: 'skills', label: lang === 'es' ? 'Librería Activos' : 'Assets Library' }]
    : [{ id: 'project', label: lang === 'es' ? 'Bandeja Proyecto' : 'Project Bin' }, { id: 'skills', label: lang === 'es' ? 'Navegador Medios' : 'Media Browser' }];

  return (
    <div
      className={`min-h-screen ${headerInfo.bg} font-sans text-sm flex flex-col transition-colors duration-300 select-none overflow-hidden h-screen`}
      onMouseMove={handleGlobalMouseMove}
      onMouseUp={handleGlobalMouseUp}
    >
      {showExportModal && <ExportModal onClose={() => setShowExportModal(false)} lang={lang} />}

      {/* HEADER NAV */}
      <nav className="h-10 bg-secondary border-b border-black flex items-center justify-between px-4 z-50 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5">{headerInfo.icon}</div>
            <span className="text-[10px] font-bold text-foreground uppercase tracking-tighter hidden sm:inline">{headerInfo.title}</span>
          </div>
          <div className="hidden lg:flex gap-4 text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
            {[t.file, t.edit, t.sequence, t.marker, t.window, t.help].map(item => (
              <span key={item} className="cursor-pointer hover:text-foreground transition-colors">{item}</span>
            ))}
          </div>
        </div>

        <div className="flex h-full bg-panel-deep border-l border-r border-black">
          {(['editing', 'color', 'effects'] as Mode[]).map(m => (
            <button key={m}
              className={`px-3 sm:px-6 text-[10px] uppercase font-bold tracking-widest transition-all h-full flex items-center ${
                activeMode === m
                  ? `border-t-2 bg-secondary text-foreground ${m === 'effects' ? 'border-aftereffects' : m === 'color' ? 'border-davinci' : 'border-premiere'}`
                  : 'text-muted-foreground hover:text-secondary-foreground'
              }`}
              onClick={() => setActiveMode(m)}
            >
              {m === 'editing' ? t.editing : m === 'color' ? t.color : t.effects}
            </button>
          ))}
        </div>

        <div className="flex gap-2 items-center">
          <button
            onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
            className="flex items-center gap-2 px-3 py-1 rounded-sm text-[10px] font-black uppercase tracking-widest bg-white/10 text-secondary-foreground hover:bg-white/20 transition-all border border-white/5"
          >
            <Languages size={12} /> {t.lang}
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className={`flex items-center gap-2 px-3 py-1 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${
              activeMode === 'effects' ? 'bg-aftereffects text-black hover:bg-white'
              : activeMode === 'color' ? 'bg-davinci text-black hover:bg-white'
              : 'bg-premiere text-white hover:bg-white hover:text-black'
            }`}
          >
            <Share size={12} /> {t.export}
          </button>
          <button className={`flex items-center gap-1 text-[10px] ${isAudioActive ? (activeMode === 'color' ? 'text-davinci' : 'text-emerald-400') : 'text-muted-foreground'}`} onClick={toggleAudio}>
            <Volume2 size={12} /> {isAudioActive ? 'ON' : 'OFF'}
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-0.5 overflow-hidden p-0.5 bg-black">
        {/* PROJECT BIN (LEFT) */}
        <section className={`col-span-12 md:col-span-3 flex flex-col overflow-hidden ${activeMode === 'effects' ? 'bg-[#282828]' : activeMode === 'color' ? 'bg-panel-deep' : 'bg-[#232323]'} border border-black/50`}>
          <div className="p-0 border-b border-black flex items-center justify-between bg-panel-header shrink-0">
            <div className="flex items-center">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveProjectTab(tab.id)}
                  className={`px-3 py-2 text-[9px] font-bold uppercase transition-all border-r border-black/20 ${activeProjectTab === tab.id ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-secondary-foreground'}`}
                  style={activeProjectTab === tab.id ? { borderTop: `2px solid ${headerInfo.accent}` } : {}}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex items-center px-2 gap-1 text-muted-foreground">
              <Grid size={10} />
              <List size={10} />
            </div>
          </div>

          {activeProjectTab === 'project' && (
            <div className="bg-panel-header h-6 flex items-center px-4 border-b border-black text-[8px] text-muted-foreground font-bold uppercase tracking-tighter shrink-0">
              <div className="w-[50%]">{t.name}</div>
              <div className="w-[25%] border-l border-black/10 pl-2">FPS</div>
              <div className="w-[25%] border-l border-black/10 pl-2">{t.mediaType}</div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto font-mono text-[11px] custom-scrollbar p-1">
            {activeProjectTab === 'project' ? (
              <>
                {activeMode === 'editing' && (
                  <div className="text-muted-foreground text-[10px] mb-2 px-2 flex items-center gap-2 font-bold uppercase tracking-widest mt-2 cursor-pointer group">
                    <ChevronDown size={10} />
                    <Folder size={12} className="text-premiere" />
                    📁 {t.assets}
                    <span className="ml-auto opacity-20 text-[7px]">{t.exp_data.length} {t.items}</span>
                  </div>
                )}
                {t.exp_data.map(exp => (
                  <div key={exp.id} onClick={() => { setSelectedExp(exp); setShowEducation(false); }}
                    className={`group flex items-center p-1 rounded-sm cursor-pointer transition-all ${
                      selectedExp?.id === exp.id
                        ? activeMode === 'effects' ? 'bg-[#4B4B4B] text-aftereffects'
                          : activeMode === 'color' ? 'bg-[#333] border border-davinci/50'
                          : 'bg-premiere text-white shadow-lg'
                        : 'hover:bg-white/5 text-muted-foreground hover:text-foreground'
                    }`}>
                    <div className="w-[50%] flex items-center gap-2 px-1 truncate">
                      {activeMode === 'effects' ? (
                        <AeCompIcon color={selectedExp?.id === exp.id ? "#D191FF" : "#888"} />
                      ) : (
                        exp.id === 'motion' ? (
                          activeMode === 'editing' ? <PrSequenceIcon /> : <DrSequenceIcon />
                        ) : (
                          <Film size={12} className="shrink-0" />
                        )
                      )}
                      <span className="truncate">{exp.title}</span>
                    </div>
                    <div className="w-[25%] px-2 text-[8px] opacity-40">23.976</div>
                    <div className="w-[25%] px-2 text-[8px] opacity-40 truncate">Movie File</div>
                  </div>
                ))}

                <div onClick={() => setCurrentFolder(currentFolder === 'root' ? 'proyectos' : 'root')}
                  className={`group flex items-center p-1 rounded-sm cursor-pointer transition-all hover:bg-white/5 ${activeMode === 'effects' ? 'text-secondary-foreground' : activeMode === 'color' ? 'text-davinci' : 'text-orange-400'}`}>
                  <div className="w-full flex items-center gap-2 px-1 truncate">
                    <Folder size={12} className="text-yellow-600 shrink-0" />
                    <span className="truncate">{currentFolder === 'root' ? t.artisticProjects : `.. / ${t.backToBin}`}</span>
                  </div>
                </div>
                {currentFolder === 'proyectos' && t.art_data.map(proj => (
                  <div key={proj.id} onClick={() => { setSelectedExp(proj); setShowEducation(false); }}
                    className={`group flex items-center p-1 ml-4 rounded-sm cursor-pointer transition-all ${selectedExp?.id === proj.id ? 'bg-[#4B4B4B] text-aftereffects' : 'hover:bg-white/5 text-muted-foreground'}`}>
                    <Video size={12} className="ml-1 mr-2 opacity-40" />
                    <span className="truncate text-[10px]">{proj.title}</span>
                  </div>
                ))}

                <div onClick={() => { setShowEducation(true); setSelectedExp(null); }}
                  className={`group flex items-center p-1 rounded-sm cursor-pointer transition-all ${
                    showEducation
                      ? activeMode === 'effects' ? 'bg-[#4B4B4B] text-emerald-400'
                        : activeMode === 'color' ? 'bg-[#333] border border-davinci/50'
                        : 'bg-premiere text-white shadow-lg'
                      : 'hover:bg-white/5 text-emerald-400'
                  }`}>
                  <div className="w-[50%] flex items-center gap-2 px-1 truncate">
                    {activeMode === 'effects' ? <AeCompIcon color="#10b981" /> : <GraduationCap size={14} className="shrink-0" />}
                    <span className="truncate">{t.eduComp}</span>
                  </div>
                  <div className="w-[25%] px-2 text-[8px] opacity-40">Dynamic</div>
                  <div className="w-[25%] px-2 text-[8px] opacity-40">Comp</div>
                </div>

                <div className="mt-8 p-3 border border-white/5 bg-black/20 rounded-md">
                  <p className="text-[8px] text-white/20 uppercase tracking-widest font-bold mb-1">{t.workspaceTip}</p>
                  <p className="text-[8px] text-muted-foreground italic">{t.tipDesc}</p>
                </div>
              </>
            ) : (
              <div className="p-2 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">{t.assetInventory}</div>
                  <Filter size={10} className="text-muted-foreground" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {softSkills.map(skill => (
                    <div key={skill.id} className="group flex flex-col bg-black/40 border border-white/5 rounded overflow-hidden hover:border-white/20 transition-all cursor-default relative">
                      <div className="aspect-video w-full relative flex items-center justify-center bg-gradient-to-br from-black to-zinc-800">
                        <div className="absolute inset-0 opacity-10 group-hover:opacity-30 transition-opacity" style={{ backgroundColor: skill.color }}></div>
                        {skill.icon}
                      </div>
                      <div className="p-1.5 flex flex-col">
                        <span className="text-[9px] font-bold text-secondary-foreground truncate">{skill.title}</span>
                        <span className="text-[7px] text-muted-foreground uppercase">{skill.codec}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-4 border-t border-white/5 space-y-3">
                  <div className="flex items-center gap-2">
                    <BarChart size={12} className="text-muted-foreground" />
                    <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">{t.masterMetadata}</div>
                  </div>
                  <div className="space-y-1.5">
                    {[
                      { l: t.soft_skills.adapt, v: "ProRes 4444 XQ" },
                      { l: t.soft_skills.english, v: "H264" },
                      { l: t.soft_skills.team, v: "RAW" },
                      { l: lang === 'es' ? "Pensamiento Crítico" : "Critical Thinking", v: "UHD 8K" }
                    ].map(item => (
                      <div key={item.l} className="flex flex-col gap-0.5">
                        <div className="flex justify-between text-[7px] uppercase font-mono">
                          <span className="text-muted-foreground">{item.l}</span>
                          <span className="text-emerald-500">{item.v}</span>
                        </div>
                        <div className="h-[1px] bg-white/5 w-full"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* MONITOR (CENTER) */}
        <section className="col-span-12 md:col-span-7 flex flex-col overflow-hidden bg-panel-deep border border-black/50 relative">
          <div className="bg-panel-header px-3 py-1.5 border-b border-black flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <span className="text-[9px] font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                <Monitor size={10} className="text-muted-foreground" />
                {activeMode === 'color' ? (lang === 'es' ? 'Clip: Salida_Etalonaje_Maestro' : 'Clip: Master_Grade_Output') : (lang === 'es' ? 'Fuente: CV_Tania_Maestro.prproj' : 'Source: CV_Tania_Master.prproj')}
              </span>
              <span className="text-[8px] text-muted-foreground bg-black/40 px-1.5 rounded-sm hidden sm:inline">1920 x 1080 (1.0)</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[9px] text-muted-foreground font-mono tracking-tighter hidden sm:inline">Fit: 45%</span>
              <span className="text-[12px] font-mono font-bold transition-colors" style={{ color: headerInfo.accent }}>{getTimecode(playheadPos)}</span>
            </div>
          </div>

          <div className="flex-1 relative flex flex-col items-center justify-center overflow-hidden bg-black group">
            {/* Safe margins */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none flex items-center justify-center">
              <div className="w-[90%] h-[90%] border border-white/20 rounded-sm absolute"></div>
              <div className="w-[80%] h-[80%] border border-white/20 rounded-sm absolute"></div>
              <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/10"></div>
              <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/10"></div>
              <Crosshair size={24} className="text-white opacity-20" />
            </div>

            {activeMode === 'effects' && <div className="absolute inset-0 checkerboard opacity-10 pointer-events-none"></div>}

            {showWarning && activeMode === 'effects' && <AEWarning onOpenClassic={handleDownloadPDF} onClose={() => setShowWarning(false)} t={t} />}
            {showWarning && activeMode === 'editing' && <PRWarning onOpenClassic={handleDownloadPDF} onClose={() => setShowWarning(false)} t={t} />}
            {showWarning && activeMode === 'color' && <DRWarning onOpenClassic={handleDownloadPDF} onClose={() => setShowWarning(false)} t={t} />}

            {/* Experience Detail Overlay */}
            {selectedExp && (
              <div className="absolute inset-0 z-20 bg-[#0a0a0a] flex flex-col p-6 md:p-14 animate-in slide-in-from-bottom duration-300 overflow-y-auto custom-scrollbar">
                <div className="absolute top-4 left-4 flex flex-col gap-1 z-30">
                  <span className="text-[8px] text-muted-foreground font-mono">FORMAT: {activeMode === 'color' ? 'RAW 4:4:4' : 'PRORES 422 HQ'}</span>
                  <span className="text-[8px] text-muted-foreground font-mono">FPS: 23.976</span>
                  <span className="text-[8px] text-muted-foreground font-mono">COLOR: {activeMode === 'color' ? 'DA VINCI WIDE GAMUT' : 'REC.709'}</span>
                </div>
                <div className="flex items-start justify-between border-b border-white/20 pb-4 md:pb-8 mb-6 md:mb-10">
                  <div>
                    <h2 className="text-2xl md:text-5xl font-black text-foreground uppercase flex items-center gap-4 tracking-tighter">
                      <span style={{ color: headerInfo.accent }}>{getExpIcon(selectedExp.iconName, 32)}</span> {selectedExp.title}
                    </h2>
                    <p className="text-muted-foreground font-mono text-xs md:text-lg mt-2 uppercase tracking-[0.3em]">
                      {selectedExp.company} <span className="text-muted-foreground">|</span> {selectedExp.period}
                    </p>
                  </div>
                  <button onClick={() => setSelectedExp(null)} className="p-2 md:p-4 bg-white/5 hover:bg-destructive rounded-full text-foreground transition-all shadow-2xl">
                    <X size={24} />
                  </button>
                </div>
                <div className="flex-1 space-y-8 md:space-y-16">
                  {selectedExp.fullHistory.map((item, idx) => (
                    <div key={idx} className="group relative pl-8 md:pl-12 border-l-4 transition-colors py-2 md:py-4" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                      <div className="absolute -left-[12px] md:-left-[16px] top-4 w-5 h-5 md:w-7 md:h-7 rounded-full bg-[#0a0a0a] border-4 transition-all" style={{ borderColor: headerInfo.accent }}></div>
                      <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-3 md:gap-6 mb-3 md:mb-6">
                        <h3 className="text-xl md:text-4xl font-black text-foreground transition-colors tracking-tight group-hover:text-white">{item.label}</h3>
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border text-sm md:text-lg font-mono" style={{ borderColor: `${headerInfo.accent}33`, color: headerInfo.accent }}>
                          <Calendar size={16} /> {item.year}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-base md:text-2xl leading-relaxed font-light">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education Overlay */}
            {showEducation && (
              <div className="absolute inset-0 flex flex-col font-mono uppercase z-20 bg-panel-deep overflow-hidden animate-in fade-in duration-300">
                <div className="absolute inset-0 scanlines z-30 opacity-10 pointer-events-none"></div>
                <button onClick={() => setShowEducation(false)} className="absolute top-4 right-4 md:top-10 md:right-10 z-50 bg-black/50 p-2 md:p-4 rounded-full hover:bg-destructive text-foreground transition-colors">
                  <X size={24} />
                </button>
                <div className="absolute inset-0 h-full w-full flex opacity-60">
                  {['#e0e0e0', '#f0c000', '#00c0c0', '#2ecc71', '#e056fd', '#e74c3c', '#2980b9'].map((c, i) => (
                    <div key={i} className="flex-1" style={{ backgroundColor: c, height: '60%' }}></div>
                  ))}
                </div>
                <div className="absolute top-[8%] left-[4%] w-[90%] md:w-[65%] h-[60%] bg-black/90 backdrop-blur-xl border-l-8 border-premiere p-6 md:p-12 flex flex-col justify-center gap-6 md:gap-10 z-40 shadow-2xl">
                  {t.edu_data.map((edu, i) => (
                    <div key={i} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-10 border-b border-white/10 pb-4 md:pb-8 last:border-0">
                      <span className="text-premiere font-black text-2xl md:text-7xl">{edu.year}</span>
                      <span className="text-foreground font-bold text-base md:text-4xl tracking-tighter">{edu.label}</span>
                    </div>
                  ))}
                </div>
                <div className="h-[30%] w-full mt-auto flex z-40 bg-[#051c2c] items-center px-6 md:px-16 border-t border-white/20">
                  <div className="flex-[2]">
                    <h2 className="text-foreground text-2xl md:text-5xl font-black mb-2 tracking-tighter">{t.education_title}</h2>
                    <span className="text-premiere text-sm md:text-xl font-mono tracking-widest italic opacity-70">Salvatella.edu / {t.academicHistory}</span>
                  </div>
                  <div className="flex-1 flex justify-end">
                    <div className="flex items-center gap-3 md:gap-6 px-4 md:px-10 py-2 md:py-5 bg-black/40 rounded-2xl border border-emerald-500/40 shadow-2xl">
                      <div className="w-3 h-3 md:w-5 md:h-5 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-emerald-400 font-black tracking-widest text-sm md:text-2xl">DATA_READY</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Default monitor content */}
            <div className="text-center z-10 space-y-4 px-6 relative">
              <div className={`inline-block px-4 py-1 rounded text-[10px] font-black text-foreground uppercase tracking-[0.3em] shadow-lg ${isPlaying ? (activeMode === 'color' ? 'bg-davinci animate-pulse' : 'bg-emerald-600 animate-pulse') : 'bg-premiere/30 border border-premiere/20'}`}>
                {isPlaying ? t.playing : t.paused}
              </div>
              <h1 className="text-5xl md:text-9xl font-black tracking-tighter text-foreground leading-[0.85] uppercase pointer-events-none">Tania<br />Salvatella</h1>
              <p className="text-[12px] md:text-xl text-muted-foreground uppercase tracking-[0.4em] font-light italic pointer-events-none">{t.job_title}</p>
              <div className="h-16 flex items-center justify-center">
                <p className={`text-sm md:text-2xl text-muted-foreground max-w-lg italic font-serif transition-all duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}>"{t.phrases[phraseIndex]}"</p>
              </div>
            </div>

            <div className="absolute bottom-4 right-4 flex items-center gap-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-1">
                {['R', 'G', 'B', 'A'].map(c => <span key={c} className="text-[8px] text-muted-foreground font-bold border border-white/10 px-1 rounded-sm">{c}</span>)}
              </div>
              <span className="text-[9px] text-muted-foreground font-mono">16 bpc / Half Res</span>
            </div>
          </div>

          {/* Play controls */}
          <div className="p-2 border-t border-black bg-panel-header flex items-center justify-center gap-8 shrink-0 relative overflow-hidden">
            <div className="absolute left-4 hidden lg:flex items-center gap-2">
              <SkipBack size={14} className="text-muted-foreground cursor-pointer" />
              <div className="w-px h-3 bg-muted"></div>
              <SkipForward size={14} className="text-muted-foreground cursor-pointer" />
            </div>
            <button
              onClick={() => {
                const newPlaying = !isPlaying;
                setIsPlaying(newPlaying);
                if (newPlaying) setShowWarning(true);
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-foreground text-background scale-110 shadow-xl' : 'bg-secondary text-foreground hover:bg-muted'}`}
            >
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
            </button>
            <div className="absolute right-4 hidden lg:flex items-center gap-3">
              <Settings size={14} className="text-muted-foreground cursor-pointer" />
              <Maximize2 size={14} className="text-muted-foreground cursor-pointer" />
            </div>
          </div>
        </section>

        {/* INSPECTOR / NODES (RIGHT) */}
        <section className={`col-span-12 md:col-span-2 flex flex-col overflow-hidden ${activeMode === 'effects' ? 'bg-[#282828]' : activeMode === 'color' ? 'bg-panel-deep' : 'bg-[#232323]'} border border-black/50`}>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="flex justify-between items-center text-[10px] font-bold text-foreground mb-5 uppercase tracking-widest border-b border-black pb-2 sticky top-0 bg-inherit z-10">
              <div className="flex items-center gap-2">
                {activeMode === 'color' ? <Layers2 size={12} className="text-davinci" /> : <Sliders size={12} className={activeMode === 'effects' ? 'text-aftereffects' : 'text-premiere'} />}
                <span>{activeMode === 'color' ? t.nodes : t.inspector}</span>
              </div>
              <button className="text-[7px] text-muted-foreground uppercase">{lang === 'es' ? 'Resetear' : 'Reset'}</button>
            </div>

            {activeMode === 'color' ? (
              <div className="space-y-6 py-2">
                <div className="flex flex-col items-center gap-6 relative pb-4 mb-4 border-b border-white/5">
                  <div className="dr-node group w-16 h-10 rounded flex flex-col items-center justify-center relative border border-davinci/20">
                    <span className="text-[6px] text-davinci absolute -top-3">01: {t.nodeInput.toUpperCase()}</span>
                    <span className="text-[7px] font-bold text-secondary-foreground uppercase">{lang === 'es' ? 'Talento' : 'Talent'}</span>
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500 border border-black"></div>
                    <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500 border border-black"></div>
                  </div>
                  <div className="w-[1px] h-6 bg-emerald-500/30 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-emerald-500 rounded-full"></div>
                  </div>
                  <div className="dr-node group w-16 h-10 rounded border-davinci flex flex-col items-center justify-center relative shadow-[0_0_10px_rgba(243,156,18,0.2)]">
                    <span className="text-[6px] text-davinci absolute -top-3">02: {t.nodeGrading.toUpperCase()}</span>
                    <span className="text-[7px] font-bold text-secondary-foreground uppercase leading-none">{t.nodeAiTech}</span>
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500 border border-black"></div>
                    <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500 border border-black"></div>
                  </div>
                </div>
                <TechSkillsList t={t} activeMode={activeMode} />
              </div>
            ) : (
              <div className="space-y-6">
                <TechSkillsList t={t} activeMode={activeMode} />
                <div className="mt-8 text-center">
                  <div className="w-full h-24 border border-white/10 rounded flex flex-col items-center justify-center gap-2 opacity-30">
                    <BarChart size={24} />
                    <span className="text-[7px] uppercase font-black">{lang === 'es' ? 'Monitor Forma de Onda' : 'Waveform Monitor'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* TIMELINE */}
      <section className={`${activeMode === 'color' ? 'h-[280px]' : 'h-80'} bg-panel-deep border-t border-black flex overflow-hidden shrink-0`}>
        {activeMode === 'color' ? (
          <ColorTimeline
            t={t}
            selectedExp={selectedExp}
            setSelectedExp={setSelectedExp}
            wheelStates={wheelStates}
            onWheelMouseDown={(e, id) => { if (activeMode === 'color') setDraggingWheel(id); }}
            lang={lang}
          />
        ) : activeMode === 'effects' ? (
          <EffectsTimeline
            t={t}
            selectedExp={selectedExp}
            setSelectedExp={setSelectedExp}
            expandedLayers={expandedLayers}
            toggleLayerExpansion={(id) => setExpandedLayers(prev => ({ ...prev, [id]: !prev[id] }))}
            keyframes={keyframes}
            draggingKf={draggingKf}
            onKfMouseDown={(e, id) => { if (activeMode === 'effects') { e.preventDefault(); e.stopPropagation(); setDraggingKf(id); } }}
            playheadPos={playheadPos}
            timelineContentRef={timelineContentRef}
            lang={lang}
          />
        ) : (
          <EditingTimeline
            t={t}
            selectedExp={selectedExp}
            setSelectedExp={setSelectedExp}
            playheadPos={playheadPos}
            lang={lang}
          />
        )}

        {/* Audio meters */}
        <div className="w-16 md:w-24 bg-panel-header border-l border-black flex flex-col p-2 shrink-0">
          <div className="text-[7px] text-muted-foreground font-black mb-1 uppercase tracking-tighter text-center">
            {lang === 'es' ? 'Nivel Audio' : 'Audio Level'}
          </div>
          <div className="flex-1 flex justify-center gap-1.5 px-2">
            {[0, 1].map(i => (
              <div key={i} className="w-2 bg-black rounded-sm relative overflow-hidden flex flex-col justify-end border border-white/5">
                <div
                  className={`w-full bg-gradient-to-t from-emerald-500 via-yellow-400 to-red-600 ${isPlaying ? 'meter-bar' : ''}`}
                  style={{ animationDuration: `${0.2 + i * 0.1}s`, height: isPlaying ? undefined : '15%' }}
                ></div>
                <div className="absolute inset-x-0 h-px bg-white/10" style={{ top: '20%' }}></div>
                <div className="absolute inset-x-0 h-px bg-white/10" style={{ top: '50%' }}></div>
                <div className="absolute inset-x-0 h-px bg-white/10" style={{ top: '80%' }}></div>
              </div>
            ))}
          </div>
          <div className="text-[7px] text-muted-foreground font-mono text-center mt-1">-∞ dB</div>
          <div className="mt-auto pt-2 border-t border-white/5 text-center">
            <div className="flex items-center justify-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'}`}></div>
              <span className="text-[7px] text-muted-foreground uppercase font-black">{isPlaying ? t.rendering : t.systemReady}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// --- Sub-components ---

const TechSkillsList = ({ t, activeMode }: { t: any; activeMode: Mode }) => (
  <div className="space-y-6">
    <div>
      <div className="flex items-center gap-2 text-[10px] font-black uppercase mb-3">
        {activeMode === 'color' ? <Zap size={12} className="text-davinci" /> : <Code size={12} className="text-premiere" />}
        <span className={activeMode === 'color' ? 'text-davinci/80' : 'text-premiere'}>{t.techPipeline}</span>
      </div>
      <div className="space-y-1.5 font-mono">
        {t.techSkills.map((skill: any) => (
          <div key={skill.n} className={`flex flex-col gap-1 p-1 hover:bg-white/5 transition-colors ${activeMode === 'color' ? '' : 'bg-black/30 rounded border border-white/5'}`}>
            <div className="flex justify-between text-[8px] uppercase">
              <span className="text-muted-foreground">{skill.n}</span>
              <span className={activeMode === 'color' ? 'text-davinci' : 'text-premiere'}>{skill.v}</span>
            </div>
            <div className="h-[2px] w-full bg-black/40 rounded-full overflow-hidden">
              <div
                className={`h-full ${activeMode === 'color' ? 'bg-davinci/60' : 'bg-premiere/60'}`}
                style={{ width: skill.v === 'EXPERT' || skill.v === 'EXPERTO' ? '95%' : skill.v === 'PRO' ? '85%' : '70%' }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
    <div className="pt-2">
      <div className="flex items-center gap-2 text-[10px] text-aftereffects font-black uppercase mb-3"><Sparkles size={12} /> {t.genAiEngine}</div>
      <div className="grid grid-cols-2 gap-1.5">
        {t.genAiModels.map((item: string) => (
          <div key={item} className="bg-aftereffects/10 border border-aftereffects/20 text-[8px] text-center py-1.5 text-aftereffects rounded font-bold uppercase tracking-tighter hover:bg-aftereffects/20 cursor-default">
            {item}
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ColorTimeline = ({ t, selectedExp, setSelectedExp, wheelStates, onWheelMouseDown, lang }: any) => (
  <div className="flex-1 flex flex-col bg-[#121212]">
    <div className="h-20 bg-panel-header border-b border-black flex items-center px-4 gap-3 overflow-x-auto no-scrollbar">
      {t.exp_data.map((exp: ExperienceItem, idx: number) => (
        <div key={exp.id} onClick={() => setSelectedExp(exp)}
          className={`w-32 h-14 shrink-0 rounded border transition-all flex flex-col overflow-hidden group cursor-pointer ${selectedExp?.id === exp.id ? 'border-davinci shadow-[0_0_15px_rgba(243,156,18,0.2)]' : 'border-white/5'}`}>
          <div className="flex-1 bg-black/40 flex flex-col items-center justify-center relative">
            <span className="text-[14px] text-muted-foreground font-black z-10">{idx + 1}</span>
            <span className="text-[7px] text-davinci/30 font-mono">00:00:1{idx}:00</span>
          </div>
          <div className={`h-4 text-[8px] flex items-center px-2 font-bold uppercase truncate ${selectedExp?.id === exp.id ? 'bg-davinci text-black' : 'bg-secondary text-muted-foreground'}`}>
            {exp.title}
          </div>
        </div>
      ))}
    </div>
    <div className="flex-1 flex items-center justify-around px-4 md:px-8 flex-wrap gap-4">
      {(['lift', 'gamma', 'gain'] as const).map(wheelId => (
        <div key={wheelId} className="flex flex-col items-center gap-3">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{wheelId}</span>
          <div
            id={`wheel-${wheelId}`}
            className="dr-wheel w-20 h-20 md:w-28 md:h-28 rounded-full flex items-center justify-center relative border border-white/10 group cursor-crosshair"
            onMouseDown={(e) => onWheelMouseDown(e, wheelId)}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-500/5 to-davinci/5 rounded-full"></div>
            <div
              className="w-2.5 h-2.5 rounded-full bg-davinci absolute border border-white/40 shadow-[0_0_10px_rgba(243,156,18,0.8)] pointer-events-none transition-transform group-hover:scale-125"
              style={{ left: `${wheelStates[wheelId].x}%`, top: `${wheelStates[wheelId].y}%`, transform: 'translate(-50%, -50%)' }}
            ></div>
          </div>
          <div className="flex gap-4 text-[8px] font-mono text-muted-foreground">
            <span>X: {(wheelStates[wheelId].x - 50).toFixed(2)}</span>
            <span>Y: {(wheelStates[wheelId].y - 50).toFixed(2)}</span>
          </div>
        </div>
      ))}
      <div className="hidden md:flex flex-col gap-2 ml-8 border-l border-white/5 pl-8">
        {[{ l: lang === 'es' ? "Contraste" : "Contrast", v: "1.04" }, { l: "Pivot", v: "0.43" }, { l: lang === 'es' ? "Saturación" : "Sat", v: "52.0" }].map(s => (
          <div key={s.l} className="flex flex-col gap-1 group">
            <div className="flex justify-between items-center text-[7px] uppercase font-bold text-muted-foreground">
              <span>{s.l}</span>
              <span className="text-davinci/70">{s.v}</span>
            </div>
            <div className="w-32 h-[2px] bg-black/50 rounded flex items-center">
              <div className="h-full bg-davinci" style={{ width: '50%' }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const EffectsTimeline = ({ t, selectedExp, setSelectedExp, expandedLayers, toggleLayerExpansion, keyframes, draggingKf, onKfMouseDown, playheadPos, timelineContentRef, lang }: any) => (
  <div className="flex-1 flex overflow-hidden bg-[#1C1C1C]">
    <div className="w-[200px] md:w-[450px] border-r border-black flex flex-col shrink-0">
      <div className="h-8 bg-secondary border-b border-black flex items-center px-2 text-[9px] font-bold text-muted-foreground uppercase shrink-0">
        <div className="w-6"><Eye size={10} /></div>
        <div className="w-12 ml-2">{t.layerLabel}</div>
        <div className="flex-1 hidden md:block">{lang === 'es' ? 'Padre y Enlace' : 'Parent & Link'}</div>
        <div className="w-16 text-center hidden md:block">In/Out</div>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar custom-scrollbar">
        {t.exp_data.map((exp: ExperienceItem, idx: number) => (
          <React.Fragment key={exp.id}>
            <div onClick={() => setSelectedExp(exp)}
              className={`h-7 border-b border-black/30 flex items-center px-2 text-[11px] cursor-pointer transition-colors ${selectedExp?.id === exp.id ? 'bg-[#4B4B4B] shadow-inner' : 'hover:bg-[#2A2A2A]'}`}>
              <div className="w-6 flex justify-center text-muted-foreground"><Eye size={10} /></div>
              <div className="w-5 h-full flex items-center justify-center" onClick={(e) => { e.stopPropagation(); toggleLayerExpansion(exp.id); }}>
                {expandedLayers[exp.id] ? <ChevronDown size={14} className="text-secondary-foreground" /> : <ChevronRight size={14} className="text-muted-foreground" />}
              </div>
              <div className="w-2 h-full mx-1" style={{ backgroundColor: exp.labelAe }}></div>
              <div className="flex-1 px-2 text-secondary-foreground truncate font-medium flex items-center justify-between pr-4">
                <div className="truncate"><span className="text-[9px] text-muted-foreground mr-2 font-mono">{idx + 1}</span> {exp.title}</div>
                <span className="text-[7px] text-muted-foreground font-mono hidden md:inline">00:00:00:00</span>
              </div>
            </div>
            {expandedLayers[exp.id] && (
              <div className="bg-[#181818] border-b border-black/30 pb-1">
                {[lang === 'es' ? "Posición" : "Position", lang === 'es' ? "Escala" : "Scale", lang === 'es' ? "Opacidad" : "Opacity"].map((prop) => (
                  <div key={prop} className="h-6 flex items-center pl-16 text-[10px] text-muted-foreground hover:bg-white/5 group border-l-2 border-aftereffects/20">
                    <div className="flex-1 flex items-center gap-2">
                      <Zap size={8} className="text-muted-foreground" /> {prop}
                    </div>
                    <div className="text-premiere px-4 font-mono text-[9px] cursor-ew-resize hover:text-foreground transition-colors hidden md:block">
                      {prop === 'Scale' || prop === 'Escala' ? '100.0, 100.0 %' : prop === 'Opacity' || prop === 'Opacidad' ? '100 %' : '960.0, 540.0'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
    <div className="flex-1 flex flex-col overflow-hidden relative" ref={timelineContentRef}>
      <div className="h-8 bg-secondary border-b border-black flex items-center px-6 text-[8px] text-muted-foreground font-mono tracking-widest shrink-0 gap-[160px]">
        <span>00:00:00:00</span><span>00:00:05:00</span><span className="hidden md:inline">00:00:10:00</span>
      </div>
      <div className="relative flex-1 overflow-x-auto p-0 no-scrollbar">
        <div className="min-w-[1500px] h-full">
          {t.exp_data.map((exp: ExperienceItem, idx: number) => (
            <React.Fragment key={`bars-${exp.id}`}>
              <div className="h-7 border-b border-black/10 relative">
                <div className={`absolute h-4 top-1.5 rounded pr-clip transition-all ${selectedExp?.id === exp.id ? 'brightness-125 saturate-150 z-10' : ''}`}
                  style={{ left: `${10 + idx * 12}%`, width: '40%', backgroundColor: exp.labelAe }}
                  onClick={() => setSelectedExp(exp)}>
                </div>
              </div>
              {expandedLayers[exp.id] && (
                <>
                  <div className="h-6 border-b border-black/5 bg-[#141414]"></div>
                  <div className="h-6 border-b border-black/5 bg-[#141414]"></div>
                  <div className="h-6 border-b border-black/5 bg-[#141414]"></div>
                  <div className="h-6 border-b border-black/10 bg-[#141414] relative">
                    {keyframes.map((kf: any) => kf.layerId === exp.id && (
                      <div key={kf.id} className="absolute top-1/2 -translate-y-1/2 z-40 p-1 cursor-ew-resize"
                        style={{ left: `${kf.pos}%` }}
                        onMouseDown={(e) => onKfMouseDown(e, kf.id)}>
                        <svg width="12" height="12" viewBox="0 0 100 100" className="ae-keyframe">
                          <rect x="25" y="25" width="50" height="50" fill={draggingKf === kf.id ? "#fff" : "#31A8FF"} transform="rotate(45 50 50)" />
                        </svg>
                      </div>
                    ))}
                    <div className="absolute top-1/2 -translate-y-1/2 h-[1px] bg-premiere/10 w-full"></div>
                  </div>
                </>
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="absolute top-0 bottom-0 w-[1px] bg-premiere z-30 pointer-events-none shadow-[0_0_10px_rgba(49,168,255,0.5)]" style={{ left: `${playheadPos}%` }}>
          <div className="w-3.5 h-3.5 bg-premiere -ml-[6px] rounded-full border-2 border-white/20"></div>
        </div>
        <div className="absolute inset-x-0 h-4 bg-premiere/5 top-0 border-b border-premiere/10 text-[7px] text-premiere font-mono px-4 flex items-center pointer-events-none">
          {lang === 'es' ? 'Previsualización en Caché: 8GB RAM' : 'Preview Cached: 8GB RAM'}
        </div>
      </div>
    </div>
  </div>
);

const EditingTimeline = ({ t, selectedExp, setSelectedExp, playheadPos, lang }: any) => (
  <div className="flex-1 flex overflow-hidden bg-panel-deep">
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="h-8 bg-secondary flex items-center px-6 border-b border-black justify-between shrink-0">
        <div className="flex items-center gap-6">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <List size={10} /> CV_Tania_2026.prproj
          </span>
        </div>
        <div className="flex gap-4 text-[9px] text-muted-foreground font-mono hidden md:flex">
          <span>Timebase: 23.976 fps</span>
          <span>Sample: 48000 Hz</span>
        </div>
      </div>
      <div className="relative flex-1 overflow-x-auto p-3 no-scrollbar">
        <div className="absolute top-0 bottom-0 w-[1.5px] bg-premiere z-30 pointer-events-none shadow-[0_0_8px_rgba(49,168,255,0.4)]" style={{ left: `${playheadPos}%` }}>
          <div className="w-4 h-4 bg-premiere -ml-[7px] text-foreground flex items-center justify-center text-[9px] font-black rounded-b-sm border-b-2 border-white/20">▾</div>
        </div>
        <div className="min-w-[1500px] h-full space-y-3">
          <div className="flex h-16 border-b border-black/50 bg-[#141414]/50 relative group">
            <div className="w-20 h-full bg-[#232323] border-r border-black flex flex-col items-center justify-center text-[10px] text-muted-foreground font-bold shrink-0 relative">
              <div className="absolute top-1 right-1"><Lock size={8} /></div>
              <span>V1</span>
              <Eye size={10} className="mt-1" />
            </div>
            <div className="flex-1 flex gap-1 p-1">
              {t.exp_data.map((exp: ExperienceItem) => (
                <div key={exp.id} onClick={() => setSelectedExp(exp)}
                  className={`h-full flex-1 border border-black/20 rounded flex flex-col items-center justify-center cursor-pointer transition-all pr-clip relative group ${selectedExp?.id === exp.id ? 'brightness-125 saturate-150 border-white/40 ring-1 ring-white/20' : 'hover:brightness-110'}`}
                  style={{ backgroundColor: exp.labelPr }}>
                  <span className="text-[10px] font-black text-black/40 uppercase tracking-widest">{exp.title}</span>
                  <span className="text-[7px] text-black/30 font-mono mt-1">PRORES_422.mov</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex h-14 bg-[#141414]/50 border-b border-black/50">
            <div className="w-20 h-full bg-[#232323] border-r border-black flex flex-col items-center justify-center text-[10px] text-muted-foreground font-bold shrink-0">
              <span className="text-emerald-500">A1</span>
              <span className="text-[8px] uppercase tracking-tighter opacity-50">Master</span>
            </div>
            <div className="flex-1 p-1">
              <div className="h-full w-full rounded flex items-center px-4 overflow-hidden pr-clip" style={{ backgroundColor: '#2d4b31', border: '1px solid rgba(255,255,255,0.05)' }}>
                <svg className="w-full h-8 opacity-40" preserveAspectRatio="none">
                  {Array.from({ length: 400 }).map((_, i) => (
                    <rect key={i} x={`${(i / 400) * 100}%`} y={`${50 - Math.random() * 40}%`} width="0.1%" height={`${Math.random() * 80}%`} fill="#90EE90" />
                  ))}
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Index;
