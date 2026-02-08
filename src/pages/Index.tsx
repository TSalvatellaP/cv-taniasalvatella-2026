import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Settings, Sparkles,
  Monitor, Maximize2, Volume2,
  Eye, Lock, ChevronRight, ChevronDown,
  Sliders, Film, GraduationCap, Calendar, Code, Zap,
  Folder, List, Filter, Share, X, Circle,
  Activity, Grid, Radio, Camera, Crosshair, BarChart,
  Layers2, Languages, BookOpen, BrainCircuit, Users, MessageSquare, Video, Search,
  WifiOff, Mic, Image as ImageIcon
} from 'lucide-react';
import { generateCV } from '@/utils/generateCV';
import { translations, type ExperienceItem } from '@/data/translations';
import { ResolveIcon, AdobeAeIcon, AdobePrIcon, AeCompIcon, PrSequenceIcon, DrSequenceIcon, AeDiamondKeyframe } from '@/components/cv/CvIcons';
import { ExportModal } from '@/components/cv/ExportModal';
import { AEWarning, PRWarning, DRWarning } from '@/components/cv/Warnings';
import { ExperienceDetailMonitor } from '@/components/cv/ExperienceDetailMonitor';

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
  const [currentFolder, setCurrentFolder] = useState('root');
  const [playheadPos, setPlayheadPos] = useState(30);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [activeProjectTab, setActiveProjectTab] = useState('project');
  const [expandedLayers, setExpandedLayers] = useState<Record<string, boolean>>({ motion: true });

  // AE dragging
  const [aeLayerOffsets, setAeLayerOffsets] = useState<Record<string, number>>({});
  const [draggingAeLayer, setDraggingAeLayer] = useState<{ id: string; startX: number; initialOffset: number } | null>(null);
  const [aeKeyframes, setAeKeyframes] = useState<{ id: string; layerId: string; propIdx: number; pos: number; selected: boolean }[]>([]);
  const [draggingKeyframe, setDraggingKeyframe] = useState<{ id: string; startX: number; initialPos: number } | null>(null);

  // Signal status
  const [signalStatus, setSignalStatus] = useState<'LIVE' | 'POOR' | 'FROZEN'>('LIVE');

  // Legacy keyframes & wheels
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
  const timelineRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  // Initialize AE keyframes
  useEffect(() => {
    if (aeKeyframes.length === 0 && t.exp_data.length > 0) {
      const newKfs: typeof aeKeyframes = [];
      let idCount = 0;
      t.exp_data.forEach(exp => {
        [0, 1, 2, 3, 4].forEach(propIdx => {
          newKfs.push({ id: `kf-${idCount++}`, layerId: exp.id, propIdx, pos: 10 + (propIdx * 5), selected: propIdx === 0 });
          newKfs.push({ id: `kf-${idCount++}`, layerId: exp.id, propIdx, pos: 30 + (propIdx * 8), selected: false });
          newKfs.push({ id: `kf-${idCount++}`, layerId: exp.id, propIdx, pos: 60 - (propIdx * 2), selected: false });
        });
      });
      setAeKeyframes(newKfs);
    }
  }, [t.exp_data, aeKeyframes.length]);

  // Signal status cycle
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const cycleSignal = () => {
      if (signalStatus === 'LIVE') {
        setSignalStatus('POOR');
        timeout = setTimeout(cycleSignal, Math.random() * 1000 + 500);
      } else if (signalStatus === 'POOR') {
        setSignalStatus('FROZEN');
        timeout = setTimeout(cycleSignal, Math.random() * 2000 + 1000);
      } else {
        setSignalStatus('LIVE');
        timeout = setTimeout(cycleSignal, Math.random() * 5000 + 4000);
      }
    };
    timeout = setTimeout(cycleSignal, 3000);
    return () => clearTimeout(timeout);
  }, [signalStatus]);

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
    const timelineWidth = timelineRef.current ? timelineRef.current.scrollWidth : 1000;

    if (draggingKeyframe) {
      const diff = e.clientX - draggingKeyframe.startX;
      const percentChange = (diff / timelineWidth) * 100;
      setAeKeyframes(prev => prev.map(k =>
        k.id === draggingKeyframe.id
          ? { ...k, pos: Math.max(0, Math.min(100, draggingKeyframe.initialPos + percentChange)) }
          : k
      ));
      return;
    }

    if (draggingAeLayer) {
      const diff = e.clientX - draggingAeLayer.startX;
      const percentChange = (diff / timelineWidth) * 100;
      setAeLayerOffsets(prev => ({
        ...prev,
        [draggingAeLayer.id]: Math.max(0, (draggingAeLayer.initialOffset || 0) + percentChange)
      }));
      return;
    }

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
  }, [draggingKf, draggingWheel, draggingKeyframe, draggingAeLayer]);

  const handleGlobalMouseUp = useCallback(() => {
    setDraggingKf(null);
    setDraggingWheel(null);
    setDraggingAeLayer(null);
    setDraggingKeyframe(null);
  }, []);

  const handleDownloadPDF = () => {
    generateCV(lang as 'es' | 'en');
    setShowWarning(false);
  };

  const getHeaderInfo = () => {
    switch (activeMode) {
      case 'color': return { icon: <ResolveIcon />, title: "DaVinci Resolve - Tania_Salvatella_CV.drp", accent: "#f39c12", bg: "bg-[#121212]" };
      case 'effects': return { icon: <AdobeAeIcon />, title: "After Effects - Tania_Salvatella_CV.aep", accent: "#D8A5FA", bg: "bg-[#161616]" };
      default: return { icon: <AdobePrIcon />, title: "Premiere Pro - Tania_Salvatella_CV.prproj", accent: "#3EA6F2", bg: "bg-[#232323]" };
    }
  };

  const headerInfo = getHeaderInfo();

  const softSkills = [
    { id: "english", title: t.soft_skills.english, icon: <BookOpen size={14} />, color: "#3EA6F2", level: t.skill_levels.weak, codec: "Global_Lang" },
    { id: "creativity", title: t.soft_skills.creativity, icon: <BrainCircuit size={14} />, color: "#D8A5FA", level: t.skill_levels.native, codec: "Visual_Craft" },
    { id: "team", title: t.soft_skills.team, icon: <Users size={14} />, color: "#f39c12", level: t.skill_levels.love, codec: "Agile_Sync" },
    { id: "comm", title: t.soft_skills.comm, icon: <MessageSquare size={14} />, color: "#10b981", level: t.skill_levels.high, codec: "Client_Rel" },
    { id: "adapt", title: t.soft_skills.adapt, icon: <MessageSquare size={14} />, color: "#10b981", level: t.skill_levels.shifts, codec: "Flex_Ops" }
  ];

  const tabs = activeMode === 'color'
    ? [{ id: 'project', label: lang === 'es' ? 'Galería' : 'Gallery' }, { id: 'skills', label: lang === 'es' ? 'Contenedor Medios' : 'Media Pool' }]
    : activeMode === 'effects'
    ? [{ id: 'project', label: lang === 'es' ? 'Proyecto' : 'Project' }, { id: 'skills', label: lang === 'es' ? 'Librería Activos' : 'Assets Library' }]
    : [{ id: 'project', label: lang === 'es' ? 'Bandeja Proyecto' : 'Project Bin' }, { id: 'skills', label: lang === 'es' ? 'Navegador Medios' : 'Media Browser' }];

  const isEducationSelected = selectedExp?.type === 'education' || selectedExp?.id === 'edu_comp';
  const isVideoSelected = selectedExp?.type === 'video';
  const isJobSelected = selectedExp && !isEducationSelected && !isVideoSelected;

  return (
    <div
      className={`min-h-screen ${headerInfo.bg} font-sans text-sm flex flex-col transition-colors duration-300 select-none md:h-screen md:overflow-hidden`}
      onMouseMove={handleGlobalMouseMove}
      onMouseUp={handleGlobalMouseUp}
    >
      {showExportModal && <ExportModal onClose={() => setShowExportModal(false)} lang={lang} />}
      {isJobSelected && selectedExp && (
        <ExperienceDetailMonitor
          experience={selectedExp}
          onClose={() => setSelectedExp(null)}
          accentColor={headerInfo.accent}
          mode={activeMode}
          getExpIcon={getExpIcon}
        />
      )}

      {/* HEADER NAV */}
      <nav className="h-10 bg-secondary border-b border-black flex items-center justify-between px-2 md:px-4 z-50 shrink-0">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-5 h-5">{headerInfo.icon}</div>
            <span className="text-[10px] font-bold text-foreground uppercase tracking-tighter truncate max-w-[150px] md:max-w-none">{headerInfo.title}</span>
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
              className={`px-3 md:px-6 text-[8px] md:text-[10px] uppercase font-bold tracking-widest transition-all h-full flex items-center ${
                activeMode === m
                  ? (m === 'effects' ? 'tab-active-ae' : m === 'color' ? 'tab-active-dr' : 'tab-active-pr')
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
            className="flex items-center gap-2 px-2 md:px-3 py-1 rounded-sm text-[9px] md:text-[10px] font-black uppercase tracking-widest bg-white/10 text-secondary-foreground hover:bg-white/20 transition-all border border-white/5"
          >
            <Languages size={12} /> <span className="hidden md:inline">{t.lang}</span><span className="md:hidden">{lang.toUpperCase()}</span>
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className={`flex items-center gap-2 px-2 md:px-3 py-1 rounded-sm text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${
              activeMode === 'effects' ? 'bg-aftereffects text-black hover:bg-white'
              : activeMode === 'color' ? 'bg-davinci text-black hover:bg-white'
              : 'bg-premiere text-white hover:bg-white hover:text-black'
            }`}
          >
            <Share size={12} /> <span className="hidden md:inline">{t.export}</span>
          </button>
          <button className={`hidden md:flex items-center gap-1 text-[10px] ${isAudioActive ? (activeMode === 'color' ? 'text-davinci' : 'text-emerald-400') : 'text-muted-foreground'}`} onClick={toggleAudio}>
            <Volume2 size={12} /> {isAudioActive ? 'ON' : 'OFF'}
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col md:grid md:grid-cols-12 gap-0.5 md:overflow-hidden p-0.5 bg-black overflow-y-auto">
        {/* PROJECT BIN (LEFT) */}
        <section className={`order-2 md:order-1 col-span-12 md:col-span-3 flex flex-col overflow-hidden ${activeMode === 'effects' ? 'bg-[#232323]' : activeMode === 'color' ? 'bg-panel-deep' : 'bg-[#232323]'} border border-black/50 h-64 md:h-auto`}>
          <div className={`p-0 border-b border-black flex items-center justify-between ${activeMode === 'color' ? 'bg-[#1a1a1a]' : 'bg-panel-header'} shrink-0`}>
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
            <div className={`h-6 flex items-center px-4 border-b border-black text-[8px] text-muted-foreground font-bold uppercase tracking-tighter shrink-0 ${activeMode === 'color' ? 'bg-[#151515]' : 'bg-panel-header'}`}>
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
                  <div key={exp.id} onClick={() => { setSelectedExp(exp); }}
                    className={`group flex items-center p-1 rounded-sm cursor-pointer transition-all ${
                      selectedExp?.id === exp.id
                        ? activeMode === 'effects' ? 'bg-[#4B4B4B] text-aftereffects'
                          : activeMode === 'color' ? 'bg-[#333] border border-davinci/50'
                          : 'bg-[#383838] text-foreground border-l-2 border-premiere'
                        : 'hover:bg-white/5 text-muted-foreground hover:text-foreground'
                    }`}>
                    <div className="w-[50%] flex items-center gap-2 px-1 truncate">
                      {activeMode === 'effects' ? (
                        <AeCompIcon color={selectedExp?.id === exp.id ? "#D8A5FA" : "#888"} />
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
                {currentFolder === 'proyectos' && (
                  <div className="grid grid-cols-2 gap-2 p-2 bg-black/20 mt-1 border border-white/5 rounded">
                    {t.art_data.map(proj => (
                      <div key={proj.id} onClick={() => { setSelectedExp(proj); }}
                        className={`group flex flex-col cursor-pointer transition-all border border-transparent hover:border-white/20 rounded overflow-hidden ${selectedExp?.id === proj.id ? 'ring-1 ring-white/40' : ''}`}>
                        <div className="aspect-video bg-[#0f0f0f] relative flex items-center justify-center overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-black/0 to-black/80"></div>
                          <div className="w-full h-full opacity-30 flex flex-col">
                            <div className="flex-1" style={{ backgroundColor: proj.color, opacity: 0.2 }}></div>
                            <div className="flex-1 bg-[#1a1a1a]"></div>
                          </div>
                          <Play size={16} className="absolute text-white/50 group-hover:text-white group-hover:scale-125 transition-all" />
                          <span className="absolute bottom-1 right-1 text-[8px] font-mono text-muted-foreground bg-black/60 px-1 rounded">{proj.duration}</span>
                        </div>
                        <div className={`p-1.5 text-[9px] truncate font-medium flex items-center gap-1 ${selectedExp?.id === proj.id ? 'bg-premiere text-white' : 'bg-[#232323] text-secondary-foreground'}`}>
                          <ImageIcon size={8} className="opacity-70" />
                          <span className="truncate">{proj.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div onClick={() => { setSelectedExp({ type: 'education', id: 'edu_comp', title: t.eduComp } as any); }}
                  className={`group flex items-center p-1 rounded-sm cursor-pointer transition-all ${
                    isEducationSelected
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
              </div>
            )}
          </div>
        </section>

        {/* MONITOR (CENTER) */}
        <section className="order-1 md:order-2 col-span-12 md:col-span-7 flex flex-col overflow-hidden bg-panel-deep border border-black/50 relative h-[50vh] md:h-auto min-h-[300px]">
          <div className={`px-3 py-1.5 border-b border-black flex items-center justify-between shrink-0 ${activeMode === 'color' ? 'bg-[#1a1a1a]' : 'bg-panel-header'}`}>
            <div className="flex items-center gap-4">
              <span className="text-[9px] font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                <Monitor size={10} className="text-muted-foreground" />
                <span className="truncate max-w-[120px] md:max-w-none">
                  {activeMode === 'color' ? (lang === 'es' ? 'Clip: Salida_Maestro' : 'Clip: Master_Output') : (lang === 'es' ? 'Fuente: CV_Tania.prproj' : 'Source: CV_Tania.prproj')}
                </span>
              </span>
              <span className="hidden md:inline text-[8px] text-muted-foreground bg-black/40 px-1.5 rounded-sm">1920 x 1080 (1.0)</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden md:inline text-[9px] text-muted-foreground font-mono tracking-tighter">Fit: 45%</span>
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

            {/* MONITOR CONTENT */}
            <div className="text-center z-10 space-y-4 px-6 relative w-full flex flex-col items-center justify-center h-full">
              {isEducationSelected ? (
                /* EDUCATION VIEW WITH SMPTE BARS */
                <div className="w-full h-full relative bg-black font-mono flex flex-col">
                  <div className="absolute inset-0 flex flex-col pointer-events-none opacity-50">
                    <div className="h-[67%] flex w-full">
                      <div className="bg-[#c0c0c0] flex-1"></div>
                      <div className="bg-[#c0c000] flex-1"></div>
                      <div className="bg-[#00c0c0] flex-1"></div>
                      <div className="bg-[#00c000] flex-1"></div>
                      <div className="bg-[#c000c0] flex-1"></div>
                      <div className="bg-[#c00000] flex-1"></div>
                      <div className="bg-[#0000c0] flex-1"></div>
                    </div>
                    <div className="h-[8%] flex w-full">
                      <div className="bg-[#0000c0] flex-1"></div>
                      <div className="bg-[#131313] flex-1"></div>
                      <div className="bg-[#c000c0] flex-1"></div>
                      <div className="bg-[#131313] flex-1"></div>
                      <div className="bg-[#00c0c0] flex-1"></div>
                      <div className="bg-[#131313] flex-1"></div>
                      <div className="bg-[#c0c0c0] flex-1"></div>
                    </div>
                    <div className="h-[25%] flex w-full">
                      <div className="bg-[#00214c] flex-[1.2]"></div>
                      <div className="bg-[#ffffff] flex-[1.2]"></div>
                      <div className="bg-[#32006a] flex-[1.2]"></div>
                      <div className="bg-[#131313] flex-[4]"></div>
                    </div>
                  </div>

                  <div className="absolute inset-0 z-10 p-8 flex flex-col justify-center items-start text-foreground bg-black/40 backdrop-blur-sm overflow-y-auto custom-scrollbar">
                    <div className="w-full flex justify-between items-end border-b-4 border-white mb-6 pb-2">
                      <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter bg-black/50 px-2">{t.education_title}</h2>
                      <span className="text-xs md:text-sm font-mono bg-black/50 px-2">REF: EDU_SEQ_01</span>
                    </div>
                    <div className="space-y-6 w-full max-w-4xl mx-auto">
                      {t.edu_data.map((edu, i) => (
                        <div key={i} className="flex flex-col md:flex-row gap-2 md:gap-6 items-baseline group w-full bg-black/30 p-2 hover:bg-black/60 transition-colors">
                          <span className="text-premiere font-black text-xl md:text-2xl w-24 shrink-0">{edu.year}</span>
                          <div className="flex-1 border-b border-white/20 pb-2 group-hover:border-white/60 transition-colors w-full">
                            <span className="text-sm md:text-lg font-bold uppercase tracking-tight">{edu.label}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-auto pt-8 text-[10px] font-mono text-muted-foreground w-full flex justify-between bg-black/50 p-2">
                      <span>SMPTE UNIVERSAL LEADER</span>
                      <span>TC: {getTimecode(playheadPos)}</span>
                    </div>
                  </div>
                </div>
              ) : isVideoSelected && selectedExp ? (
                /* VIDEO PLAYBACK with signal effects */
                <div className="w-full h-full absolute inset-0 bg-black flex flex-col items-center justify-center animate-in fade-in duration-500 overflow-hidden">
                  <div className={`absolute inset-0 opacity-40 transition-all duration-300 ${signalStatus === 'POOR' ? 'signal-pixelated' : ''} ${signalStatus === 'FROZEN' ? 'signal-frozen' : ''}`}
                    style={{ background: `radial-gradient(circle at center, ${selectedExp.color}20 0%, transparent 70%)` }}></div>

                  <div className="relative z-10 text-center space-y-4">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded text-[10px] font-black tracking-widest border transition-all duration-300
                      ${signalStatus === 'LIVE' ? 'bg-red-600/20 text-red-500 border-red-500/30 animate-pulse' :
                        signalStatus === 'POOR' ? 'bg-yellow-600/20 text-yellow-500 border-yellow-500/30' : 'bg-[#333]/50 text-muted-foreground border-muted/30'}`}>
                      <Circle size={8} fill="currentColor" />
                      {signalStatus === 'LIVE' ? 'REC [PLAY]' : signalStatus === 'POOR' ? 'POOR SIGNAL' : 'CONNECTION LOST'}
                    </div>
                    <h2 className={`text-3xl md:text-5xl font-black text-foreground uppercase tracking-tight transition-all duration-100 ${signalStatus === 'POOR' ? 'signal-pixelated blur-sm scale-105' : ''} ${signalStatus === 'FROZEN' ? 'opacity-50' : ''}`}>
                      {selectedExp.title}
                    </h2>
                    <p className="text-muted-foreground font-mono text-xs">{selectedExp.duration} • 4K RAW • S-LOG3</p>

                    {signalStatus !== 'LIVE' && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        {signalStatus === 'POOR' ? <WifiOff size={48} className="text-yellow-500/50 animate-pulse" /> : <div className="w-12 h-12 border-4 border-muted border-t-foreground rounded-full animate-spin"></div>}
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <SkipBack className="text-foreground hover:text-premiere cursor-pointer" />
                    <Pause className="text-foreground hover:text-premiere cursor-pointer" />
                    <SkipForward className="text-foreground hover:text-premiere cursor-pointer" />
                  </div>
                </div>
              ) : (
                /* Default Welcome with signal */
                <>
                  <div className={`inline-block px-4 py-1 rounded text-[8px] md:text-[10px] font-black text-foreground uppercase tracking-[0.3em] shadow-lg transition-all duration-500
                    ${signalStatus === 'LIVE' ? (isPlaying ? (activeMode === 'color' ? 'bg-davinci animate-pulse' : 'bg-emerald-600 animate-pulse') : 'bg-premiere/30 border border-premiere/20') :
                      signalStatus === 'POOR' ? 'bg-yellow-600/80' : 'bg-red-600/80'}`}>
                    {signalStatus === 'LIVE' ? (isPlaying ? t.playing : t.paused) : signalStatus === 'POOR' ? 'WEAK SIGNAL' : 'NO SIGNAL'}
                  </div>

                  <div className={`transition-all duration-75 relative ${signalStatus === 'POOR' ? 'signal-pixelated' : ''} ${signalStatus === 'FROZEN' ? 'signal-frozen' : ''}`}>
                    <h1 className="text-4xl sm:text-6xl md:text-5xl lg:text-7xl xl:text-8xl font-black tracking-tighter text-foreground leading-[0.85] uppercase pointer-events-none">
                      <span className="block">Tania</span>
                      <span className="block">Salvatella</span>
                    </h1>
                    {signalStatus === 'POOR' && (
                      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-green-500/20 to-transparent mix-blend-color-dodge pointer-events-none" style={{ backgroundSize: '100% 4px' }}></div>
                    )}
                  </div>

                  <p className={`text-[10px] md:text-sm lg:text-lg text-muted-foreground uppercase tracking-[0.4em] font-light italic pointer-events-none transition-all duration-300 ${signalStatus === 'FROZEN' ? 'opacity-40 blur-[2px]' : ''}`}>{t.job_title}</p>
                  <div className="h-16 flex items-center justify-center">
                    <p className={`text-xs md:text-lg lg:text-xl text-muted-foreground max-w-lg italic font-serif transition-all duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}>"{t.phrases[phraseIndex]}"</p>
                  </div>

                  {signalStatus === 'FROZEN' && (
                    <div className="absolute inset-0 flex items-center justify-center z-50">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-2 border-white/20 border-t-foreground rounded-full animate-spin"></div>
                        <span className="text-[10px] font-bold text-foreground tracking-widest bg-black/50 px-2 rounded">BUFFERING...</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="absolute bottom-4 right-4 hidden md:flex items-center gap-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-1">
                {['R', 'G', 'B', 'A'].map(c => <span key={c} className="text-[8px] text-muted-foreground font-bold border border-white/10 px-1 rounded-sm">{c}</span>)}
              </div>
              <span className="text-[9px] text-muted-foreground font-mono">16 bpc / Half Res</span>
            </div>
          </div>

          {/* Play controls */}
          <div className={`p-2 border-t border-black flex items-center justify-center gap-8 shrink-0 relative overflow-hidden ${activeMode === 'color' ? 'bg-[#151515]' : 'bg-panel-header'}`}>
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
        <section className={`order-3 col-span-12 md:col-span-2 flex flex-col overflow-hidden ${activeMode === 'effects' ? 'bg-[#282828]' : activeMode === 'color' ? 'bg-panel-deep' : 'bg-[#232323]'} border border-black/50`}>
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
          <ColorTimeline t={t} selectedExp={selectedExp} setSelectedExp={setSelectedExp} wheelStates={wheelStates} onWheelMouseDown={(_e: React.MouseEvent, id: string) => setDraggingWheel(id)} lang={lang} />
        ) : activeMode === 'effects' ? (
          <EffectsTimeline
            t={t} selectedExp={selectedExp} setSelectedExp={setSelectedExp}
            expandedLayers={expandedLayers}
            toggleLayerExpansion={(id: string) => setExpandedLayers(prev => ({ ...prev, [id]: !prev[id] }))}
            aeKeyframes={aeKeyframes}
            draggingKeyframe={draggingKeyframe}
            onKeyframeMouseDown={(e: React.MouseEvent, kfId: string) => {
              e.preventDefault(); e.stopPropagation();
              const kf = aeKeyframes.find(k => k.id === kfId);
              if (kf) setDraggingKeyframe({ id: kfId, startX: e.clientX, initialPos: kf.pos });
            }}
            aeLayerOffsets={aeLayerOffsets}
            onAeLayerMouseDown={(e: React.MouseEvent, layerId: string) => {
              e.stopPropagation();
              setDraggingAeLayer({ id: layerId, startX: e.clientX, initialOffset: aeLayerOffsets[layerId] || 0 });
            }}
            playheadPos={playheadPos}
            timelineContentRef={timelineContentRef}
            timelineRef={timelineRef}
            lang={lang}
          />
        ) : (
          <EditingTimeline t={t} selectedExp={selectedExp} setSelectedExp={setSelectedExp} playheadPos={playheadPos} lang={lang} getTimecode={getTimecode} />
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
                style={{ width: skill.v === 'EXPERT' || skill.v === 'EXPERTO' ? '95%' : skill.v === 'PRO' ? '85%' : skill.v === 'MID' ? '70%' : '50%' }}
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

const EffectsTimeline = ({ t, selectedExp, setSelectedExp, expandedLayers, toggleLayerExpansion, aeKeyframes, draggingKeyframe, onKeyframeMouseDown, aeLayerOffsets, onAeLayerMouseDown, playheadPos, timelineContentRef, timelineRef, lang }: any) => (
  <div className="flex-1 flex overflow-hidden bg-[#1C1C1C]">
    {/* Left panel - layer list */}
    <div className="w-[200px] md:w-[350px] border-r border-black flex flex-col shrink-0">
      <div className="h-6 bg-[#232323] border-b border-black flex items-center px-2 text-[9px] font-bold text-muted-foreground uppercase shrink-0">
        <div className="w-6"><Eye size={10} /></div>
        <div className="flex-1 ml-2">{t.layerLabel}</div>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar custom-scrollbar">
        {t.exp_data.map((exp: ExperienceItem, idx: number) => (
          <React.Fragment key={exp.id}>
            {/* Main layer row */}
            <div onClick={() => setSelectedExp(exp)}
              className={`h-5 border-b border-[#2a2a2a] flex items-center px-2 text-[10px] cursor-pointer transition-colors ${selectedExp?.id === exp.id ? 'bg-[#383838] text-foreground' : 'hover:bg-[#2A2A2A] text-secondary-foreground'}`}>
              <div className="w-6 flex justify-center text-muted-foreground"><Eye size={8} /></div>
              <div className="w-5 h-full flex items-center justify-center" onClick={(e) => { e.stopPropagation(); toggleLayerExpansion(exp.id); }}>
                {expandedLayers[exp.id] ? <ChevronDown size={12} className="text-secondary-foreground" /> : <ChevronRight size={12} className="text-muted-foreground" />}
              </div>
              <div className="w-2 h-full mx-1" style={{ backgroundColor: exp.labelAe }}></div>
              <div className="flex-1 px-2 text-secondary-foreground truncate font-medium text-[9px]">
                <span className="text-muted-foreground mr-2 font-mono">{idx + 1}</span> {exp.title}
              </div>
            </div>
            {/* Expanded properties */}
            {expandedLayers[exp.id] && (
              <>
                <div className="h-5 border-b border-[#2a2a2a] flex items-center pl-14 text-[9px] text-muted-foreground bg-[#1e1e1e]">
                  <ChevronDown size={8} className="mr-1" /> Transform
                </div>
                {[lang === 'es' ? "Posición" : "Position", lang === 'es' ? "Escala" : "Scale", lang === 'es' ? "Rotación" : "Rotation", lang === 'es' ? "Opacidad" : "Opacity", lang === 'es' ? "Punto Anclaje" : "Anchor"].map((prop, pIdx) => (
                  <div key={prop} className="h-5 flex items-center pl-16 text-[9px] text-muted-foreground hover:bg-white/5 border-b border-[#2a2a2a] bg-[#1e1e1e]">
                    <span className="flex-1">{prop}</span>
                    <span className="text-premiere px-2 font-mono text-[8px] cursor-ew-resize hidden md:block">
                      {pIdx === 0 ? '960.0, 540.0' : pIdx === 1 ? '100.0 %' : pIdx === 2 ? '0.0°' : pIdx === 3 ? '100 %' : '960.0, 540.0'}
                    </span>
                  </div>
                ))}
              </>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
    {/* Right panel - timeline bars */}
    <div className="flex-1 flex flex-col overflow-hidden relative" ref={timelineContentRef}>
      <div className="h-6 bg-[#232323] border-b border-black flex items-center px-0 text-[8px] text-muted-foreground font-mono tracking-widest shrink-0 relative overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="absolute h-full border-l border-white/5 flex items-end pb-1 pl-1" style={{ left: `${i * 10}%` }}>
            00:00:{(i * 5).toString().padStart(2, '0')}:00
          </div>
        ))}
      </div>
      <div className="relative flex-1 overflow-x-auto p-0 custom-scrollbar bg-[#191919]" ref={timelineRef}>
        <div className="min-w-[100%] h-full relative">
          {/* Background grid */}
          <div className="absolute inset-0 w-full h-full pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="absolute top-0 bottom-0 border-l border-white/5" style={{ left: `${i * 10}%` }}></div>
            ))}
          </div>

          {t.exp_data.map((exp: ExperienceItem) => {
            const offset = aeLayerOffsets[exp.id] || 0;
            return (
              <React.Fragment key={`bars-${exp.id}`}>
                {/* Main bar row */}
                <div className="ae-timeline-row bg-[#1e1e1e]">
                  <div
                    className="absolute h-4 top-[2px] rounded-sm flex items-center cursor-grab active:cursor-grabbing border border-black/30 opacity-90"
                    style={{ left: `${offset}%`, width: '45%', backgroundColor: exp.labelAe }}
                    onMouseDown={(e) => onAeLayerMouseDown(e, exp.id)}
                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); setSelectedExp(exp); }}
                  >
                    <div className="w-full h-1/2 bg-black/10 absolute top-0"></div>
                  </div>
                </div>

                {/* Expanded property rows with keyframes */}
                {expandedLayers[exp.id] && (
                  <>
                    <div className="ae-timeline-row bg-[#1e1e1e] opacity-50"></div>
                    {[0, 1, 2, 3, 4].map(pIdx => (
                      <div key={pIdx} className="ae-timeline-row bg-[#191919] flex items-center relative">
                        {aeKeyframes
                          .filter((k: any) => k.layerId === exp.id && k.propIdx === pIdx)
                          .map((kf: any) => (
                            <div
                              key={kf.id}
                              style={{ left: `${kf.pos}%` }}
                              className="absolute h-full w-0 flex items-center justify-center z-20"
                              onMouseDown={(e) => onKeyframeMouseDown(e, kf.id)}
                            >
                              <AeDiamondKeyframe selected={kf.selected || draggingKeyframe?.id === kf.id} />
                            </div>
                          ))}
                      </div>
                    ))}
                  </>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Playhead */}
        <div className="absolute top-0 bottom-0 w-[1px] bg-premiere z-30 pointer-events-none" style={{ left: `${playheadPos}%` }}>
          <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-premiere -ml-[3.5px]"></div>
        </div>
      </div>
    </div>
  </div>
);

const EditingTimeline = ({ t, selectedExp, setSelectedExp, playheadPos, lang, getTimecode }: any) => (
  <div className="flex-1 flex overflow-hidden bg-[#1F1F1F]">
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="h-8 bg-secondary flex items-center px-4 border-b border-black justify-between shrink-0">
        <div className="flex items-center gap-6">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <List size={10} className="text-premiere" /> {lang === 'es' ? 'CV_2026' : 'CV_2026'}
          </span>
        </div>
        <div className="flex gap-4 text-[9px] text-muted-foreground font-mono hidden md:flex">
          <span>23.976 fps</span>
          <span className="text-premiere">{getTimecode(playheadPos)}</span>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden p-0 bg-[#1F1F1F] flex flex-col">
        {/* Playhead */}
        <div className="absolute top-0 bottom-0 w-[1px] bg-premiere z-40 pointer-events-none" style={{ left: `${playheadPos}%` }}>
          <div className="w-3 h-3 bg-premiere -ml-[5.5px] rounded-b-sm border-b border-white/20 shadow-sm z-50 absolute top-0"></div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* C1 Caption track */}
          <div className="flex h-12 border-b border-black/30 relative group bg-[#1F1F1F]">
            <div className="w-16 h-full bg-[#262626] border-r border-black flex flex-col items-center p-1 text-[10px] text-muted-foreground font-bold shrink-0 relative">
              <div className="w-full flex justify-between mb-1">
                <div className="w-3 h-3 border border-muted-foreground/40 rounded-sm flex items-center justify-center bg-muted"><Eye size={8} /></div>
                <div className="w-3 h-3 border border-muted-foreground/40 rounded-sm"></div>
              </div>
              <div className="mt-auto mb-1 text-orange-400 font-black">C1</div>
            </div>
            <div className="flex-1 flex relative p-0 overflow-hidden w-full items-center">
              {t.exp_data.map((exp: ExperienceItem, idx: number) => (
                <div key={`sub-${exp.id}`} className="h-full flex-1 flex flex-col justify-center px-0.5 relative">
                  <div className="w-[98%] h-[60%] bg-[#ffb74d] rounded-[2px] border border-black/40 shadow-sm mx-auto flex items-center justify-center cursor-pointer hover:brightness-110 transition-all overflow-hidden relative">
                    <div className="w-full h-1/2 bg-black/10 absolute top-0 pointer-events-none"></div>
                    <span className="text-[7px] text-black/80 font-bold truncate px-1 font-mono uppercase tracking-tight z-10">
                      [CAPTION] {t.phrases[idx % t.phrases.length]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="h-1 bg-[#1F1F1F] w-full border-b border-black/30"></div>

          {/* V1 Video track */}
          <div className="flex h-20 border-b border-black/30 relative group bg-[#1F1F1F]">
            <div className="w-16 h-full bg-[#262626] border-r border-black flex flex-col items-center p-1 text-[10px] text-muted-foreground font-bold shrink-0 relative">
              <div className="w-full flex justify-between mb-1">
                <div className="w-3 h-3 border border-muted-foreground/40 rounded-sm flex items-center justify-center bg-muted"><Eye size={8} /></div>
                <div className="w-3 h-3 border border-muted-foreground/40 rounded-sm"></div>
              </div>
              <div className="mt-auto mb-1 text-muted-foreground">V1</div>
            </div>
            <div className="flex-1 flex relative p-0 overflow-hidden w-full">
              {t.exp_data.map((exp: ExperienceItem, idx: number) => (
                <React.Fragment key={exp.id}>
                  <div
                    onClick={() => setSelectedExp(exp)}
                    className={`h-full flex-1 flex flex-col cursor-pointer pr-clip relative overflow-hidden group border border-black/40 ${selectedExp?.id === exp.id ? 'brightness-110 border-white' : ''}`}
                    style={{ backgroundColor: exp.labelPr }}>
                    <div className="h-4 w-full bg-black/20 flex items-center px-1 justify-between">
                      <span className="text-[9px] font-bold text-black/80 truncate">{exp.title}</span>
                    </div>
                    <div className="flex-1 w-full bg-black/10 relative flex items-center overflow-hidden">
                      <div className="absolute inset-0 flex">
                        <div className="w-16 h-full bg-black/10 border-r border-white/10"></div>
                        <div className="flex-1"></div>
                        <div className="w-16 h-full bg-black/10 border-l border-white/10"></div>
                      </div>
                      <div className="absolute bottom-1 left-1 bg-black/30 px-0.5 rounded-[1px] text-[7px] text-black/60 font-bold border border-black/10">fx</div>
                    </div>
                  </div>
                  {idx < t.exp_data.length - 1 && (
                    <div className="absolute top-0 bottom-0 w-8 -ml-4 pr-transition pointer-events-none flex items-center justify-center" style={{ left: `${((idx + 1) / t.exp_data.length) * 100}%` }}>
                      <div className="w-full h-full relative">
                        <div className="absolute inset-0 bg-white/20"></div>
                        <div className="absolute top-1 left-1 text-[6px] text-black font-bold rotate-90 origin-top-left translate-y-4">Dissolve</div>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="h-4 bg-[#1F1F1F] w-full border-b border-black/30"></div>

          {/* A1 Audio track */}
          <div className="flex h-20 border-b border-black/30 relative">
            <div className="w-16 h-full bg-[#262626] border-r border-black flex flex-col items-center p-1 text-[10px] text-muted-foreground font-bold shrink-0 relative">
              <div className="w-full flex justify-between mb-1">
                <div className="w-3 h-3 border border-muted-foreground/40 rounded-sm flex items-center justify-center bg-muted"><Mic size={8} /></div>
                <div className="w-3 h-3 border border-muted-foreground/40 rounded-sm bg-muted text-xs flex items-center justify-center text-foreground">M</div>
              </div>
              <div className="mt-auto mb-1 text-muted-foreground">A1</div>
            </div>
            <div className="flex-1 flex relative p-0 overflow-hidden w-full">
              {t.exp_data.map((exp: ExperienceItem) => (
                <div key={`audio-${exp.id}`} className="h-full flex-1 flex flex-col relative overflow-hidden group border border-black/40 bg-[#008f7a]">
                  <div className="h-4 w-full bg-black/10 flex items-center px-1">
                    <span className="text-[9px] font-bold text-black/60 truncate">{exp.title} [Audio]</span>
                  </div>
                  <div className="flex-1 w-full relative flex items-center justify-center overflow-hidden px-1">
                    <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <path
                        d={`M 0 50 ${Array.from({ length: 60 }).map((_, i) => {
                          const x = (i / 59) * 100;
                          const noise = Math.random();
                          const amp = noise > 0.7 ? 40 : (noise > 0.4 ? 20 : 5);
                          const y = 50 - (Math.random() * amp);
                          return `L ${x} ${y}`;
                        }).join(' ')} L 100 50 ${Array.from({ length: 60 }).map((_, i) => {
                          const x = ((59 - i) / 59) * 100;
                          const noise = Math.random();
                          const amp = noise > 0.7 ? 40 : (noise > 0.4 ? 20 : 5);
                          const y = 50 + (Math.random() * amp);
                          return `L ${x} ${y}`;
                        }).join(' ')} Z`}
                        fill="#4ade80" opacity="0.6"
                      />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Index;
