import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Settings, Sparkles,
  Monitor, Maximize2, Volume2,
  Eye, Lock, ChevronRight, ChevronDown,
  Sliders, Film, GraduationCap, Calendar, Code, Zap,
  Folder, List, Filter, Share, X, Circle,
  Activity, Grid, Radio, Camera, Crosshair, BarChart,
  Layers2, Languages, BookOpen, BrainCircuit, Users, MessageSquare, Video, Search,
  WifiOff, Mic, Image as ImageIcon, MonitorPlay, Info,
  Layers, Anchor, RotateCw, Smartphone, ArrowLeft,
  Scissors, Type, Wand2, Plus, Undo2, ScissorsLineDashed,
  Network
} from 'lucide-react';
import { generateCV } from '@/utils/generateCV';
import { translations, type ExperienceItem } from '@/data/translations';
import { ResolveIcon, AdobeAeIcon, AdobePrIcon, AeCompIcon, PrSequenceIcon, DrSequenceIcon, AeDiamondKeyframe } from '@/components/cv/CvIcons';
import { ExportModal } from '@/components/cv/ExportModal';
import { AEWarning, PRWarning, DRWarning } from '@/components/cv/Warnings';
import { ExperienceDetailMonitor } from '@/components/cv/ExperienceDetailMonitor';
import { AudioWaveform, DesktopAudioWaveformSVG } from '@/components/cv/AudioWaveform';
import { VUMeter } from '@/components/cv/VUMeter';

type Mode = 'editing' | 'effects' | 'color';

const AeStopwatch = ({ active = false }: { active?: boolean }) => (
  <svg viewBox="0 0 24 24" className={`w-3 h-3 ${active ? 'text-premiere' : 'text-muted-foreground'} fill-current cursor-pointer hover:text-foreground`}>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z" />
  </svg>
);

const Toast = ({ message }: { message: string }) => (
  <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in duration-300">
    <div className="bg-premiere text-white px-6 py-3 rounded shadow-2xl border border-white/20 flex items-center gap-3">
      <Info size={18} className="text-white" />
      <span className="text-xs font-bold uppercase tracking-wide">{message}</span>
    </div>
  </div>
);

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
  const [isGlitching, setIsGlitching] = useState(false);
  const [selectedExpId, setSelectedExpId] = useState<string | null>(null);
  
  // Derive selectedExp from ID for language switching persistence
  const selectedExp = useMemo(() => {
    if (!selectedExpId) return null;
    let found = t.exp_data.find(e => e.id === selectedExpId);
    if (found) return found;
    found = t.art_data.find(a => a.id === selectedExpId);
    if (found) return found;
    if (selectedExpId === 'edu_comp') return { type: 'education', id: 'edu_comp', title: t.eduComp } as any;
    return null;
  }, [selectedExpId, t]);
  
  const setSelectedExp = (exp: any) => {
    if (exp === null) { setSelectedExpId(null); return; }
    setSelectedExpId(exp.id || null);
  };

  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [currentFolder, setCurrentFolder] = useState('root');
  const [playheadPos, setPlayheadPos] = useState(30);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [activeProjectTab, setActiveProjectTab] = useState('project');
  const [showToast, setShowToast] = useState(false);
  const [isDragOverMonitor, setIsDragOverMonitor] = useState(false);
  const [monitorFormat, setMonitorFormat] = useState<'landscape' | 'portrait'>('landscape');
  const [mobileTab, setMobileTab] = useState<'bin' | 'monitor' | 'timeline' | 'inspector'>('monitor');

  // AE layer expansion & dragging
  const [expandedAeLayers, setExpandedAeLayers] = useState<Record<string, boolean>>({ motion: true });
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

  // Mode switch with glitch
  const switchMode = (newMode: Mode) => {
    if (newMode === activeMode) return;
    setIsGlitching(true);
    setTimeout(() => setActiveMode(newMode), 200);
    setTimeout(() => setIsGlitching(false), 600);
  };

  const openUrl = (url: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getEmbedUrl = (url: string): string | null => {
    try {
      // YouTube standard
      const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?#]+)/);
      if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;
      // YouTube Shorts
      const ytShort = url.match(/youtube\.com\/shorts\/([^?&#]+)/);
      if (ytShort) return `https://www.youtube.com/embed/${ytShort[1]}?autoplay=1&rel=0`;
      // Vimeo video
      const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
      if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
      // Vimeo channel/user page — not embeddable
      return null;
    } catch { return null; }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
      if (e.code === 'Space') { e.preventDefault(); setIsPlaying(prev => { const next = !prev; if (!next) setShowWarning(true); return next; }); }
      if (e.code === 'KeyJ') setPlayheadPos(prev => Math.max(0, prev - 5));
      if (e.code === 'KeyL') setPlayheadPos(prev => Math.min(100, prev + 5));
      if (e.code === 'KeyK') setIsPlaying(false);
      if (e.code === 'KeyF') setMonitorFormat(prev => prev === 'landscape' ? 'portrait' : 'landscape');
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') { e.preventDefault(); setShowToast(true); setTimeout(() => setShowToast(false), 3000); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, item: any) => {
    e.dataTransfer.setData("application/json", JSON.stringify(item));
    e.dataTransfer.effectAllowed = "copy";
  };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); if (!isDragOverMonitor) setIsDragOverMonitor(true); };
  const handleDragLeave = () => setIsDragOverMonitor(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragOverMonitor(false);
    try { const item = JSON.parse(e.dataTransfer.getData("application/json")); setSelectedExp(item); setIsPlaying(true); } catch { }
  };

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
      if (signalStatus === 'LIVE') { setSignalStatus('POOR'); timeout = setTimeout(cycleSignal, Math.random() * 1000 + 500); }
      else if (signalStatus === 'POOR') { setSignalStatus('FROZEN'); timeout = setTimeout(cycleSignal, Math.random() * 2000 + 1000); }
      else { setSignalStatus('LIVE'); timeout = setTimeout(cycleSignal, Math.random() * 5000 + 4000); }
    };
    timeout = setTimeout(cycleSignal, 3000);
    return () => clearTimeout(timeout);
  }, [signalStatus]);

  useEffect(() => {
    let animationFrame: number;
    const step = () => { if (isPlaying) { setPlayheadPos(prev => (prev + 0.05) % 100); animationFrame = requestAnimationFrame(step); } };
    if (isPlaying) animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (!isPlaying) {
      interval = setInterval(() => { setIsFading(true); setTimeout(() => { setPhraseIndex(prev => (prev + 1) % t.phrases.length); setIsFading(false); }, 600); }, 4000);
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
        osc.connect(gain); gain.connect(audioCtxRef.current.destination); osc.start();
        oscillatorRef.current = osc; setIsAudioActive(true);
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

  const handleAeLayerMouseDown = (e: React.MouseEvent, layerId: string) => {
    e.stopPropagation();
    setDraggingAeLayer({ id: layerId, startX: e.clientX, initialOffset: aeLayerOffsets[layerId] || 0 });
  };

  const handleKeyframeMouseDown = (e: React.MouseEvent, kfId: string) => {
    e.preventDefault(); e.stopPropagation();
    const kf = aeKeyframes.find(k => k.id === kfId);
    if (kf) setDraggingKeyframe({ id: kfId, startX: e.clientX, initialPos: kf.pos });
  };

  const handleWheelMouseDown = (e: React.MouseEvent, wheelId: string) => {
    e.preventDefault(); e.stopPropagation();
    setDraggingWheel(wheelId);
  };

  const toggleAeLayer = (id: string) => {
    setExpandedAeLayers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleGlobalMouseMove = useCallback((e: React.MouseEvent) => {
    const timelineWidth = timelineRef.current ? timelineRef.current.scrollWidth : 1000;
    if (draggingKeyframe) {
      const diff = e.clientX - draggingKeyframe.startX;
      const percentChange = (diff / timelineWidth) * 100;
      setAeKeyframes(prev => prev.map(k => k.id === draggingKeyframe.id ? { ...k, pos: Math.max(0, Math.min(100, draggingKeyframe.initialPos + percentChange)) } : k));
      return;
    }
    if (draggingAeLayer) {
      const diff = e.clientX - draggingAeLayer.startX;
      const percentChange = (diff / timelineWidth) * 100;
      setAeLayerOffsets(prev => ({ ...prev, [draggingAeLayer.id]: Math.max(0, (draggingAeLayer.initialOffset || 0) + percentChange) }));
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
      if (dist > radius - 10) { const angle = Math.atan2(dy, dx); dx = Math.cos(angle) * (radius - 10); dy = Math.sin(angle) * (radius - 10); }
      setWheelStates(prev => ({ ...prev, [draggingWheel]: { x: 50 + (dx / radius) * 50, y: 50 + (dy / radius) * 50 } }));
    }
  }, [draggingKf, draggingWheel, draggingKeyframe, draggingAeLayer]);

  const handleGlobalMouseUp = useCallback(() => {
    setDraggingKf(null); setDraggingWheel(null); setDraggingAeLayer(null); setDraggingKeyframe(null);
  }, []);

  const handleDownloadPDF = () => { generateCV(lang as 'es' | 'en'); setShowWarning(false); };

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
    ? [{ id: 'project', label: t.gallery }, { id: 'skills', label: t.media_pool }]
    : activeMode === 'effects'
    ? [{ id: 'project', label: t.project }, { id: 'skills', label: t.assets_lib }]
    : [{ id: 'project', label: t.project_bin }, { id: 'skills', label: t.media_browser }];

  const isEducationSelected = selectedExp?.type === 'education' || selectedExp?.id === 'edu_comp';
  const isVideoSelected = selectedExp?.type === 'video';
  const isJobSelected = selectedExp && !isEducationSelected && !isVideoSelected;

  return (
    <div
      className={`min-h-screen font-sans text-sm flex flex-col transition-colors duration-300 select-none md:h-screen md:overflow-hidden relative`}
      style={{ backgroundColor: activeMode === 'color' ? '#121212' : activeMode === 'effects' ? '#161616' : '#232323' }}
      onMouseMove={handleGlobalMouseMove}
      onMouseUp={handleGlobalMouseUp}
    >
      {/* GLITCH OVERLAY */}
      {isGlitching && (
        <div className="glitch-overlay z-[1000]">
          <div className="glitch-anim absolute inset-0"></div>
          <div className="glitch-color absolute inset-0"></div>
        </div>
      )}

      {/* TOAST */}
      {showToast && <Toast message={t.undo_toast} />}

      {/* HIDDEN SVG FILTER FOR PIXELATION */}
      <svg className="hidden">
        <defs>
          <filter id="pixelate-filter" x="0" y="0">
            <feFlood x="2" y="2" height="1" width="1"/>
            <feComposite width="4" height="4"/>
            <feTile result="a"/>
            <feComposite in="SourceGraphic" in2="a" operator="in"/>
            <feMorphology operator="dilate" radius="2"/>
          </filter>
        </defs>
      </svg>

      {showExportModal && <ExportModal onClose={() => setShowExportModal(false)} lang={lang} />}

      {/* ========== MOBILE PRO INTERFACE (Tabbed) ========== */}
      <div className="md:hidden flex flex-col h-screen text-white overflow-hidden relative"
        style={{ backgroundColor: activeMode === 'color' ? '#121212' : activeMode === 'effects' ? '#161616' : '#1A1A1A' }}>
        {/* Mobile Header — adapts per mode */}
        <div className="flex justify-between items-center px-3 py-2 z-20 border-b border-black shrink-0 h-12"
          style={{ backgroundColor: activeMode === 'color' ? '#1a1a1a' : activeMode === 'effects' ? '#1D1D1D' : '#2D2D2D' }}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 shrink-0">{headerInfo.icon}</div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold leading-none truncate max-w-[130px]">Tania Salvatella</span>
              <span className="text-[7px] leading-none truncate max-w-[150px]" style={{ color: headerInfo.accent }}>
                {activeMode === 'color' ? 'CV_Tania.drp' : activeMode === 'effects' ? 'CV_Tania.aep' : 'CV_2026.prproj'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Mode switcher mini */}
            <div className="flex rounded overflow-hidden border border-white/10">
              {(['editing', 'effects', 'color'] as Mode[]).map(m => (
                <button key={m} onClick={() => switchMode(m)}
                  className="px-2 py-1 text-[7px] font-bold uppercase transition-all"
                  style={{
                    backgroundColor: activeMode === m ? (m === 'effects' ? '#D8A5FA' : m === 'color' ? '#f39c12' : '#3EA6F2') : 'transparent',
                    color: activeMode === m ? '#000' : '#666'
                  }}>
                  {m === 'editing' ? 'Pr' : m === 'effects' ? 'Ae' : 'Dr'}
                </button>
              ))}
            </div>
            <button onClick={() => setShowExportModal(true)}
              className="p-1.5 rounded-sm text-xs font-bold flex items-center gap-1 shadow-lg active:scale-95 transition-transform"
              style={{ backgroundColor: headerInfo.accent, color: activeMode === 'editing' ? '#fff' : '#000' }}>
              <Share size={14} fill="currentColor" />
            </button>
          </div>
        </div>

        {/* Mobile Content Area */}
        <div className="flex-1 relative overflow-hidden bg-black">
          {/* TAB: BIN */}
          {mobileTab === 'bin' && (
            <div className="absolute inset-0 flex flex-col bg-[#232323] overflow-y-auto">
              <div className="px-4 py-2 bg-[#2D2D2D] border-b border-black text-[10px] font-bold text-gray-400 uppercase tracking-widest sticky top-0">{t.project_bin}</div>
              <div className="p-2 space-y-1">
                {t.exp_data.map(exp => (
                  <div key={exp.id} onClick={() => { setSelectedExpId(exp.id); setMobileTab('monitor'); setIsPlaying(true); }}
                    className="flex items-center p-3 rounded bg-[#333] border border-black/20 active:bg-premiere active:text-white transition-colors">
                    {exp.id === 'motion' ? <PrSequenceIcon /> : <Film size={16} className="mr-2 text-gray-400" />}
                    <div className="flex flex-col">
                      <span className="text-xs font-bold">{exp.title}</span>
                      <span className="text-[9px] opacity-60">{exp.company}</span>
                    </div>
                    <ChevronRight size={14} className="ml-auto opacity-50" />
                  </div>
                ))}
                <div onClick={() => { setSelectedExpId('edu_comp'); setMobileTab('monitor'); }}
                  className="flex items-center p-3 rounded bg-[#333] border border-black/20 active:bg-emerald-500 active:text-white transition-colors mt-4">
                  <GraduationCap size={16} className="mr-2 text-emerald-400" />
                  <span className="text-xs font-bold">{t.eduComp}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB: MONITOR */}
          {mobileTab === 'monitor' && (
            <div className="absolute inset-0 flex flex-col bg-black">
              <div className={`relative flex-1 flex items-center justify-center overflow-hidden ${monitorFormat === 'portrait' ? 'p-0' : 'p-2'}`}>
                <div className={`relative overflow-hidden shadow-2xl flex flex-col items-center justify-center transition-all duration-300
                  ${monitorFormat === 'landscape' ? 'w-full aspect-video bg-black' : 'h-full aspect-[9/16] bg-black'}`}>
                  <div className="absolute inset-0 z-0 opacity-10 pointer-events-none flex items-center justify-center">
                    <div className="w-[90%] h-[90%] border border-white/20 rounded-sm"></div>
                    <Crosshair size={24} className="text-white opacity-20" />
                  </div>
                  {selectedExp && selectedExp.type !== 'video' && selectedExp.type !== 'education' && (
                    <ExperienceDetailMonitor experience={selectedExp} onClose={() => setSelectedExpId(null)} accentColor={headerInfo.accent} mode={activeMode} getExpIcon={getExpIcon} />
                  )}
                  <div className={`text-center z-10 space-y-2 px-4 relative w-full flex flex-col h-full ${selectedExp?.type === 'education' ? 'items-stretch justify-start' : 'items-center justify-center'}`}>
                    {!selectedExp && (
                      <>
                        <h1 className={`font-black tracking-tight text-white uppercase leading-[0.95] transition-all duration-300 text-center ${monitorFormat === 'landscape' ? 'text-[clamp(2rem,9vw,2.75rem)]' : 'text-3xl flex flex-col items-center gap-1'}`}>
                          <span className={monitorFormat === 'landscape' ? 'inline' : 'block'}>Tania</span>
                          <span className={monitorFormat === 'landscape' ? 'inline ml-2' : 'block'}>Salvatella</span>
                        </h1>
                        <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] mt-2">{t.job_title}</p>
                      </>
                    )}
                    {selectedExp?.type === 'education' && (
                      <div className="w-full h-full p-4 pb-24 overflow-y-auto">
                        <h2 className="text-2xl font-black text-white mb-4">{t.education_title}</h2>
                        {t.edu_data.map((edu, i) => (
                          <div key={i} className="mb-4 text-left border-l-2 border-emerald-500 pl-3">
                            <div className="text-emerald-400 font-bold text-lg">{edu.year}</div>
                            <div className="text-white text-[11px] leading-snug break-words">{edu.label}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {selectedExp?.type === 'video' && selectedExp.url && (
                      (() => {
                        const embedSrc = getEmbedUrl(selectedExp.url);
                        return embedSrc ? (
                          <div className="absolute inset-0 z-30 bg-black flex flex-col">
                            <button onClick={() => setSelectedExpId(null)} className="absolute top-2 right-2 z-40 bg-black/70 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold hover:bg-black">✕</button>
                            <iframe src={embedSrc} className="w-full h-full" allow="autoplay; fullscreen; encrypted-media" allowFullScreen frameBorder="0" />
                          </div>
                        ) : (
                          <div className="text-center z-30 absolute inset-0 flex flex-col items-center justify-center bg-black">
                            <h2 className="text-xl font-black text-white uppercase mb-2">{selectedExp.title}</h2>
                            <button onClick={() => openUrl(selectedExp.url!)} className="px-4 py-2 bg-premiere text-white rounded text-xs font-bold mt-2">Abrir en nueva pestaña ↗</button>
                          </div>
                        );
                      })()
                    )}
                   </div>
                  {selectedExp?.type !== 'education' && selectedExp?.type !== 'video' && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-6 items-center z-20">
                      <SkipBack size={20} className="text-white drop-shadow-md" onClick={() => setPlayheadPos(Math.max(0, playheadPos - 10))} />
                      <button onClick={() => setIsPlaying(!isPlaying)} className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black shadow-lg active:scale-95">
                        {isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" className="ml-1" />}
                      </button>
                      <SkipForward size={20} className="text-white drop-shadow-md" onClick={() => setPlayheadPos(Math.min(100, playheadPos + 10))} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: TIMELINE */}
          {mobileTab === 'timeline' && (
            <div className="absolute inset-0 flex flex-col overflow-hidden"
              style={{ backgroundColor: activeMode === 'color' ? '#181818' : activeMode === 'effects' ? '#161616' : '#1F1F1F' }}>

              {/* DaVinci Resolve style timeline */}
              {activeMode === 'color' ? (
                <>
                  {/* Timecode top-left */}
                  <div className="px-3 py-1.5 flex items-center justify-between border-b border-black/50 shrink-0" style={{ backgroundColor: '#1a1a1a' }}>
                    <span className="text-[13px] font-mono font-bold text-white tracking-wider">{getTimecode(playheadPos)}</span>
                    <div className="flex items-center gap-3 text-[9px] text-gray-500 font-mono">
                      <span>01:00:00:00</span>
                      <span>01:15:04:00</span>
                    </div>
                  </div>
                  {/* Ruler */}
                  <div className="h-5 border-b border-[#333] shrink-0 relative" style={{ backgroundColor: '#1e1e1e' }}>
                    <div className="absolute inset-0 flex items-end px-1">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center">
                          <div className="w-[1px] bg-gray-600" style={{ height: i % 5 === 0 ? 10 : 5 }} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 relative overflow-y-auto" style={{ backgroundColor: '#1a1a1a' }}>
                    <div className="flex flex-col">
                      {/* V2 — Video 2 */}
                      <div className="flex border-b border-[#2a2a2a]" style={{ height: 44 }}>
                        <div className="w-[90px] shrink-0 flex flex-col justify-center border-r border-[#2a2a2a] px-1.5" style={{ backgroundColor: '#1e1e1e' }}>
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] font-bold text-gray-400">V2</span>
                            <span className="text-[8px] text-gray-500">Video 2</span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Lock size={8} className="text-gray-600" />
                            <Eye size={8} className="text-gray-600" />
                            <Monitor size={8} className="text-gray-600" />
                          </div>
                        </div>
                        <div className="flex-1 relative" style={{ backgroundColor: '#1f1f1f' }}>
                          {/* Empty track */}
                        </div>
                      </div>
                      {/* V1 — Video 1 with clips */}
                      <div className="flex border-b border-[#2a2a2a]" style={{ height: 52 }}>
                        <div className="w-[90px] shrink-0 flex flex-col justify-center border-r border-[#2a2a2a] px-1.5" style={{ backgroundColor: '#1e1e1e' }}>
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] font-bold text-white px-1 rounded" style={{ backgroundColor: '#c03030' }}>V1</span>
                            <span className="text-[8px] text-gray-400">Video 1</span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Lock size={8} className="text-gray-600" />
                            <Eye size={8} className="text-gray-500" />
                            <Monitor size={8} className="text-gray-500" />
                          </div>
                        </div>
                        <div className="flex-1 relative flex items-stretch overflow-hidden">
                          {t.art_data.slice(0, 4).map((art, idx) => (
                            <div key={idx} className="flex-1 relative cursor-pointer active:brightness-125 transition-all min-w-0 border-r border-[#111]"
                              onClick={() => { if (art.url && art.url !== "I'M ON IT") { if (art.type === 'video') { setSelectedExp(art); } else { openUrl(art.url); } } }}>
                              {/* Thumbnail strip at top */}
                              <div className="absolute inset-0 bg-gradient-to-b from-[#3a5a7a] to-[#2a4060]" />
                              {/* Vertical bars (thumbnail markers) */}
                              <div className="absolute left-0 top-0 bottom-0 flex gap-[2px] opacity-40">
                                {Array.from({ length: 6 }).map((_, bi) => (
                                  <div key={bi} className="w-[3px] h-full" style={{ backgroundColor: '#5a8ab5' }} />
                                ))}
                              </div>
                              {/* Clip label */}
                              <div className="absolute bottom-0 left-0 right-0 px-1 py-0.5 bg-[#2a5080]/90 flex items-center gap-1">
                                <Anchor size={7} className="text-white/60 shrink-0" />
                                <span className="text-[6px] text-white/80 font-medium truncate">{art.title}.mp4</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* A1 — Audio 1 (green clips) */}
                      <div className="flex border-b border-[#2a2a2a]" style={{ height: 40 }}>
                        <div className="w-[90px] shrink-0 flex flex-col justify-center border-r border-[#2a2a2a] px-1.5" style={{ backgroundColor: '#1e1e1e' }}>
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] font-bold text-white px-1 rounded" style={{ backgroundColor: '#2a8a2a' }}>A1</span>
                            <div className="flex items-center gap-0.5">
                              <Lock size={7} className="text-gray-600" />
                              <Volume2 size={7} className="text-gray-500" />
                              <span className="text-[7px] font-bold text-gray-500">S</span>
                              <span className="text-[7px] font-bold text-gray-500">M</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[7px] text-gray-600 font-mono">2.0</span>
                          </div>
                        </div>
                        <div className="flex-1 relative flex items-stretch overflow-hidden">
                          <div className="flex-1 relative" style={{ backgroundColor: '#1a3a1a' }}>
                            <AudioWaveform mode={activeMode} isPlaying={isPlaying} playheadPos={playheadPos} barCount={60} className="w-full h-full" />
                            <div className="absolute bottom-0 left-0 right-0 px-1 py-0.5 bg-[#2a7a2a]/80 flex items-center gap-1">
                              <Anchor size={7} className="text-white/60 shrink-0" />
                              <span className="text-[6px] text-white/80 truncate">audio_master.mp4</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* A2 — Audio 2 */}
                      <div className="flex border-b border-[#2a2a2a]" style={{ height: 32 }}>
                        <div className="w-[90px] shrink-0 flex flex-col justify-center border-r border-[#2a2a2a] px-1.5" style={{ backgroundColor: '#1e1e1e' }}>
                          <div className="flex items-center gap-1">
                            <span className="text-[8px] font-bold text-gray-500">A2</span>
                            <div className="flex items-center gap-0.5">
                              <Lock size={7} className="text-gray-600" />
                              <Volume2 size={7} className="text-gray-600" />
                              <span className="text-[7px] font-bold text-gray-600">S</span>
                              <span className="text-[7px] font-bold text-gray-600">M</span>
                            </div>
                          </div>
                          <span className="text-[7px] text-gray-600 font-mono">1.0</span>
                        </div>
                        <div className="flex-1 relative" style={{ backgroundColor: '#1f1f1f' }}>
                          {/* Empty audio track */}
                        </div>
                      </div>
                    </div>
                    {/* Playhead — red DaVinci style */}
                    <div className="absolute top-0 bottom-0 w-[2px] z-30" style={{ left: `${playheadPos}%`, backgroundColor: '#e03030' }}>
                      <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-[#e03030]" />
                    </div>
                  </div>
                </>
              ) : activeMode === 'effects' ? (
                /* After Effects layer-based timeline */
                <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: '#232323' }}>
                  {/* AE top bar: timecode + comp tabs */}
                  <div className="flex items-center justify-between px-2 py-1 border-b border-[#1a1a1a] shrink-0" style={{ backgroundColor: '#2a2a2a' }}>
                    <span className="text-[12px] font-mono font-bold" style={{ color: '#D8A5FA' }}>{getTimecode(playheadPos)}</span>
                    <span className="text-[8px] text-gray-500 font-mono">00143 (23.00 fps)</span>
                  </div>
                  {/* AE column headers */}
                  <div className="flex items-center h-5 border-b border-[#1a1a1a] shrink-0 text-[7px] text-gray-500 font-bold" style={{ backgroundColor: '#2d2d2d' }}>
                    <div className="w-[45%] flex items-center gap-1 px-1">
                      <span className="w-4 text-center">#</span>
                      <span>Layer Name</span>
                    </div>
                    <div className="w-[15%] flex items-center justify-center gap-1">
                      <Sparkles size={7} /><span>fx</span>
                    </div>
                    <div className="w-[40%] text-center">Parent & Link</div>
                  </div>
                  {/* AE layers list + bars */}
                  <div className="flex-1 overflow-y-auto">
                    {(() => {
                      const aeColors = ['#cc3333', '#cc33cc', '#3366cc', '#3366cc', '#3399cc', '#336633', '#33cc33', '#cc6633', '#cccc33', '#cc3399', '#6633cc', '#33cc66', '#336699'];
                      const allLayers = [
                        ...t.exp_data.map((exp, i) => ({ name: exp.title, color: aeColors[i % aeColors.length], type: 'T', parentLabel: 'None', id: exp.id, url: null as string | null, item: exp })),
                        ...t.art_data.slice(0, 4).map((art, i) => ({ name: art.title, color: aeColors[(i + 5) % aeColors.length], type: '★', parentLabel: art.url && art.url !== "I'M ON IT" ? `${(i + t.exp_data.length + 1)}. ${art.title.slice(0, 12)}` : 'None', id: art.id, url: art.url && art.url !== "I'M ON IT" ? art.url : null, item: art })),
                      ];
                      return allLayers.map((layer, idx) => (
                        <div key={layer.id} className="flex border-b border-[#1e1e1e] ae-row" style={{ height: 22 }}>
                          {/* Left: layer info */}
                          <div className="w-[40%] flex items-center gap-1 px-1 min-w-0" style={{ backgroundColor: '#232323' }}>
                            <Eye size={7} className="text-gray-500 shrink-0" />
                            <span className="text-[8px] font-bold text-gray-500 w-3 text-right shrink-0">{idx + 1}</span>
                            <div className="w-2.5 h-2.5 rounded-[2px] shrink-0" style={{ backgroundColor: layer.color }} />
                            <span className="text-[7px] text-gray-400 shrink-0">{layer.type}</span>
                            <span className="text-[8px] text-gray-300 truncate cursor-pointer" onClick={() => { setSelectedExp(layer.item); setMobileTab('monitor'); }}>{layer.name}</span>
                          </div>
                          {/* Center: icons */}
                          <div className="w-[12%] flex items-center justify-center gap-0.5 border-l border-[#1a1a1a]" style={{ backgroundColor: '#232323' }}>
                            <Sparkles size={6} className="text-gray-600" />
                            <Wand2 size={6} className="text-gray-600" />
                          </div>
                          {/* Parent & Link */}
                          <div className="w-[20%] flex items-center border-l border-[#1a1a1a] px-1 min-w-0" style={{ backgroundColor: '#232323' }}>
                            {layer.url ? (
                              <a href={layer.url} target="_blank" rel="noopener noreferrer"
                                className="text-[7px] truncate flex items-center gap-0.5 hover:underline"
                                style={{ color: '#7dd3fc' }}>
                                <span className="truncate">{layer.parentLabel}</span>
                                <ChevronDown size={6} className="shrink-0 opacity-50" />
                              </a>
                            ) : (
                              <span className="text-[7px] text-gray-600 truncate flex items-center gap-0.5">
                                None <ChevronDown size={6} className="shrink-0 opacity-40" />
                              </span>
                            )}
                          </div>
                          {/* Right: colored bar */}
                          <div className="w-[28%] relative border-l border-[#1a1a1a]" style={{ backgroundColor: '#1a1a1a' }}>
                            <div className="absolute top-[3px] bottom-[3px] rounded-[1px]"
                              style={{
                                left: `${(idx * 3) % 20}%`,
                                right: `${(idx * 2 + 5) % 15}%`,
                                backgroundColor: layer.color,
                                opacity: 0.75,
                              }} />
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                  {/* AE Playhead */}
                  <div className="relative h-1 shrink-0" style={{ backgroundColor: '#1a1a1a' }}>
                    <div className="absolute top-0 w-[2px] h-full" style={{ left: `${playheadPos}%`, backgroundColor: '#4a90d9' }} />
                  </div>
                </div>
              ) : (
                /* Premiere Pro timeline */
                <div className="flex-1 flex flex-col p-2 overflow-hidden">
                  <div className="px-2 py-1 flex justify-between text-[10px] text-gray-400 border-b border-black mb-2">
                    <span>00:00:00:00</span>
                    <span style={{ color: headerInfo.accent }}>{getTimecode(playheadPos)}</span>
                    <span>00:15:20:00</span>
                  </div>
                  <div className="flex-1 relative overflow-y-auto bg-[#1A1A1A] border border-white/5 rounded">
                    <div className="space-y-1 p-1">
                      {/* V1 */}
                      <div className="h-14 bg-[#262626] relative flex items-center overflow-hidden rounded-sm">
                        <div className="absolute left-0 w-7 h-full bg-[#333] border-r border-black flex items-center justify-center text-[8px] font-bold text-gray-500 z-10 shrink-0">V1</div>
                        <div className="flex-1 ml-7 flex overflow-hidden h-full">
                          {t.art_data.slice(0, 3).map((art, idx) => (
                            <div key={idx} className="flex-1 border-r border-black/50 h-full relative cursor-pointer active:brightness-125 transition-all min-w-0"
                              style={{ backgroundColor: `${art.color || art.labelPr}25` }}
                              onClick={() => { if (art.url && art.url !== "I'M ON IT") { if (art.type === 'video') { setSelectedExp(art); } else { openUrl(art.url); } } }}>
                              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: art.color || art.labelPr }} />
                              <span className="absolute top-1 left-1 right-1 text-[7px] font-bold truncate leading-tight" style={{ color: art.color || art.labelPr }}>{art.title}</span>
                              <span className="absolute bottom-0.5 left-1 text-[6px] text-gray-500 font-mono">{art.duration}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* V2 */}
                      <div className="h-14 bg-[#262626] relative flex items-center overflow-hidden rounded-sm">
                        <div className="absolute left-0 w-7 h-full bg-[#333] border-r border-black flex items-center justify-center text-[8px] font-bold text-gray-500 z-10 shrink-0">V2</div>
                        <div className="flex-1 ml-7 flex overflow-hidden h-full">
                          {t.art_data.slice(3).map((art, idx) => (
                            <div key={idx} className="flex-1 border-r border-black/50 h-full relative cursor-pointer active:brightness-125 transition-all min-w-0"
                              style={{ backgroundColor: `${art.color || art.labelPr}25` }}
                              onClick={() => { if (art.url && art.url !== "I'M ON IT") { if (art.type === 'video') { setSelectedExp(art); } else { openUrl(art.url); } } }}>
                              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: art.color || art.labelPr }} />
                              <span className="absolute top-1 left-1 right-1 text-[7px] font-bold truncate leading-tight" style={{ color: art.color || art.labelPr }}>{art.title}</span>
                              <span className="absolute bottom-0.5 left-1 text-[6px] text-gray-500 font-mono">{art.duration}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* C1 */}
                      <div className="h-8 bg-[#262626] relative flex items-center overflow-hidden rounded-sm">
                        <div className="absolute left-0 w-7 h-full bg-[#333] border-r border-black flex items-center justify-center text-[8px] font-bold text-gray-500 z-10 shrink-0">C1</div>
                        <div className="flex-1 ml-7 flex overflow-hidden">
                          {t.edu_data.map((edu, idx) => (
                            <div key={idx} className="flex-1 border-r border-black/50 h-full relative bg-emerald-800/40 min-w-0">
                              <span className="absolute top-0.5 left-0.5 right-0.5 text-[5px] text-emerald-200 font-bold truncate">{edu.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* A1 */}
                      <div className="h-16 relative flex items-center overflow-hidden rounded-sm mt-1" style={{ backgroundColor: '#262626' }}>
                        <div className="absolute left-0 w-7 h-full border-r border-black flex items-center justify-center text-[8px] font-bold z-10 shrink-0"
                          style={{ backgroundColor: '#333', color: '#4ade80' }}>A1</div>
                        <div className="flex-1 ml-7 h-full">
                          <AudioWaveform mode={activeMode} isPlaying={isPlaying} playheadPos={playheadPos} barCount={80} className="w-full h-full" />
                        </div>
                      </div>
                    </div>
                    {/* Playhead */}
                    <div className="absolute top-0 bottom-0 w-[2px] z-30" style={{ left: `${playheadPos}%`, backgroundColor: '#ef4444' }}>
                      <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#ef4444]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: INSPECTOR */}
          {mobileTab === 'inspector' && (
            <div className="absolute inset-0 p-3 overflow-y-auto custom-scrollbar"
              style={{
                backgroundColor: activeMode === 'color' ? '#141210' : activeMode === 'effects' ? '#141418' : '#232323',
              }}>

              {/* VU Meter */}
              <div className="mb-3">
                <VUMeter mode={activeMode} isPlaying={true} />
              </div>

              {/* Selected item */}
              <div className="mb-3">
                <h3 className="text-[9px] font-bold uppercase mb-1.5 tracking-widest"
                  style={{ color: activeMode === 'color' ? '#f39c12' : activeMode === 'effects' ? '#D8A5FA' : '#3EA6F2' }}>
                  {t.selected_item}
                </h3>
                <div className="p-2.5 rounded border"
                  style={{
                    backgroundColor: activeMode === 'color' ? '#1a1408' : activeMode === 'effects' ? '#12121f' : '#1A1A1A',
                    borderColor: activeMode === 'color' ? '#f39c1230' : activeMode === 'effects' ? '#D8A5FA20' : '#ffffff10',
                  }}>
                  <span className="text-sm font-bold text-white block">{selectedExp ? selectedExp.title : t.no_clip}</span>
                  <span className="text-xs text-gray-500">{selectedExp ? selectedExp.company : t.select_hint}</span>
                </div>
              </div>

              {/* Tech Pipeline */}
              <div className="mb-3">
                <div className="flex items-center gap-2 text-[9px] font-black uppercase mb-2 tracking-widest"
                  style={{ color: activeMode === 'color' ? '#f39c12' : activeMode === 'effects' ? '#D8A5FA' : '#3EA6F2' }}>
                  <Code size={11} /> {t.techPipeline}
                </div>
                <div className="space-y-1">
                  {t.techSkills.map(s => (
                    <div key={s.n} className="p-1.5 rounded border text-[9px] text-gray-400 flex justify-between items-center"
                      style={{
                        backgroundColor: activeMode === 'color' ? '#1a140810' : activeMode === 'effects' ? '#12121f' : '#00000030',
                        borderColor: activeMode === 'color' ? '#f39c1215' : activeMode === 'effects' ? '#D8A5FA15' : '#ffffff08',
                      }}>
                      <span>{s.n}</span>
                      <span className="text-[7px] font-bold px-1.5 border rounded-full"
                        style={{
                          color: activeMode === 'color' ? '#f39c12' : activeMode === 'effects' ? '#D8A5FA' : '#3EA6F2',
                          borderColor: activeMode === 'color' ? '#f39c1230' : activeMode === 'effects' ? '#D8A5FA30' : '#3EA6F230',
                        }}>{s.v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* GenAI */}
              <div className="mb-3">
                <div className="flex items-center gap-2 text-[9px] font-black uppercase mb-2 tracking-widest"
                  style={{ color: activeMode === 'color' ? '#fb923c' : activeMode === 'effects' ? '#c084fc' : '#a78bfa' }}>
                  <Sparkles size={11} /> {t.genAiEngine}
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {t.genAiModels.map(item => (
                    <div key={item} className="text-[8px] text-center py-1.5 rounded font-bold uppercase tracking-tighter border"
                      style={{
                        backgroundColor: activeMode === 'color' ? '#f39c1210' : activeMode === 'effects' ? '#D8A5FA10' : '#a78bfa10',
                        borderColor: activeMode === 'color' ? '#f39c1220' : activeMode === 'effects' ? '#D8A5FA20' : '#a78bfa20',
                        color: activeMode === 'color' ? '#fb923c' : activeMode === 'effects' ? '#c084fc' : '#a78bfa',
                      }}>{item}</div>
                  ))}
                </div>
              </div>

              {/* Broadcast */}
              <div className="mb-3">
                <div className="flex items-center gap-2 text-[9px] font-black uppercase mb-2 tracking-widest"
                  style={{ color: activeMode === 'color' ? '#fbbf24' : activeMode === 'effects' ? '#34d399' : '#10b981' }}>
                  <Network size={11} /> {t.broadcastSys}
                </div>
                <div className="flex flex-wrap gap-1">
                  {t.broadcastSystemsList.map(item => (
                    <div key={item} className="text-[8px] py-1 px-2 rounded font-bold uppercase tracking-tight border"
                      style={{
                        backgroundColor: activeMode === 'color' ? '#fbbf2410' : activeMode === 'effects' ? '#34d39910' : '#10b98110',
                        borderColor: activeMode === 'color' ? '#fbbf2420' : activeMode === 'effects' ? '#34d39920' : '#10b98120',
                        color: activeMode === 'color' ? '#fbbf24' : activeMode === 'effects' ? '#34d399' : '#10b981',
                      }}>{item}</div>
                  ))}
                </div>
              </div>

              {/* Tech specs */}
              <div className="mb-3">
                <h3 className="text-[9px] font-bold uppercase mb-1.5 tracking-widest"
                  style={{ color: activeMode === 'color' ? '#f39c12' : activeMode === 'effects' ? '#D8A5FA' : '#666' }}>
                  {t.tech_specs}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded text-center border"
                    style={{
                      backgroundColor: activeMode === 'color' ? '#1a1408' : activeMode === 'effects' ? '#12121f' : '#1A1A1A',
                      borderColor: activeMode === 'color' ? '#f39c1215' : activeMode === 'effects' ? '#D8A5FA15' : '#ffffff08',
                    }}>
                    <span className="text-[9px] text-gray-500 block">{t.frame_rate}</span>
                    <span className="text-xs font-mono text-white">23.976</span>
                  </div>
                  <div className="p-2 rounded text-center border"
                    style={{
                      backgroundColor: activeMode === 'color' ? '#1a1408' : activeMode === 'effects' ? '#12121f' : '#1A1A1A',
                      borderColor: activeMode === 'color' ? '#f39c1215' : activeMode === 'effects' ? '#D8A5FA15' : '#ffffff08',
                    }}>
                    <span className="text-[9px] text-gray-500 block">{t.resolution}</span>
                    <span className="text-xs font-mono text-white">3840x2160</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Bottom Tab Bar — adapts per mode */}
        <div className="h-14 border-t flex items-center justify-around shrink-0 z-30"
          style={{
            backgroundColor: activeMode === 'color' ? '#0d0d0d' : activeMode === 'effects' ? '#111118' : '#111',
            borderColor: activeMode === 'color' ? '#f39c1220' : activeMode === 'effects' ? '#D8A5FA20' : '#ffffff18'
          }}>
          {([
            { id: 'bin' as const, icon: <Folder size={18} />, label: t.mob_bin },
            { id: 'monitor' as const, icon: <MonitorPlay size={18} />, label: t.mob_monitor },
            { id: 'timeline' as const, icon: activeMode === 'effects' ? <Layers size={18} /> : <Scissors size={18} />, label: t.mob_timeline },
            { id: 'inspector' as const, icon: <Sliders size={18} />, label: t.mob_info },
          ]).map(tab => (
            <button key={tab.id} onClick={() => setMobileTab(tab.id)}
              className="flex flex-col items-center gap-1 p-2 transition-colors"
              style={{ color: mobileTab === tab.id ? headerInfo.accent : '#666' }}>
              {tab.icon}
              <span className="text-[8px] font-bold uppercase">{tab.label}</span>
              {mobileTab === tab.id && (
                <div className="w-4 h-[2px] rounded-full" style={{ backgroundColor: headerInfo.accent }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ========== DESKTOP PRO INTERFACE ========== */}
      <div className="hidden md:flex flex-col h-screen overflow-hidden">

      {isJobSelected && selectedExp && (
        <ExperienceDetailMonitor experience={selectedExp} onClose={() => setSelectedExp(null)} accentColor={headerInfo.accent} mode={activeMode} getExpIcon={getExpIcon} />
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
                activeMode === m ? (m === 'effects' ? 'tab-active-ae' : m === 'color' ? 'tab-active-dr' : 'tab-active-pr') : 'text-muted-foreground hover:text-secondary-foreground'
              }`}
              onClick={() => switchMode(m)}
            >
              {m === 'editing' ? t.editing : m === 'color' ? t.color : t.effects}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <button onClick={() => setLang(lang === 'es' ? 'en' : 'es')} className="flex items-center gap-2 px-2 md:px-3 py-1 rounded-sm text-[9px] md:text-[10px] font-black uppercase tracking-widest bg-white/10 text-secondary-foreground hover:bg-white/20 transition-all border border-white/5">
            <Languages size={12} /> <span className="hidden md:inline">{t.lang}</span><span className="md:hidden">{lang.toUpperCase()}</span>
          </button>
          <button onClick={() => setShowExportModal(true)}
            className={`flex items-center gap-2 px-2 md:px-3 py-1 rounded-sm text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${
              activeMode === 'effects' ? 'bg-aftereffects text-black hover:bg-white' : activeMode === 'color' ? 'bg-davinci text-black hover:bg-white' : 'bg-premiere text-white hover:bg-white hover:text-black'
            }`}>
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
                <button key={tab.id} onClick={() => setActiveProjectTab(tab.id)}
                  className={`px-3 py-2 text-[9px] font-bold uppercase transition-all border-r border-black/20 ${activeProjectTab === tab.id ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-secondary-foreground'}`}
                  style={activeProjectTab === tab.id ? { borderTop: `2px solid ${headerInfo.accent}` } : {}}>
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex items-center px-2 gap-1 text-muted-foreground"><Grid size={10} /><List size={10} /></div>
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
                {currentFolder === 'root' && (
                  <>
                    {activeMode === 'editing' && (
                      <div className="text-muted-foreground text-[10px] mb-2 px-2 flex items-center gap-2 font-bold uppercase tracking-widest mt-2 cursor-pointer group">
                        <ChevronDown size={10} /><Folder size={12} className="text-premiere" /> 📁 {t.assets}
                        <span className="ml-auto opacity-20 text-[7px]">{t.exp_data.length} {t.items}</span>
                      </div>
                    )}
                    {t.exp_data.map(exp => (
                      <div key={exp.id} onClick={() => setSelectedExp(exp)} draggable onDragStart={(e) => handleDragStart(e, exp)}
                        className={`group flex items-center p-1 rounded-sm cursor-grab active:cursor-grabbing transition-all draggable-item ${
                          selectedExp?.id === exp.id ? activeMode === 'effects' ? 'bg-[#4B4B4B] text-aftereffects' : activeMode === 'color' ? 'bg-[#333] border border-davinci/50' : 'bg-[#383838] text-foreground border-l-2 border-premiere' : 'hover:bg-white/5 text-muted-foreground hover:text-foreground'
                        }`}>
                        <div className="w-[50%] flex items-center gap-2 px-1 truncate">
                          {activeMode === 'effects' ? <AeCompIcon color={selectedExp?.id === exp.id ? "#D8A5FA" : "#888"} /> : exp.id === 'motion' ? (activeMode === 'editing' ? <PrSequenceIcon /> : <DrSequenceIcon />) : <Film size={12} className="shrink-0" />}
                          <span className="truncate">{exp.title}</span>
                        </div>
                        <div className="w-[25%] px-2 text-[8px] opacity-40">23.976</div>
                        <div className="w-[25%] px-2 text-[8px] opacity-40 truncate">Movie File</div>
                      </div>
                    ))}

                    <div onClick={() => setCurrentFolder('proyectos')}
                      className={`group flex items-center p-1 rounded-sm cursor-pointer transition-all hover:bg-white/5 ${activeMode === 'effects' ? 'text-secondary-foreground' : activeMode === 'color' ? 'text-davinci' : 'text-orange-400'}`}>
                      <div className="w-full flex items-center gap-2 px-1 truncate">
                        <Folder size={12} className="text-yellow-600 shrink-0" />
                        <span className="truncate font-bold">{t.artisticProjects}</span>
                      </div>
                    </div>

                    <div onClick={() => setSelectedExp({ type: 'education', id: 'edu_comp', title: t.eduComp } as any)} draggable onDragStart={(e) => handleDragStart(e, { type: 'education', id: 'edu_comp', title: t.eduComp })}
                      className={`group flex items-center p-1 rounded-sm cursor-grab active:cursor-grabbing draggable-item transition-all ${
                        isEducationSelected ? activeMode === 'effects' ? 'bg-[#4B4B4B] text-emerald-400' : activeMode === 'color' ? 'bg-[#333] border border-davinci/50' : 'bg-premiere text-white shadow-lg' : 'hover:bg-white/5 text-emerald-400'
                      }`}>
                      <div className="w-[50%] flex items-center gap-2 px-1 truncate">
                        {activeMode === 'effects' ? <AeCompIcon color="#10b981" /> : <GraduationCap size={14} className="shrink-0" />}
                        <span className="truncate">{t.eduComp}</span>
                      </div>
                      <div className="w-[25%] px-2 text-[8px] opacity-40">Dynamic</div>
                      <div className="w-[25%] px-2 text-[8px] opacity-40">Comp</div>
                    </div>

                    <div className="mt-2 mb-2 mx-1 p-2 bg-yellow-900/20 border border-yellow-600/30 rounded flex gap-2">
                      <Info size={14} className="text-yellow-500 shrink-0 mt-0.5" />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-yellow-500 uppercase tracking-wider">{t.workspaceTip}</span>
                        <span className="text-[9px] text-yellow-200/70 leading-relaxed">{t.tipDesc}</span>
                      </div>
                    </div>
                  </>
                )}

                {currentFolder === 'proyectos' && (
                  <div className="flex flex-col h-full">
                    <div onClick={() => setCurrentFolder('root')} className="flex items-center gap-2 p-2 border-b border-white/5 text-muted-foreground hover:text-foreground cursor-pointer bg-white/5 hover:bg-white/10 transition-colors">
                      <ArrowLeft size={12} /><Folder size={12} className="text-yellow-600" />
                      <span className="text-[10px] font-bold">.. / {t.backToBin}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 p-2 bg-[#1A1A1A] flex-1 overflow-y-auto">
                      {t.art_data.map(proj => (
                        <div key={proj.id} draggable onDragStart={(e) => handleDragStart(e, proj)}
                          onClick={() => { setSelectedExp(proj); if (proj.url && proj.type !== 'video') openUrl(proj.url); }}
                          className={`group flex flex-col cursor-grab active:cursor-grabbing draggable-item transition-all border border-transparent hover:border-white/20 rounded overflow-hidden ${selectedExp?.id === proj.id ? 'ring-1 ring-white/40' : ''}`}>
                          <div className="aspect-video bg-[#0f0f0f] relative flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-black/0 to-black/80"></div>
                            <div className="w-full h-full opacity-30 flex flex-col">
                              <div className="flex-1" style={{ backgroundColor: proj.color, opacity: 0.2 }}></div>
                              <div className="flex-1 bg-zinc-800"></div>
                            </div>
                            <Play size={16} className="absolute text-white/50 group-hover:text-white group-hover:scale-125 transition-all" />
                            <span className="absolute bottom-1 right-1 text-[8px] font-mono text-muted-foreground bg-black/60 px-1 rounded">{proj.duration}</span>
                          </div>
                          <div className={`p-1.5 text-[9px] truncate font-medium flex items-center gap-1 ${selectedExp?.id === proj.id ? 'bg-premiere text-white' : 'bg-[#232323] text-secondary-foreground'}`}>
                            <ImageIcon size={8} className="opacity-70" /><span className="truncate">{proj.title}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
              <span className="hidden md:inline text-[8px] text-muted-foreground bg-black/40 px-1.5 rounded-sm">{monitorFormat === 'landscape' ? '1920 x 1080 (1.0)' : '1080 x 1920 (9:16)'}</span>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setMonitorFormat(prev => prev === 'landscape' ? 'portrait' : 'landscape')} className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/20 hover:bg-white/10 border border-white/5 transition-colors group" title="Toggle Format (F)">
                {monitorFormat === 'landscape' ? <Smartphone size={10} className="text-muted-foreground group-hover:text-foreground" /> : <Monitor size={10} className="text-muted-foreground group-hover:text-foreground" />}
                <span className="text-[8px] font-bold text-muted-foreground group-hover:text-foreground uppercase">{monitorFormat === 'landscape' ? 'Desktop' : 'Social'}</span>
              </button>
              <span className="text-[12px] font-mono font-bold transition-colors" style={{ color: headerInfo.accent }}>{getTimecode(playheadPos)}</span>
            </div>
          </div>

          <div className="flex-1 relative flex flex-col items-center justify-center overflow-hidden bg-black group transition-all duration-500"
            onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>

            {/* Dynamic canvas container */}
            <div className={`relative overflow-hidden transition-all duration-500 ease-in-out shadow-2xl flex flex-col items-center justify-center
              ${monitorFormat === 'landscape' ? 'w-full h-full' : 'h-[95%] aspect-[9/16] border border-white/10 rounded-sm'}
              bg-gradient-to-b from-zinc-900 to-black ${isDragOverMonitor ? 'drop-active' : ''}`}>

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

              {/* Drag & drop hint */}
              {isDragOverMonitor && (
                <div className="absolute inset-0 z-50 bg-green-500/10 flex items-center justify-center pointer-events-none backdrop-blur-[1px]">
                  <div className="bg-black/80 px-6 py-3 rounded-lg border border-green-500/50 flex flex-col items-center gap-2 shadow-2xl animate-in zoom-in duration-200">
                    <MonitorPlay size={40} className="text-green-500 animate-bounce" />
                    <span className="text-xs font-black uppercase text-green-500 tracking-widest">Drop to Load Media</span>
                  </div>
                </div>
              )}

              {/* MONITOR CONTENT */}
              <div className="text-center z-10 space-y-4 px-6 relative w-full flex flex-col items-center justify-center h-full">
                {isEducationSelected ? (
                  <div className="w-full h-full relative bg-black font-mono flex flex-col">
                    <div className="absolute inset-0 flex flex-col pointer-events-none opacity-50">
                      <div className="h-[67%] flex w-full">
                        <div className="bg-[#c0c0c0] flex-1"></div><div className="bg-[#c0c000] flex-1"></div><div className="bg-[#00c0c0] flex-1"></div><div className="bg-[#00c000] flex-1"></div><div className="bg-[#c000c0] flex-1"></div><div className="bg-[#c00000] flex-1"></div><div className="bg-[#0000c0] flex-1"></div>
                      </div>
                      <div className="h-[8%] flex w-full">
                        <div className="bg-[#0000c0] flex-1"></div><div className="bg-[#131313] flex-1"></div><div className="bg-[#c000c0] flex-1"></div><div className="bg-[#131313] flex-1"></div><div className="bg-[#00c0c0] flex-1"></div><div className="bg-[#131313] flex-1"></div><div className="bg-[#c0c0c0] flex-1"></div>
                      </div>
                      <div className="h-[25%] flex w-full">
                        <div className="bg-[#00214c] flex-[1.2]"></div><div className="bg-[#ffffff] flex-[1.2]"></div><div className="bg-[#32006a] flex-[1.2]"></div><div className="bg-[#131313] flex-[4]"></div>
                      </div>
                    </div>
                    <div className="absolute inset-0 z-10 p-2 md:p-3 lg:p-4 flex flex-col justify-start items-start text-foreground bg-black/40 backdrop-blur-sm overflow-y-auto custom-scrollbar">
                      <div className="w-full flex justify-between items-end border-b-2 border-foreground/70 mb-2 pb-1.5">
                        <h2 className={`${monitorFormat === 'portrait' ? 'text-xl' : 'text-lg md:text-2xl'} font-black uppercase tracking-tight bg-black/50 px-2`}>{t.education_title}</h2>
                        <span className="text-[9px] md:text-[10px] font-mono bg-black/50 px-2">REF: EDU_SEQ_01</span>
                      </div>
                      <div className="space-y-1 md:space-y-1.5 w-full max-w-5xl mx-auto">
                        {t.edu_data.map((edu, i) => (
                          <div key={i} className={`flex ${monitorFormat === 'portrait' ? 'flex-col gap-1' : 'md:grid md:grid-cols-[5rem_minmax(0,1fr)] md:gap-3'} items-start group w-full bg-black/30 px-2 py-1 md:py-1.5 hover:bg-black/60 transition-colors`}>
                            <span className="text-premiere font-black text-base md:text-lg w-20 shrink-0 leading-none">{edu.year}</span>
                            <div className="flex-1 border-b border-foreground/30 pb-1 group-hover:border-foreground/60 transition-colors w-full min-w-0">
                              <span className={`${monitorFormat === 'portrait' ? 'text-[11px]' : 'text-[11px] md:text-sm lg:text-base'} block font-bold uppercase tracking-tight leading-tight break-words`}>{edu.label}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 pt-2 text-[9px] font-mono text-muted-foreground w-full justify-between bg-black/50 p-1.5 hidden 2xl:flex">
                        <span>SMPTE UNIVERSAL LEADER</span>
                        <span>TC: {getTimecode(playheadPos)}</span>
                      </div>
                    </div>
                  </div>
                ) : isVideoSelected && selectedExp ? (
                  (() => {
                    const embedSrc = selectedExp.url ? getEmbedUrl(selectedExp.url) : null;
                    return embedSrc ? (
                      <div className="w-full h-full absolute inset-0 bg-black animate-in fade-in duration-500 overflow-hidden">
                        <button onClick={() => setSelectedExpId(null)} className="absolute top-2 right-2 z-40 bg-black/70 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold hover:bg-white/20 transition-colors">✕</button>
                        <iframe src={embedSrc} className="w-full h-full" allow="autoplay; fullscreen; encrypted-media" allowFullScreen frameBorder="0" />
                      </div>
                    ) : (
                      <div className="w-full h-full absolute inset-0 bg-black flex flex-col items-center justify-center animate-in fade-in duration-500 overflow-hidden">
                        <div className={`absolute inset-0 opacity-40 transition-all duration-300 ${signalStatus === 'POOR' ? 'signal-pixelated' : ''} ${signalStatus === 'FROZEN' ? 'signal-frozen' : ''}`}
                          style={{ background: `radial-gradient(circle at center, ${selectedExp.color}20 0%, transparent 70%)` }}></div>
                        <div className="relative z-10 text-center space-y-4">
                          <h2 className={`${monitorFormat === 'portrait' ? 'text-2xl' : 'text-3xl md:text-5xl'} font-black text-foreground uppercase tracking-tight`}>{selectedExp.title}</h2>
                          <p className="text-muted-foreground font-mono text-xs">{selectedExp.duration}</p>
                          {selectedExp.url && (
                            <button onClick={() => openUrl(selectedExp.url!)} className="px-4 py-2 bg-premiere text-white rounded text-xs font-bold mt-2 hover:bg-premiere/80 transition-colors">
                              Abrir en nueva pestaña ↗
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="flex flex-col items-center justify-center h-full w-full px-4 overflow-hidden">
                    <div className={`inline-block px-3 py-1 rounded text-[8px] md:text-[10px] font-black text-foreground uppercase tracking-[0.2em] shadow-lg transition-all duration-500 ${
                      signalStatus === 'LIVE' ? (isPlaying ? (activeMode === 'color' ? 'bg-davinci animate-pulse' : 'bg-emerald-600 animate-pulse') : 'bg-premiere/30 border border-premiere/20') :
                      (signalStatus === 'POOR' ? 'bg-yellow-600/80' : 'bg-red-600/80')} ${monitorFormat === 'portrait' ? 'mb-3' : 'mb-6'}`}>
                      {signalStatus === 'LIVE' ? (isPlaying ? t.playing : t.paused) : signalStatus === 'POOR' ? t.weak_signal : t.no_signal}
                    </div>

                    <div className={`transition-all duration-500 relative w-full ${signalStatus === 'POOR' ? 'signal-pixelated' : ''} ${signalStatus === 'FROZEN' ? 'signal-frozen' : ''}`}
                      style={{ containerType: 'inline-size' }}>
                      <h1 className={`font-black tracking-tight text-foreground uppercase leading-[0.95] pointer-events-none transition-all duration-500 ease-out flex flex-col items-center w-full max-w-full px-2 md:px-4 ${
                        monitorFormat === 'landscape' ? 'gap-0 text-center' : 'gap-1 text-center'
                      }`}
                        style={{ fontSize: monitorFormat === 'portrait' ? 'min(2.2rem, 15cqi)' : 'clamp(2.6rem, 11cqi, 6.25rem)' }}>
                        <span className="max-w-full">Tania</span>
                        <span className={`max-w-full ${monitorFormat === 'portrait' ? 'text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500' : ''}`}>Salvatella</span>
                      </h1>
                      {signalStatus === 'POOR' && <div className="absolute inset-0 bg-gradient-to-t from-transparent via-green-500/20 to-transparent mix-blend-color-dodge pointer-events-none" style={{ backgroundSize: '100% 4px' }}></div>}
                    </div>

                    <div className={`transition-all duration-500 text-center ${monitorFormat === 'portrait' ? 'mt-3 px-2' : 'mt-6'}`}>
                      <p className={`${monitorFormat === 'portrait' ? 'text-[10px] tracking-[0.15em]' : 'text-[10px] md:text-sm lg:text-lg tracking-[0.4em]'} text-muted-foreground uppercase font-light italic pointer-events-none transition-all duration-300 ${signalStatus === 'FROZEN' ? 'opacity-40 blur-[2px]' : ''}`}>{t.job_title}</p>
                    </div>
                    <div className={`flex items-center justify-center transition-all duration-500 text-center ${monitorFormat === 'portrait' ? 'mt-3 px-2 min-h-[2.5rem]' : 'mt-4 h-16'}`}>
                      <p className={`${monitorFormat === 'portrait' ? 'text-[11px]' : 'text-xs md:text-lg lg:text-xl'} text-muted-foreground max-w-lg italic font-serif transition-all duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}>"{t.phrases[phraseIndex]}"</p>
                    </div>

                    {signalStatus === 'FROZEN' && (
                      <div className="absolute inset-0 flex items-center justify-center z-50">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-8 h-8 border-2 border-white/20 border-t-foreground rounded-full animate-spin"></div>
                          <span className="text-[10px] font-bold text-foreground tracking-widest bg-black/50 px-2 rounded">BUFFERING...</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Color info overlay */}
              <div className="absolute bottom-4 right-4 hidden md:flex items-center gap-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-1">
                  {['R','G','B','A'].map(c => <span key={c} className="text-[8px] text-muted-foreground font-bold border border-white/10 px-1 rounded-sm">{c}</span>)}
                </div>
                <span className="text-[9px] text-muted-foreground font-mono">16 bpc / Half Res</span>
              </div>
            </div>
          </div>

          <div className={`p-2 border-t border-black flex items-center justify-center gap-8 shrink-0 relative overflow-hidden ${activeMode === 'color' ? 'bg-[#151515]' : 'bg-panel-header'}`}>
            <div className="absolute left-4 hidden lg:flex items-center gap-2">
              <SkipBack size={14} className="text-muted-foreground cursor-pointer" />
              <div className="w-px h-3 bg-muted"></div>
              <SkipForward size={14} className="text-muted-foreground cursor-pointer" />
            </div>
            <button onClick={() => { const newPlaying = !isPlaying; setIsPlaying(newPlaying); if (newPlaying) setShowWarning(true); }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-white text-black scale-110 shadow-xl' : 'bg-[#3D3D3D] text-white hover:bg-[#4D4D4D]'}`}>
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
            </button>
            <div className="absolute right-4 hidden lg:flex items-center gap-3">
              <Settings size={14} className="text-muted-foreground cursor-pointer" />
              <Maximize2 size={14} className="text-muted-foreground cursor-pointer" />
            </div>
          </div>
        </section>

        {/* INSPECTOR (RIGHT) */}
        <section className={`order-3 md:order-3 col-span-12 md:col-span-2 flex flex-col overflow-hidden ${activeMode === 'effects' ? 'bg-[#232323]' : activeMode === 'color' ? 'bg-[#1a1a1a]' : 'bg-[#232323]'} border border-black/50 h-64 md:h-auto`}>
          {/* Fixed header */}
          <div className="flex justify-between items-center text-[10px] font-bold text-foreground uppercase tracking-widest border-b border-black px-4 py-2 shrink-0"
            style={{ backgroundColor: activeMode === 'effects' ? '#232323' : activeMode === 'color' ? '#1a1a1a' : '#232323' }}>
            <div className="flex items-center gap-2">
              {activeMode === 'color' ? <Layers2 size={12} className="text-davinci" /> : <Sliders size={12} className={activeMode === 'effects' ? 'text-aftereffects' : 'text-premiere'} />}
              <span>{activeMode === 'color' ? t.nodes : t.inspector}</span>
            </div>
            <button className="text-[7px] text-muted-foreground uppercase hover:text-foreground transition-colors">{t.reset}</button>
          </div>
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <TechSkillsList t={t} activeMode={activeMode} />
          </div>
        </section>
      </main>

      {/* TIMELINE */}
      <section className={`${activeMode === 'color' ? 'h-48 md:h-[280px]' : 'h-48 md:h-80'} bg-panel-deep border-t border-black flex overflow-hidden shrink-0`}>
        {activeMode === 'color' ? (
          <ColorTimeline t={t} selectedExp={selectedExp} setSelectedExp={setSelectedExp} wheelStates={wheelStates} onWheelMouseDown={handleWheelMouseDown} lang={lang} />
        ) : activeMode === 'effects' ? (
          <EffectsTimeline
            t={t} selectedExp={selectedExp} setSelectedExp={setSelectedExp}
            expandedLayers={expandedAeLayers} toggleLayerExpansion={toggleAeLayer}
            aeKeyframes={aeKeyframes} draggingKeyframe={draggingKeyframe}
            onKeyframeMouseDown={handleKeyframeMouseDown}
            aeLayerOffsets={aeLayerOffsets} onAeLayerMouseDown={handleAeLayerMouseDown}
            playheadPos={playheadPos} timelineContentRef={timelineContentRef} timelineRef={timelineRef} lang={lang}
          />
        ) : (
          <EditingTimeline t={t} selectedExp={selectedExp} setSelectedExp={setSelectedExp} playheadPos={playheadPos} lang={lang} getTimecode={getTimecode} activeMode={activeMode} isPlaying={isPlaying} />
        )}

        {/* Audio meters */}
        <div className="w-16 md:w-24 bg-panel-header border-l border-black flex flex-col p-2 shrink-0">
          <div className="text-[7px] text-muted-foreground font-black mb-1 uppercase tracking-tighter text-center">
            {lang === 'es' ? 'Nivel Audio' : 'Audio Level'}
          </div>
          <div className="flex-1 flex justify-center gap-1.5 px-2">
            {[0, 1].map(i => (
              <div key={i} className="w-2 bg-black rounded-sm relative overflow-hidden flex flex-col justify-end border border-white/5">
                <div className={`w-full bg-gradient-to-t from-emerald-500 via-yellow-400 to-red-600 ${isPlaying ? 'meter-bar' : ''}`}
                  style={{ animationDuration: `${0.2 + i * 0.1}s`, height: isPlaying ? undefined : '15%' }}></div>
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
              <div className={`h-full ${activeMode === 'color' ? 'bg-davinci/60' : 'bg-premiere/60'}`}
                style={{ width: skill.v === 'EXPERT' || skill.v === 'EXPERTO' ? '95%' : skill.v === 'PRO' ? '85%' : skill.v === 'MID' ? '70%' : '50%' }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
    <div className="pt-2">
      <div className="flex items-center gap-2 text-[10px] text-aftereffects font-black uppercase mb-3"><Sparkles size={12} /> {t.genAiEngine}</div>
      <div className="grid grid-cols-2 gap-1.5">
        {t.genAiModels.map((item: string) => (
          <div key={item} className="bg-aftereffects/10 border border-aftereffects/20 text-[8px] text-center py-1.5 text-aftereffects rounded font-bold uppercase tracking-tighter hover:bg-aftereffects/20 cursor-default">{item}</div>
        ))}
      </div>
    </div>
    <div className="pt-4">
      <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-black uppercase mb-3"><Network size={12} /> {t.broadcastSys}</div>
      <div className="flex flex-wrap gap-1">
        {t.broadcastSystemsList?.map((item: string) => (
          <div key={item} className="bg-emerald-500/10 border border-emerald-500/20 text-[7px] py-1 px-1.5 text-emerald-300 rounded font-bold uppercase tracking-tight cursor-default">{item}</div>
        ))}
      </div>
    </div>
  </div>
);

const ColorTimeline = ({ t, selectedExp, setSelectedExp, wheelStates, onWheelMouseDown, lang }: any) => (
  <div className="flex-1 flex flex-col bg-[#121212]">
    <div className="h-20 bg-[#1D1D1D] border-b border-black flex items-center px-4 gap-3 overflow-x-auto custom-scrollbar">
      {t.exp_data.map((exp: ExperienceItem, idx: number) => (
        <div key={exp.id} onClick={() => setSelectedExp(exp)}
          className={`w-32 h-14 shrink-0 rounded border transition-all flex flex-col overflow-hidden group cursor-pointer ${selectedExp?.id === exp.id ? 'border-davinci shadow-[0_0_15px_rgba(243,156,18,0.2)]' : 'border-white/5'}`}>
          <div className="flex-1 bg-black/40 flex flex-col items-center justify-center relative">
            <span className="text-[14px] text-muted-foreground font-black z-10">{idx + 1}</span>
          </div>
          <div className={`h-4 text-[8px] flex items-center px-2 font-bold uppercase truncate ${selectedExp?.id === exp.id ? 'bg-davinci text-black' : 'bg-secondary text-muted-foreground'}`}>{exp.title}</div>
        </div>
      ))}
    </div>
    <div className="flex-1 flex items-center justify-around px-8 overflow-x-auto bg-[#181818]">
      {(['lift', 'gamma', 'gain'] as const).map(wheelId => (
        <div key={wheelId} className="flex flex-col items-center gap-3 shrink-0 mx-2">
          <div className="flex justify-between w-full px-2 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
            <span>{wheelId}</span><span className="text-davinci">0.00</span>
          </div>
          <div id={`wheel-${wheelId}`} className="dr-wheel w-20 h-20 md:w-28 md:h-28 rounded-full flex items-center justify-center relative group" onMouseDown={(e) => onWheelMouseDown(e, wheelId)}>
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-500/5 to-davinci/5 rounded-full"></div>
            <div className="w-full h-[1px] bg-white/10 absolute"></div>
            <div className="h-full w-[1px] bg-white/10 absolute"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-white absolute border border-black/50 shadow-lg pointer-events-none" style={{ left: `${wheelStates[wheelId].x}%`, top: `${wheelStates[wheelId].y}%`, transform: 'translate(-50%, -50%)' }}></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const EffectsTimeline = ({ t, selectedExp, setSelectedExp, expandedLayers, toggleLayerExpansion, aeKeyframes, draggingKeyframe, onKeyframeMouseDown, aeLayerOffsets, onAeLayerMouseDown, playheadPos, timelineContentRef, timelineRef, lang }: any) => (
  <div className="flex-1 flex overflow-hidden bg-[#161616]">
    <div className="hidden md:flex w-[350px] lg:w-[450px] border-r border-black flex-col shrink-0 bg-[#1D1D1D]">
      <div className="h-6 bg-[#232323] border-b border-black flex items-center px-2 text-[9px] font-bold text-muted-foreground uppercase shrink-0">
        <div className="w-6 text-center">#</div>
        <div className="w-40 flex-1 ml-2">{t.layerLabel}</div>
        <div className="w-8 text-center text-[8px]">Mode</div>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar custom-scrollbar bg-[#191919]">
        {t.exp_data.map((exp: ExperienceItem, idx: number) => (
          <React.Fragment key={exp.id}>
            <div onClick={() => setSelectedExp(exp)}
              className={`ae-row cursor-pointer ${selectedExp?.id === exp.id ? 'selected' : ''}`}>
              <div className="ae-cell w-6 text-center opacity-50">{idx + 1}</div>
              <div className="ae-cell w-6 flex justify-center"><Eye size={10} className="text-muted-foreground" /></div>
              <div className="ae-cell w-4 text-center"><div className="w-3 h-3 rounded-sm" style={{ backgroundColor: exp.labelAe }}></div></div>
              <div className="ae-cell flex-1 flex items-center gap-1 font-medium overflow-hidden">
                <div onClick={(e) => { e.stopPropagation(); toggleLayerExpansion(exp.id); }} className="p-0.5 hover:bg-white/10 rounded cursor-pointer">
                  {expandedLayers[exp.id] ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                </div>
                <span className="truncate">{exp.title}</span>
              </div>
              <div className="ae-cell w-8 text-center">Normal</div>
            </div>
            {expandedLayers[exp.id] && (
              <>
                <div className="ae-row" style={{ backgroundColor: '#1e1e1e' }}>
                  <div className="w-16"></div>
                  <div className="flex items-center gap-1 pl-2">
                    <ChevronDown size={10} className="text-muted-foreground" />
                    <Folder size={10} className="text-muted-foreground" />
                    <span className="text-[9px] font-bold text-muted-foreground">Transform</span>
                  </div>
                </div>
                {[
                  { name: lang === 'es' ? 'Punto Anclaje' : 'Anchor Point', val: '960.0, 540.0' },
                  { name: lang === 'es' ? 'Posición' : 'Position', val: '960.0, 540.0' },
                  { name: lang === 'es' ? 'Escala' : 'Scale', val: '100.0, 100.0 %' },
                  { name: lang === 'es' ? 'Rotación' : 'Rotation', val: '0x +0.0°' },
                  { name: lang === 'es' ? 'Opacidad' : 'Opacity', val: '100 %' }
                ].map((prop, pIdx) => (
                  <div key={pIdx} className="ae-row" style={{ backgroundColor: '#1e1e1e' }}>
                    <div className="w-20"></div>
                    <div className="flex-1 flex items-center gap-4 pl-2">
                      <div className="flex items-center gap-2 w-24">
                        <AeStopwatch active />
                        <span className="text-[9px] text-muted-foreground">{prop.name}</span>
                      </div>
                      <div className="text-premiere text-[9px] font-mono cursor-ew-resize">{prop.val}</div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
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
          <div className="absolute inset-0 w-full h-full pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="absolute top-0 bottom-0 border-l border-white/5" style={{ left: `${i * 10}%` }}></div>
            ))}
          </div>
          {t.exp_data.map((exp: ExperienceItem) => {
            const offset = aeLayerOffsets[exp.id] || 0;
            return (
              <React.Fragment key={`bars-${exp.id}`}>
                <div className="ae-timeline-row bg-[#1e1e1e]">
                  <div className="absolute h-4 top-[2px] rounded-sm flex items-center cursor-grab active:cursor-grabbing border border-black/30 opacity-90"
                    style={{ left: `${offset}%`, width: '45%', backgroundColor: exp.labelAe }}
                    onMouseDown={(e) => onAeLayerMouseDown(e, exp.id)}
                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); setSelectedExp(exp); }}>
                    <div className="w-full h-1/2 bg-black/10 absolute top-0"></div>
                  </div>
                </div>
                {expandedLayers[exp.id] && (
                  <>
                    <div className="ae-timeline-row bg-[#1e1e1e] opacity-50"></div>
                    {[0, 1, 2, 3, 4].map(pIdx => (
                      <div key={pIdx} className="ae-timeline-row bg-[#191919] flex items-center relative">
                        {aeKeyframes.filter((k: any) => k.layerId === exp.id && k.propIdx === pIdx).map((kf: any) => (
                          <div key={kf.id} style={{ left: `${kf.pos}%` }} className="absolute h-full w-0 flex items-center justify-center z-20" onMouseDown={(e) => onKeyframeMouseDown(e, kf.id)}>
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
        <div className="absolute top-0 bottom-0 w-[1px] bg-premiere z-30 pointer-events-none" style={{ left: `${playheadPos}%` }}>
          <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-premiere -ml-[3.5px]"></div>
        </div>
      </div>
    </div>
  </div>
);

const EditingTimeline = ({ t, selectedExp, setSelectedExp, playheadPos, lang, getTimecode, activeMode, isPlaying }: any) => (
  <div className="flex-1 flex overflow-hidden bg-[#1F1F1F]">
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="h-8 bg-secondary flex items-center px-4 border-b border-black justify-between shrink-0">
        <div className="flex items-center gap-6">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <List size={10} className="text-premiere" /> {lang === 'es' ? 'CV_Tania Salvatella_2026_v13_DEF_OK' : 'CV_Tania Salvatella_2026_v13_DEF_OK'}
          </span>
        </div>
        <div className="hidden md:flex gap-4 text-[9px] text-muted-foreground font-mono">
          <span>23.976 fps</span>
          <span className="text-premiere">{getTimecode(playheadPos)}</span>
        </div>
      </div>
      <div className="relative flex-1 overflow-hidden p-0 bg-[#1F1F1F] flex flex-col">
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
                    <span className="text-[7px] text-black/80 font-bold truncate px-1 font-mono uppercase tracking-tight z-10">[CAPTION] {t.phrases[idx % t.phrases.length]}</span>
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
                  <div onClick={() => setSelectedExp(exp)}
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
          {/* A1 Audio track — adaptive waveform */}
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
                <div key={`audio-${exp.id}`} className="h-full flex-1 flex flex-col relative overflow-hidden group border border-black/40"
                  style={{ backgroundColor: activeMode === 'color' ? '#3d2e0a' : activeMode === 'effects' ? '#1e3a5f' : '#008f7a' }}>
                  <div className="h-4 w-full bg-black/10 flex items-center px-1">
                    <span className="text-[9px] font-bold text-black/60 truncate">{exp.title} [Audio]</span>
                  </div>
                  <div className="flex-1 w-full relative flex items-center justify-center overflow-hidden px-1">
                    <DesktopAudioWaveformSVG mode={activeMode} isPlaying={isPlaying} clipId={exp.id} />
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
