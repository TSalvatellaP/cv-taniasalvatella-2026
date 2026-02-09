import React, { useMemo, useEffect, useState } from 'react';

type Mode = 'editing' | 'effects' | 'color';

interface AudioWaveformProps {
  mode: Mode;
  isPlaying: boolean;
  playheadPos: number;
  barCount?: number;
  className?: string;
}

// Generate deterministic waveform data (pseudo-random based on seed)
const generateWaveData = (count: number, seed: number = 42): number[] => {
  const data: number[] = [];
  let s = seed;
  for (let i = 0; i < count; i++) {
    // Simple pseudo-random
    s = (s * 16807 + 0) % 2147483647;
    const r = s / 2147483647;
    // Musical-looking waveform with varying amplitudes
    const base = Math.abs(Math.sin(i * 0.3) * Math.cos(i * 0.12) * 0.7 + Math.sin(i * 0.8) * 0.3);
    const noise = r * 0.4;
    data.push(Math.max(0.05, Math.min(0.95, base + noise)));
  }
  return data;
};

const getModeConfig = (mode: Mode) => {
  switch (mode) {
    case 'editing': // Premiere Pro — green waveforms
      return {
        bgTrack: '#0a1a14',
        waveColor: '#4ade80',
        waveColorMid: '#22c55e',
        waveColorPeak: '#f59e0b',
        centerLine: 'rgba(74, 222, 128, 0.15)',
        clipBg: '#008f7a',
        clipBorder: '#006d5b',
        labelColor: '#4ade80',
        peakThreshold: 0.75,
        dbColor: 'rgba(74, 222, 128, 0.3)',
      };
    case 'effects': // After Effects — blue/cyan waveforms
      return {
        bgTrack: '#0f0f1e',
        waveColor: '#7dd3fc',
        waveColorMid: '#38bdf8',
        waveColorPeak: '#c084fc',
        centerLine: 'rgba(125, 211, 252, 0.15)',
        clipBg: '#1e3a5f',
        clipBorder: '#2563eb',
        labelColor: '#93c5fd',
        peakThreshold: 0.7,
        dbColor: 'rgba(147, 197, 253, 0.3)',
      };
    case 'color': // DaVinci Resolve — amber/warm waveforms
      return {
        bgTrack: '#1a1408',
        waveColor: '#fbbf24',
        waveColorMid: '#f59e0b',
        waveColorPeak: '#ef4444',
        centerLine: 'rgba(251, 191, 36, 0.15)',
        clipBg: '#3d2e0a',
        clipBorder: '#92400e',
        labelColor: '#fbbf24',
        peakThreshold: 0.72,
        dbColor: 'rgba(251, 191, 36, 0.3)',
      };
  }
};

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  mode,
  isPlaying,
  playheadPos,
  barCount = 120,
  className = '',
}) => {
  const config = getModeConfig(mode);
  const baseDataUpper = useMemo(() => generateWaveData(barCount, 42), [barCount]);
  const baseDataLower = useMemo(() => generateWaveData(barCount, 137), [barCount]);

  // Animated offset for scrolling effect during playback
  const [animOffset, setAnimOffset] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    let raf: number;
    let last = performance.now();
    const step = (now: number) => {
      const dt = now - last;
      last = now;
      setAnimOffset(prev => (prev + dt * 0.03) % barCount);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying, barCount]);

  const getBarColor = (value: number) => {
    if (value > config.peakThreshold) return config.waveColorPeak;
    if (value > 0.45) return config.waveColor;
    return config.waveColorMid;
  };

  // During playback, shift the waveform data for a scrolling effect
  const getShiftedValue = (data: number[], index: number) => {
    if (!isPlaying) return data[index];
    const shifted = Math.floor(index + animOffset) % data.length;
    // Add subtle pulsation during playback
    const pulse = 1 + Math.sin(animOffset * 0.1 + index * 0.2) * 0.08;
    return Math.min(0.95, data[shifted] * pulse);
  };

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ backgroundColor: config.bgTrack }}>
      {/* Center line */}
      <div className="absolute top-1/2 left-0 right-0 h-[1px] z-[1]" style={{ backgroundColor: config.centerLine }} />

      {/* Upper channel */}
      <div className="absolute top-0 left-0 right-0 h-1/2 flex items-end px-[0.5px]">
        {Array.from({ length: barCount }).map((_, i) => {
          const val = getShiftedValue(baseDataUpper, i);
          const isNearPlayhead = Math.abs((i / barCount) * 100 - playheadPos) < 2;
          return (
            <div
              key={`u${i}`}
              className="flex-1 mx-[0.2px] rounded-t-[0.5px] transition-[height] duration-75"
              style={{
                height: `${val * 100}%`,
                backgroundColor: getBarColor(val),
                opacity: isPlaying ? (isNearPlayhead ? 1 : 0.85) : 0.6,
                boxShadow: isNearPlayhead && isPlaying ? `0 0 4px ${config.waveColor}40` : 'none',
              }}
            />
          );
        })}
      </div>

      {/* Lower channel (mirrored) */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 flex items-start px-[0.5px]">
        {Array.from({ length: barCount }).map((_, i) => {
          const val = getShiftedValue(baseDataLower, i);
          const isNearPlayhead = Math.abs((i / barCount) * 100 - playheadPos) < 2;
          return (
            <div
              key={`l${i}`}
              className="flex-1 mx-[0.2px] rounded-b-[0.5px] transition-[height] duration-75"
              style={{
                height: `${val * 95}%`,
                backgroundColor: getBarColor(val),
                opacity: isPlaying ? (isNearPlayhead ? 0.95 : 0.75) : 0.5,
              }}
            />
          );
        })}
      </div>

      {/* dB scale markers */}
      <div className="absolute top-0.5 right-1 text-[5px] font-mono" style={{ color: config.dbColor }}>0dB</div>
      <div className="absolute top-1/2 right-1 text-[4px] font-mono -translate-y-1/2" style={{ color: config.dbColor }}>-∞</div>
      <div className="absolute bottom-0.5 right-1 text-[5px] font-mono" style={{ color: config.dbColor }}>-48dB</div>

      {/* Playback indicator glow near playhead */}
      {isPlaying && (
        <div
          className="absolute top-0 bottom-0 w-8 pointer-events-none z-[2]"
          style={{
            left: `calc(${playheadPos}% - 16px)`,
            background: `linear-gradient(90deg, transparent, ${config.waveColor}15, transparent)`,
          }}
        />
      )}
    </div>
  );
};

// Compact SVG waveform for desktop audio tracks (fills a clip shape)
export const DesktopAudioWaveformSVG: React.FC<{
  mode: Mode;
  isPlaying: boolean;
  clipId: string;
}> = ({ mode, isPlaying, clipId }) => {
  const config = getModeConfig(mode);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => setTick(t => t + 1), 150);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Generate a stable waveform path with slight variation when playing
  const pathData = useMemo(() => {
    const points = 60;
    let seed = clipId.charCodeAt(0) * 100 + (isPlaying ? tick : 0);
    const topPoints: string[] = [];
    const botPoints: string[] = [];

    for (let i = 0; i <= points; i++) {
      const x = (i / points) * 100;
      seed = (seed * 16807 + 0) % 2147483647;
      const r = seed / 2147483647;
      const base = Math.abs(Math.sin(i * 0.35 + (isPlaying ? tick * 0.05 : 0)) * 0.6 + Math.cos(i * 0.15) * 0.3);
      const amp = Math.max(3, (base + r * 0.4) * 42);
      topPoints.push(`${i === 0 ? 'M' : 'L'} ${x} ${50 - amp}`);
      botPoints.unshift(`L ${x} ${50 + amp * 0.9}`);
    }

    return `${topPoints.join(' ')} ${botPoints.join(' ')} Z`;
  }, [clipId, isPlaying, tick]);

  return (
    <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
      <path d={pathData} fill={config.waveColor} opacity={isPlaying ? 0.65 : 0.45} />
      {/* Center line */}
      <line x1="0" y1="50" x2="100" y2="50" stroke={config.waveColor} strokeWidth="0.3" opacity="0.3" />
    </svg>
  );
};
