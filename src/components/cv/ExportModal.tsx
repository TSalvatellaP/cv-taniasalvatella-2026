import { useState } from 'react';
import {
  X, Search, FileText, Linkedin, Video, MonitorPlay, Mail,
  Play, ExternalLink, Download, Check, Loader2
} from 'lucide-react';
import { translations } from '@/data/translations';
import { generateCV } from '@/utils/generateCV';

interface ExportModalProps {
  onClose: () => void;
  lang: string;
}

export const ExportModal = ({ onClose, lang }: ExportModalProps) => {
  const t = translations[lang];
  const [downloadingIdx, setDownloadingIdx] = useState<number | null>(null);
  const [downloadedSet, setDownloadedSet] = useState<Set<number>>(new Set());

  const handleDownload = (idx: number, pdfLang: 'es' | 'en') => {
    setDownloadingIdx(idx);
    setTimeout(() => {
      generateCV(pdfLang);
      setDownloadingIdx(null);
      setDownloadedSet(prev => new Set(prev).add(idx));
    }, 800);
  };

  const exportQueue = [
    {
      label: "CV_Tania_Salvatella_ES.pdf",
      url: "", icon: <FileText size={14} />, preset: "Master_PDF_Spanish", isDownload: true, pdfLang: 'es' as const
    },
    {
      label: "CV_Tania_Salvatella_EN.pdf",
      url: "", icon: <FileText size={14} />, preset: "Master_PDF_English", isDownload: true, pdfLang: 'en' as const
    },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/taniasalvatella/", icon: <Linkedin size={14} />, preset: "Professional_Profile" },
    { label: "Vimeo Showreel", url: "https://vimeo.com/taniasalvatella", icon: <Video size={14} />, preset: "Vimeo_Channel" },
    { label: "Behance Portfolio", url: "https://www.behance.net/taniasalvatella#", icon: <MonitorPlay size={14} />, preset: "Visual_Arts" },
    { label: "Email", url: "mailto:tsalvatellap@gmail.com", icon: <Mail size={14} />, preset: "Direct_Mail" }
  ];

  const getStatus = (idx: number, isDownload?: boolean) => {
    if (downloadingIdx === idx) return 'rendering';
    if (downloadedSet.has(idx)) return 'done';
    if (!isDownload) return 'done';
    return 'ready';
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'rendering': return lang === 'es' ? 'Renderizando...' : 'Rendering...';
      case 'done': return t.statusDone;
      default: return t.statusReady;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#2D2D2D] w-full max-w-4xl max-h-[90vh] flex flex-col rounded-lg border border-black shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="bg-[#1D1D1D] px-4 py-2 flex items-center justify-between border-b border-black shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-[#00005B] rounded flex items-center justify-center text-[10px] font-bold text-premiere">Me</div>
            <span className="text-[11px] text-secondary-foreground font-bold uppercase tracking-widest truncate">Adobe Media Encoder - Queue</span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>

        <div className="bg-[#232323] px-4 py-1.5 flex gap-4 border-b border-black text-[10px] text-muted-foreground font-medium shrink-0 overflow-x-auto">
          <span className="text-premiere cursor-pointer">Queue</span>
          <span className="hover:text-secondary-foreground cursor-pointer">Watch Folders</span>
          <div className="flex-1"></div>
        </div>

        <div className="flex-1 bg-[#1A1A1A] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="sticky top-0 bg-[#2D2D2D] text-[9px] uppercase text-muted-foreground font-bold border-b border-black">
              <tr>
                <th className="px-4 py-2 font-medium border-r border-black/10">{t.sourceFile}</th>
                <th className="px-4 py-2 font-medium border-r border-black/10">Format / Preset</th>
                <th className="px-4 py-2 font-medium border-r border-black/10">{t.statusLabel}</th>
                <th className="px-4 py-2 font-medium">{t.outputPath}</th>
              </tr>
            </thead>
            <tbody className="text-[11px] font-mono">
              {exportQueue.map((link, idx) => {
                const status = getStatus(idx, link.isDownload);
                return (
                  <tr key={idx}
                    className={`border-b border-black/20 hover:bg-white/5 group transition-colors cursor-pointer ${link.isDownload ? 'bg-blue-500/5' : ''}`}
                    onClick={() => {
                      if (link.isDownload && link.pdfLang) {
                        handleDownload(idx, link.pdfLang);
                      } else if (link.url) {
                        window.open(link.url, '_blank');
                      }
                    }}
                  >
                    <td className="px-4 py-3 flex items-center gap-3">
                      <span className="text-muted-foreground">{idx + 1}</span>
                      <div className={`flex items-center gap-2 ${link.isDownload ? 'text-premiere font-bold' : 'text-secondary-foreground'}`}>
                        {downloadingIdx === idx ? <Loader2 size={14} className="animate-spin" /> : link.icon}
                        {link.label}
                        {link.isDownload && <Download size={10} className="opacity-50" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-premiere">{link.preset}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-sm text-[9px] font-bold flex items-center gap-1 w-fit ${
                        status === 'done' ? 'bg-emerald-900/40 text-emerald-400' :
                        status === 'rendering' ? 'bg-davinci/20 text-davinci animate-pulse italic' :
                        'bg-blue-900/40 text-premiere'
                      }`}>
                        {status === 'done' && <Check size={10} />}
                        {status === 'rendering' && <Loader2 size={10} className="animate-spin" />}
                        {getStatusLabel(status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {link.isDownload ? (
                        <span className="text-muted-foreground italic">Local / Downloads</span>
                      ) : link.url ? (
                        <span className="text-premiere underline hover:text-blue-300 flex items-center gap-2">
                          {link.url.substring(0, 35)}... <ExternalLink size={10} />
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic">~/Desktop/Export/</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="bg-[#1D1D1D] p-6 border-t border-black flex flex-col md:flex-row items-center justify-between gap-4 shrink-0">
          <div className="flex gap-4 md:gap-10">
            <div className="hidden md:block">
              <p className="text-[9px] text-muted-foreground uppercase font-bold mb-1">Total Duration</p>
              <p className="text-xl text-foreground font-mono">00:15:20:00</p>
            </div>
            <div>
              <p className="text-[9px] text-muted-foreground uppercase font-bold mb-1">User Identification</p>
              <p className="text-sm text-secondary-foreground">Tania Salvatella</p>
            </div>
          </div>
          <button
            onClick={() => {
              handleDownload(0, 'es');
              setTimeout(() => handleDownload(1, 'en'), 1500);
            }}
            className="w-full md:w-auto bg-premiere hover:brightness-110 text-white px-8 py-3 rounded font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95"
          >
            <Play size={18} fill="currentColor" /> {t.startProcessing}
          </button>
        </div>
      </div>
    </div>
  );
};
