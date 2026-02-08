import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize, Layers, Aperture, Activity } from 'lucide-react';
import type { ExperienceItem } from '@/data/translations';

type Mode = 'editing' | 'effects' | 'color';

interface NodeGraphProps {
  experience: ExperienceItem;
  activeMode: Mode;
}

interface NodeState {
  id: number;
  x: number;
  y: number;
  data: { year: string; label: string; desc: string };
}

export const NodeGraph = ({ experience, activeMode }: NodeGraphProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewState, setViewState] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  const [nodes, setNodes] = useState<NodeState[]>(() =>
    experience.fullHistory.map((item, index) => ({
      id: index,
      x: 50 + index * 240,
      y: 100 + (index % 2 === 0 ? 0 : 80),
      data: item
    }))
  );

  const [draggingNodeId, setDraggingNodeId] = useState<number | null>(null);

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (draggingNodeId !== null) return;
    e.preventDefault();
    setIsPanning(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleNodeMouseDown = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setDraggingNodeId(id);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning && draggingNodeId === null) return;
    e.preventDefault();
    const dx = e.clientX - lastMousePos.x;
    const dy = e.clientY - lastMousePos.y;
    setLastMousePos({ x: e.clientX, y: e.clientY });

    if (isPanning) {
      setViewState(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
    } else if (draggingNodeId !== null) {
      const scaledDx = dx / viewState.scale;
      const scaledDy = dy / viewState.scale;
      setNodes(prev => prev.map(n =>
        n.id === draggingNodeId ? { ...n, x: n.x + scaledDx, y: n.y + scaledDy } : n
      ));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  const handleZoom = (delta: number) => {
    setViewState(prev => ({
      ...prev,
      scale: Math.max(0.1, Math.min(3, prev.scale + delta))
    }));
  };

  const fitView = () => {
    if (nodes.length === 0 || !containerRef.current) return;
    const xs = nodes.map(n => n.x);
    const ys = nodes.map(n => n.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs) + 180;
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys) + 150;
    const graphWidth = maxX - minX;
    const graphHeight = maxY - minY;
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    const padding = 100;
    const scaleX = (containerWidth - padding) / graphWidth;
    const scaleY = (containerHeight - padding) / graphHeight;
    const newScale = Math.min(1, Math.min(scaleX, scaleY));
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const newX = (containerWidth / 2) - (centerX * newScale);
    const newY = (containerHeight / 2) - (centerY * newScale);
    setViewState({ x: newX, y: newY, scale: newScale });
  };

  useEffect(() => { fitView(); }, []);

  const styles = {
    color: { nodeBorder: "border-[#444]", nodeHeader: "bg-[#222]", connector: "bg-[#00bfa5]" },
    editing: { nodeBorder: "border-premiere", nodeHeader: "bg-premiere", connector: "bg-white" },
    effects: { nodeBorder: "border-aftereffects", nodeHeader: "bg-[#4B2F57]", connector: "bg-aftereffects" }
  };
  const currentStyle = styles[activeMode];

  const renderConnections = () =>
    nodes.slice(0, -1).map((node, i) => {
      const nextNode = nodes[i + 1];
      const startX = node.x + 180;
      const startY = node.y + 50;
      const endX = nextNode.x;
      const endY = nextNode.y + 50;
      const cp1x = startX + (endX - startX) / 2;
      const path = `M ${startX} ${startY} C ${cp1x} ${startY}, ${cp1x} ${endY}, ${endX} ${endY}`;
      return (
        <path key={`conn-${i}`} d={path}
          stroke={activeMode === 'color' ? "#666" : activeMode === 'effects' ? "#D191FF" : "#555"}
          strokeWidth="2" fill="none" className="opacity-80"
        />
      );
    });

  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative overflow-hidden ${activeMode === 'color' ? 'bg-[#111] node-grid' : activeMode === 'effects' ? 'bg-[#1D1D1D]' : 'bg-[#1A1A1A]'} ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="absolute top-4 right-4 z-30 flex gap-2">
        <button onClick={() => handleZoom(-0.1)} className="p-1.5 bg-black/60 text-white rounded hover:bg-white/20"><ZoomOut size={14} /></button>
        <button onClick={fitView} className="px-3 py-1.5 bg-black/60 text-white text-[10px] font-bold uppercase rounded hover:bg-white/20 flex items-center gap-2"><Maximize size={12} /> Fit</button>
        <button onClick={() => handleZoom(0.1)} className="p-1.5 bg-black/60 text-white rounded hover:bg-white/20"><ZoomIn size={14} /></button>
      </div>

      <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur px-3 py-1 rounded text-[10px] text-muted-foreground font-mono pointer-events-none select-none">
        VIEW: {Math.round(viewState.scale * 100)}% | PAN: {Math.round(viewState.x)},{Math.round(viewState.y)}
      </div>

      <div
        style={{ transform: `translate(${viewState.x}px, ${viewState.y}px) scale(${viewState.scale})`, transformOrigin: '0 0', width: '100%', height: '100%' }}
        className="relative"
      >
        <svg className="absolute top-0 left-0 overflow-visible pointer-events-none z-0" style={{ width: '1px', height: '1px' }}>
          {renderConnections()}
        </svg>

        {nodes.map((node, idx) => (
          <div
            key={node.id}
            className={`absolute w-44 rounded shadow-2xl cursor-grab active:cursor-grabbing group select-none transition-shadow z-10 flex flex-col overflow-hidden border ${currentStyle.nodeBorder} ${activeMode === 'color' ? 'bg-[#1a1a1a]' : activeMode === 'effects' ? 'bg-[#2D2D2D]' : 'bg-[#232323]'} ${draggingNodeId === node.id ? 'scale-105 z-20 shadow-[0_0_20px_rgba(0,0,0,0.5)]' : ''}`}
            style={{ left: node.x, top: node.y }}
            onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
          >
            <div className={`absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${currentStyle.connector} border border-black`}></div>

            <div className={`h-6 flex items-center justify-between px-2 ${currentStyle.nodeHeader} border-b border-black/20`}>
              <span className={`text-[9px] font-black uppercase truncate ${activeMode === 'editing' ? 'text-white' : 'text-secondary-foreground'}`}>NODE {idx + 1}</span>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
              </div>
            </div>

            <div className="p-3 flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <div className="mt-0.5">
                  {activeMode === 'color' ? <Aperture size={12} className="text-muted-foreground" /> : <Layers size={12} className="text-muted-foreground" />}
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-secondary-foreground leading-tight">{node.data.label}</h4>
                  <p className="text-[8px] text-muted-foreground font-mono mt-0.5">{node.data.year}</p>
                </div>
              </div>
              <div className="h-10 w-full bg-black/30 rounded border border-white/5 flex items-center justify-center overflow-hidden relative">
                <Activity size={16} className="text-muted-foreground/30" />
              </div>
              <p className="text-[9px] text-muted-foreground leading-tight line-clamp-2">{node.data.desc}</p>
            </div>

            <div className={`absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${currentStyle.connector} border border-black`}></div>

            {activeMode === 'color' && (
              <div className="h-1.5 flex mt-auto">
                <div className="flex-1 bg-muted-foreground/50 border-r border-black"></div>
                <div className="flex-1 bg-muted-foreground/30 border-r border-black"></div>
                <div className="flex-1 bg-[#00bfa5]"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
