import React, { useState, useEffect, useMemo } from 'react';

type Mode = 'editing' | 'effects' | 'color';

interface VUMeterProps {
  mode: Mode;
  isPlaying: boolean;
  className?: string;
}

const getModeConfig = (mode: Mode) => {
  switch (mode) {
    case 'editing':
      return {
        bg: '#0a0a0a',
        barLow: '#4ade80',
        barMid: '#22c55e',
        barHigh: '#facc15',
        barPeak: '#ef4444',
        labelColor: '#4ade80',
        borderColor: '#1a1a1a',
        headerBg: '#1a1a1a',
        headerText: '#4ade80',
        scaleColor: 'rgba(74, 222, 128, 0.4)',
        channelLabels: ['L', 'R'],
        title: 'Audio Meters',
      };
    case 'effects':
      return {
        bg: '#0c0c18',
        barLow: '#60a5fa',
        barMid: '#3b82f6',
        barHigh: '#a78bfa',
        barPeak: '#f472b6',
        labelColor: '#93c5fd',
        borderColor: '#1a1a2e',
        headerBg: '#12121f',
        headerText: '#93c5fd',
        scaleColor: 'rgba(147, 197, 253, 0.4)',
        channelLabels: ['Ch1', 'Ch2'],
        title: 'Audio Amplitude',
      };
    case 'color':
      return {
        bg: '#0f0d08',
        barLow: '#fbbf24',
        barMid: '#f59e0b',
        barHigh: '#fb923c',
        barPeak: '#ef4444',
        labelColor: '#fbbf24',
        borderColor: '#2a2210',
        headerBg: '#1a1408',
        headerText: '#fbbf24',
        scaleColor: 'rgba(251, 191, 36, 0.4)',
        channelLabels: ['L', 'R'],
        title: 'Fairlight Meters',
      };
  }
};

const SEGMENT_COUNT = 20;
const DB_LABELS = ['+6', '+3', '0', '-3', '-6', '-12', '-20', '-∞'];

export const VUMeter: React.FC<VUMeterProps> = ({ mode, isPlaying, className = '' }) => {
  const config = getModeConfig(mode);
  const [levels, setLevels] = useState<[number, number]>([0, 0]);
  const [peaks, setPeaks] = useState<[number, number]>([0, 0]);
  const [peakHold, setPeakHold] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    if (!isPlaying) {
      // Decay to zero when stopped
      const decay = setInterval(() => {
        setLevels(prev => [
          Math.max(0, prev[0] - 0.03),
          Math.max(0, prev[1] - 0.03),
        ]);
        setPeaks(prev => [
          Math.max(0, prev[0] - 0.01),
          Math.max(0, prev[1] - 0.01),
        ]);
      }, 50);
      return () => clearInterval(decay);
    }

    let raf: number;
    let seed = 42;
    const step = () => {
      seed = (seed * 16807 + 0) % 2147483647;
      const r1 = seed / 2147483647;
      seed = (seed * 16807 + 0) % 2147483647;
      const r2 = seed / 2147483647;

      const baseL = 0.45 + Math.sin(Date.now() * 0.003) * 0.15 + r1 * 0.25;
      const baseR = 0.42 + Math.sin(Date.now() * 0.0035 + 1) * 0.15 + r2 * 0.25;

      setLevels([
        Math.min(1, baseL),
        Math.min(1, baseR),
      ]);

      setPeaks(prev => [
        Math.max(prev[0] * 0.97, baseL),
        Math.max(prev[1] * 0.97, baseR),
      ]);

      setPeakHold(prev => [
        baseL > prev[0] ? baseL : prev[0] * 0.998,
        baseR > prev[1] ? baseR : prev[1] * 0.998,
      ]);

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying]);

  const getSegmentColor = (index: number, level: number) => {
    const segmentPos = index / SEGMENT_COUNT;
    if (segmentPos > level) return 'transparent';
    if (segmentPos > 0.85) return config.barPeak;
    if (segmentPos > 0.7) return config.barHigh;
    if (segmentPos > 0.4) return config.barMid;
    return config.barLow;
  };

  return (
    <div className={`rounded overflow-hidden ${className}`} style={{ backgroundColor: config.bg, border: `1px solid ${config.borderColor}` }}>
      {/* Header */}
      <div className="px-2 py-1 flex items-center justify-between" style={{ backgroundColor: config.headerBg, borderBottom: `1px solid ${config.borderColor}` }}>
        <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: config.headerText }}>{config.title}</span>
        <span className="text-[7px] font-mono" style={{ color: config.scaleColor }}>
          {isPlaying ? `${(-20 + levels[0] * 26).toFixed(1)} dB` : '—'}
        </span>
      </div>

      {/* Meter body */}
      <div className="flex items-end gap-1 px-2 py-2">
        {/* dB scale */}
        <div className="flex flex-col justify-between h-24 mr-1">
          {DB_LABELS.map((label, i) => (
            <span key={i} className="text-[6px] font-mono leading-none text-right w-4" style={{ color: config.scaleColor }}>{label}</span>
          ))}
        </div>

        {/* Channel bars */}
        {[0, 1].map(ch => (
          <div key={ch} className="flex flex-col items-center gap-0.5 flex-1">
            {/* Vertical segments (top = hot, bottom = cold) */}
            <div className="flex flex-col-reverse gap-[1px] w-full h-24">
              {Array.from({ length: SEGMENT_COUNT }).map((_, i) => {
                const isPeakHold = Math.abs(i / SEGMENT_COUNT - peakHold[ch]) < 0.06 && peakHold[ch] > 0.05;
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-[1px] transition-colors duration-75"
                    style={{
                      backgroundColor: isPeakHold ? config.barPeak : getSegmentColor(i, levels[ch]),
                      opacity: isPeakHold ? 1 : (getSegmentColor(i, levels[ch]) === 'transparent' ? 0.08 : 0.9),
                      boxShadow: isPeakHold ? `0 0 4px ${config.barPeak}` : 'none',
                    }}
                  />
                );
              })}
            </div>
            {/* Channel label */}
            <span className="text-[7px] font-bold mt-0.5" style={{ color: config.labelColor }}>{config.channelLabels[ch]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
