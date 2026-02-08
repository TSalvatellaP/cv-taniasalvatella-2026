import { X } from 'lucide-react';
import { NodeGraph } from './NodeGraph';
import type { ExperienceItem } from '@/data/translations';

type Mode = 'editing' | 'effects' | 'color';

interface ExperienceDetailMonitorProps {
  experience: ExperienceItem;
  onClose: () => void;
  accentColor: string;
  mode: Mode;
  getExpIcon: (iconName: string, size: number) => React.ReactNode;
}

export const ExperienceDetailMonitor = ({ experience, onClose, accentColor, mode, getExpIcon }: ExperienceDetailMonitorProps) => (
  <div className="fixed inset-0 z-[100] bg-[#0a0a0a]/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-8 animate-in slide-in-from-bottom duration-300">
    <div className="w-full max-w-6xl h-full max-h-[90vh] bg-[#111] border border-white/10 rounded-lg flex flex-col shadow-2xl overflow-hidden relative">
      <div className="flex items-start justify-between border-b border-white/10 p-4 md:p-6 shrink-0 bg-[#151515] z-20">
        <div>
          <h2 className="text-xl md:text-3xl font-black text-foreground uppercase flex flex-col md:flex-row md:items-center gap-3 tracking-tighter">
            <span className="flex items-center gap-3" style={{ color: accentColor }}>
              {getExpIcon(experience.iconName, 32)} {experience.title}
            </span>
          </h2>
          <div className="flex flex-col md:flex-row gap-2 md:gap-4 mt-1 text-muted-foreground font-mono text-xs uppercase tracking-widest">
            <span>{experience.company}</span>
            <span className="hidden md:inline text-muted-foreground/30">|</span>
            <span style={{ color: accentColor }}>{experience.period}</span>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-muted-foreground hover:text-foreground transition-all">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-hidden relative bg-[#0f0f0f]">
        <NodeGraph experience={experience} activeMode={mode} />
      </div>

      <div className="h-8 bg-[#0a0a0a] border-t border-white/5 flex items-center px-4 justify-between text-[10px] text-muted-foreground/50 font-mono uppercase tracking-widest shrink-0 z-20">
        <span>Source: {experience.id}_SEQUENCE_V1</span>
        <span>Status: LINKED</span>
      </div>
    </div>
  </div>
);
