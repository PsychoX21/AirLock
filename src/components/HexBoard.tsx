import React, { useRef, useEffect, useState } from 'react';
import { GameState, Token, FilterType, getTokenCategory } from '../types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';

interface HexBoardProps {
  state: GameState;
  onZoneClick: (laneIndex: number, zoneIndex: number) => void;
  onTokenClick: (laneIndex: number, zoneIndex: number, tokenIndex: number) => void;
}

const R = 52; // Hex radius
const W = Math.sqrt(3) * R;
const H = 2 * R;
const SPACING = W + 2;

export function HexBoard({ state, onZoneClick, onTokenClick }: HexBoardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const initialScale = useRef(1);
  
  // The board is visually shifted right and down due to its drawing bounds,
  // so we initialize with a slight negative offset to center the core perfectly.
  const initialOffset = { x: -40, y: -40 };
  const [pos, setPos] = useState(initialOffset);
  
  const [isPanning, setIsPanning] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleResize = () => {
      // Initialize scale on mounting
      if (containerRef.current && initialScale.current === 1) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        const targetWidth = 1000;
        const targetHeight = 850;
        const newScale = Math.min(width / targetWidth, height / targetHeight);
        const startScale = Math.max(newScale * 0.8, 0.4);
        setScale(startScale);
        initialScale.current = startScale;
      }
    };
    handleResize();

    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        setScale(s => {
          const newS = e.deltaY < 0 ? s * 1.1 : s * 0.9;
          return Math.min(Math.max(newS, 0.2), 3.0);
        });
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button === 1) { // Middle click
      e.preventDefault();
      setIsPanning(true);
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (isPanning) {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      setPos(p => ({ x: p.x + dx, y: p.y + dy }));
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const onPointerUp = () => setIsPanning(false);

  const centerBoard = () => {
    setPos(initialOffset);
    setScale(initialScale.current);
  };

  const renderHex = (x: number, y: number, label: string, type: string, tokens: Token[], filters: FilterType[], onClick?: () => void, tokenClick?: (i: number) => void, isDistrict = false, ownerName?: string, ownerId?: number) => {
    const isActive = (type === 'z1' || type === 'z2' || type === 'z3') && onClick;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={isActive ? { scale: 1.05, zIndex: 10 } : {}}
        className={twMerge(
          "absolute flex flex-col items-center justify-center cursor-pointer transition-all duration-500 hex-shape group border-2",
          type === 'factory' ? "bg-red-950/60 border-red-500/40 shadow-[inset_0_0_30px_rgba(239,68,68,0.3)] neon-border-rose" :
          type === 'core' ? "bg-slate-900/80 border-slate-700/60 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]" :
          type === 'z1' ? "bg-amber-950/40 border-amber-500/30 shadow-[inset_0_0_25px_rgba(245,158,11,0.2)] hover:border-amber-400" :
          type === 'z2' ? "bg-purple-950/40 border-purple-500/30 shadow-[inset_0_0_25px_rgba(168,85,247,0.2)] hover:border-purple-400" :
          type === 'z3' ? "bg-blue-950/40 border-blue-500/30 shadow-[inset_0_0_25px_rgba(59,130,246,0.2)] hover:border-blue-400" :
          isDistrict && ownerId === 0 ? "bg-blue-950/50 border-blue-500/50 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]" :
          isDistrict && ownerId === 1 ? "bg-red-950/50 border-red-500/50 shadow-[inset_0_0_20px_rgba(239,68,68,0.1)]" :
          isDistrict && ownerId === 2 ? "bg-emerald-950/50 border-emerald-500/50 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]" :
          isDistrict ? "bg-slate-900/90 border-slate-600/60 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]" :
          "bg-slate-800/60 border-slate-700/40"
        )}
        style={{
          width: W,
          height: H,
          left: `calc(50% + ${x}px)`,
          top: `calc(50% + ${y}px)`,
          transform: 'translate(-50%, -50%)'
        }}
        onClick={onClick}
      >
        {/* Inner Glow/Border */}
        <div className="absolute inset-0 hex-shape border border-white/10 pointer-events-none" />
        
        <div className="text-[9px] text-slate-400 absolute top-8 font-black tracking-[0.2em] z-20 uppercase opacity-40 group-hover:opacity-100 transition-opacity drop-shadow-sm pointer-events-none flex flex-col items-center gap-1">
          {filters.length > 0 ? filters.join(' + ') : label}
          {ownerName && (
            <span className={clsx(
              "px-2 py-0.5 rounded text-[8px] border shadow-sm",
              ownerId === 0 ? "bg-blue-500/20 text-blue-300 border-blue-500/40" :
              ownerId === 1 ? "bg-red-500/20 text-red-300 border-red-500/40" :
              "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
            )}>
              {ownerName}
            </span>
          )}
        </div>
        
        {/* Filters */}
        <div className="absolute inset-0 flex overflow-hidden hex-shape opacity-80 group-hover:opacity-100 transition-opacity">
          {filters.map((filter, idx) => (
            <div key={idx} className={clsx(
              "flex-1 relative border-r border-white/10 last:border-0 transition-all duration-500",
              filter === 'MESH'          ? "bg-blue-500/30 shadow-[inset_0_0_15px_rgba(59,130,246,0.2)]"   :
              filter === 'CARBON'        ? "bg-purple-500/30 shadow-[inset_0_0_15px_rgba(168,85,247,0.2)]" :
              filter === 'HEPA'          ? "bg-emerald-500/30 shadow-[inset_0_0_15px_rgba(16,185,129,0.2)]" :
              filter === 'ELECTROSTATIC' ? "bg-amber-500/30 shadow-[inset_0_0_15px_rgba(245,158,11,0.2)]"  :
              filter === 'SCRUBBER'      ? "bg-teal-500/30 shadow-[inset_0_0_15px_rgba(20,184,166,0.2)]"   : ""
            )}>
            </div>
          ))}
        </div>

        {/* Tokens */}
        <div className="flex flex-wrap gap-1 justify-center items-center z-30 p-4 mt-2">
          <AnimatePresence mode="popLayout">
            {tokens.map((token, i) => (
              <motion.div
                key={`${token}-${i}-${tokens.length}`}
                layout
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: 1,
                  opacity: 1,
                  y: [0, -2, 0],
                }}
                transition={{
                  scale: { duration: 0.25, ease: 'backOut' },
                  opacity: { duration: 0.2 },
                  y: { repeat: Infinity, duration: 2.5, ease: 'easeInOut', delay: i * 0.3 },
                }}
                exit={{ scale: 0, opacity: 0, transition: { duration: 0.15 } }}
                whileHover={state.selectedAction === 'PURIFY' ? { 
                  scale: 1.35,
                  boxShadow: '0 0 12px rgba(52,211,153,0.8)',
                } : { scale: 1.25, zIndex: 100 }}
                onClick={(e) => {
                  e.stopPropagation();
                  tokenClick?.(i);
                }}
                className={clsx(
                  "w-6 h-6 rounded flex items-center justify-center text-[8px] font-black shadow-xl cursor-pointer border-2 select-none",
                  getTokenCategory(token) === 'PM10'   ? "bg-amber-500 text-slate-950 border-amber-300 shadow-amber-500/40"   :
                  getTokenCategory(token) === 'GAS'    ? "bg-purple-600 text-white border-purple-300 shadow-purple-600/40"    :
                  getTokenCategory(token) === 'PM2.5'  ? "bg-rose-600 text-white border-rose-300 shadow-rose-600/40"          :
                  getTokenCategory(token) === 'OZONE'  ? "bg-cyan-400 text-slate-950 border-cyan-200 shadow-cyan-400/40"      :
                  "bg-slate-500 text-white border-slate-300"
                )}
              >
                {getTokenCategory(token) === 'OZONE' ? 'O₃' : token.substring(0, 3).toUpperCase()}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };

  const lanes = state.board.lanes;

  return (
    <div 
      ref={containerRef} 
      className={clsx(
        "relative w-full h-full min-h-[300px] flex items-center justify-center overflow-hidden bg-slate-950 rounded-2xl border-2 border-slate-800 shadow-[0_0_100px_rgba(0,0,0,0.9)]",
        isPanning ? "cursor-grabbing" : "cursor-grab"
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {/* Scanline Effect */}
      <div className="scanline pointer-events-none" />
      
      {/* Reset View Button */}
      <button 
        onClick={centerBoard}
        className="absolute bottom-4 left-4 z-50 bg-slate-800/80 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg border border-slate-600 shadow-xl backdrop-blur-sm font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2"
        title="Reset zoom and center"
      >
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        Recenter
      </button>

      <div 
        className="relative transition-transform duration-75 ease-linear pointer-events-auto"
        style={{ 
          width: 1000, 
          height: 850,
          transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
          transformOrigin: 'center center'
        }}
      >
        {/* Background Grid/Scanlines & Wind Particles */}
        <div className="absolute inset-0 pointer-events-none opacity-20" 
             style={{ backgroundImage: 'radial-gradient(#334155 1.5px, transparent 1.5px)', backgroundSize: '50px 50px' }} />
        
        {/* Animated Wind Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * 1000, 
                y: Math.random() * 850, 
                opacity: 0 
              }}
              animate={{ 
                x: [null, Math.random() * 1000],
                y: [null, Math.random() * 850],
                opacity: [0, 0.4, 0]
              }}
              transition={{ 
                duration: 15 + Math.random() * 20, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full blur-[1px]"
            />
          ))}
        </div>
        
        {/* Windrose Spinner */}
        <motion.div 
          animate={{ rotate: state.windrose * 60 }}
          transition={{ type: 'spring', stiffness: 40, damping: 15 }}
          className="absolute top-8 left-8 glass-panel rounded-full flex items-center justify-center w-32 h-32 z-50 neon-border-cyan"
        >
          <div className="absolute top-4 text-[9px] text-cyan-400 font-black uppercase tracking-[0.2em] drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">Wind Flow</div>
          <div className="w-20 h-20 relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 shadow-[inset_0_0_15px_rgba(34,211,238,0.1)]" />
            <div className="absolute right-0 flex items-center justify-center translate-x-2">
              <div className="w-0 h-0 border-t-[10px] border-b-[10px] border-l-[20px] border-t-transparent border-b-transparent border-l-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.9)]" />
            </div>
            <div className="absolute left-3 right-5 h-2 bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.6)]" />
            
            {/* Compass Marks */}
            {[0, 60, 120, 180, 240, 300].map(deg => (
              <div key={deg} className="absolute w-full h-full" style={{ transform: `rotate(${deg}deg)` }}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-slate-700" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Phase Indicator */}
        <div className="absolute top-8 left-1/2 -translate-x-1/3 glass-panel px-8 py-3 rounded-full flex items-center justify-center gap-4 neon-border-blue z-50 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
          <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Current Phase</div>
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <div className="text-lg font-black text-blue-400 uppercase tracking-widest text-glow-blue">{state.phase}</div>
        </div>

        {/* Center Factory */}
        {renderHex(0, 0, "FACTORY", "factory", state.board.factory, [], undefined, undefined, false)}

        {/* Lanes */}
        {lanes.map((lane, i) => {
          const angle = (i * Math.PI) / 3; 
          const getPos = (step: number) => ({
            x: Math.cos(angle) * (step * SPACING),
            y: Math.sin(angle) * (step * SPACING)
          });

          const corePos = getPos(1);
          const z1Pos = getPos(2);
          const z2Pos = getPos(3);
          const z3Pos = getPos(4);
          const distPos = getPos(5);

          const owner = state.players.find(p => p.lanes.includes(i));
          const isP1 = owner?.id === 0;
          const isP2 = owner?.id === 1;

          return (
            <React.Fragment key={i}>
              {renderHex(corePos.x, corePos.y, `CORE ${i+1}`, "core", lane.core, [], undefined, (tIdx) => onTokenClick(i, 0, tIdx))}
              {renderHex(z1Pos.x, z1Pos.y, "ZONE 1", "z1", lane.zones[0].tokens, lane.zones[0].filters, () => onZoneClick(i, 1), (tIdx) => onTokenClick(i, 1, tIdx))}
              {renderHex(z2Pos.x, z2Pos.y, "ZONE 2", "z2", lane.zones[1].tokens, lane.zones[1].filters, () => onZoneClick(i, 2), (tIdx) => onTokenClick(i, 2, tIdx))}
              {renderHex(z3Pos.x, z3Pos.y, "ZONE 3", "z3", lane.zones[2].tokens, lane.zones[2].filters, () => onZoneClick(i, 3), (tIdx) => onTokenClick(i, 3, tIdx))}
              {renderHex(distPos.x, distPos.y, `DISTRICT ${i+1}`, "district", lane.district, [], undefined, undefined, true, owner?.name, owner?.id)}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
