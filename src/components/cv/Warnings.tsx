import { useState } from 'react';
import { X, AlertTriangle, Info, Search, Download, FileText } from 'lucide-react';
import type { TranslationData } from '@/data/translations';

interface WarningProps {
  onOpenClassic: () => void;
  onClose: () => void;
  t: TranslationData;
}

export const AEWarning = ({ onOpenClassic, onClose, t }: WarningProps) => {
  const [showLog, setShowLog] = useState(false);
  return (
     <div className="absolute bottom-0 left-0 right-0 z-40 flex flex-col items-center max-h-[60%] overflow-y-auto">
      {showLog && (
        <div className="bg-[#1D1D1D] border border-[#333] w-[92%] max-w-[450px] rounded-md overflow-hidden animate-in zoom-in duration-200 mb-2 shadow-2xl border-orange-500/50">
          <div className="bg-[#1D1D1D] px-3 py-1.5 flex items-center justify-between border-b border-black shrink-0">
            <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest truncate">{t.ae_warning_title}</span>
            <button onClick={() => setShowLog(false)}><X size={14} className="text-muted-foreground hover:text-foreground" /></button>
          </div>
          <div className="p-4 flex gap-3 bg-[#232323]">
            <div className="text-orange-500 shrink-0"><AlertTriangle size={24} /></div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-secondary-foreground text-[11px] mb-3 leading-relaxed">{t.ae_warning_desc}</p>
              <div className="flex justify-end gap-2 flex-wrap">
                <button onClick={() => setShowLog(false)} className="px-3 py-1.5 text-[10px] bg-[#333] text-secondary-foreground hover:bg-[#444] rounded-sm">{t.cancel}</button>
                <button onClick={onOpenClassic} className="px-3 py-1.5 text-[10px] bg-aftereffects text-black font-bold rounded-sm hover:brightness-110 flex items-center gap-1.5">
                  <Download size={11} /> {t.download_pdf}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="ae-warning-bar w-full flex items-center justify-between px-2 py-1 animate-in fade-in slide-in-from-bottom duration-300 shrink-0 overflow-hidden">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="flex items-center gap-1 text-black shrink-0">
            <AlertTriangle size={12} fill="currentColor" />
            <Info size={12} fill="currentColor" />
          </div>
          <span className="text-[8px] sm:text-[10px] font-bold text-black truncate uppercase tracking-tighter">PDF Backup Available</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={() => setShowLog(true)} className="bg-black/20 hover:bg-black/30 p-1 rounded-sm transition-colors text-black">
            <Search size={12} strokeWidth={3} />
          </button>
          <button onClick={onClose} className="hover:bg-black/20 p-1 rounded-sm text-black">
            <X size={12} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
};

export const PRWarning = ({ onOpenClassic, onClose, t }: WarningProps) => (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-[1px] p-4">
    <div className="bg-[#2D2D2D] border border-premiere w-full max-w-[400px] rounded shadow-2xl overflow-hidden animate-in zoom-in duration-150">
      <div className="bg-premiere px-3 py-1 flex items-center justify-between">
        <span className="text-[10px] text-white font-bold uppercase">{t.pr_warning_title}</span>
        <X size={12} className="text-white cursor-pointer" onClick={onClose} />
      </div>
      <div className="p-6 flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="text-destructive"><FileText size={40} /></div>
          <div className="text-secondary-foreground text-xs">
            <p className="font-bold mb-1">CV_Classic_Offline.pdf</p>
            <p className="text-muted-foreground">{t.pr_warning_desc}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-6 py-1 border border-muted-foreground text-muted-foreground text-[11px] hover:bg-white/5">{t.ignore}</button>
          <button onClick={onOpenClassic} className="px-6 py-1 bg-premiere text-white text-[11px] font-bold hover:brightness-110 flex items-center gap-2">
            <Download size={12} /> {t.download_pdf}
          </button>
        </div>
      </div>
    </div>
  </div>
);

export const DRWarning = ({ onOpenClassic, onClose, t }: WarningProps) => (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 p-4">
    <div className="bg-[#1A1A1A] border border-white/10 w-full max-w-[380px] rounded-lg p-1 animate-in zoom-in duration-200">
      <div className="p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-davinci flex items-center justify-center text-davinci">
            <Info size={24} />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-foreground font-bold text-sm">{t.dr_warning_title}</h3>
          <p className="text-muted-foreground text-xs px-4">{t.dr_warning_desc}</p>
        </div>
        <div className="flex flex-col gap-2">
          <button onClick={onOpenClassic} className="w-full py-2 bg-davinci text-black font-bold rounded-md hover:brightness-110 transition-colors text-xs flex items-center justify-center gap-2">
            <Download size={14} /> {t.download_pdf}
          </button>
          <button onClick={onClose} className="w-full py-2 bg-[#2a2a2a] text-muted-foreground rounded-md hover:text-foreground transition-colors text-xs">
            {t.follow_dr}
          </button>
        </div>
      </div>
    </div>
  </div>
);
