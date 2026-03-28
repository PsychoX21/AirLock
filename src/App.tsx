import React, { useReducer, useState, useEffect } from 'react';
import { gameReducer, initialState } from './game/engine';
import { HexBoard } from './components/HexBoard';
import { Sidebar } from './components/Sidebar';
import { sound } from './utils/sound';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Play, AlertTriangle, ShieldAlert, Shield, Wind } from 'lucide-react';

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [playerCount, setPlayerCount] = useState<2 | 3>(2);
  const [p1Name, setP1Name] = useState('Player 1');
  const [p2Name, setP2Name] = useState('Player 2');
  const [p3Name, setP3Name] = useState('Player 3');
  const [enableTier3, setEnableTier3] = useState(false);
  const [showTurnOverlay, setShowTurnOverlay] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(384);

  const [shake, setShake] = useState(false);

  const startSidebarResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = sidebarWidth;
    
    const onMouseMove = (mouseMoveEvent: MouseEvent) => {
      const dx = startX - mouseMoveEvent.clientX;
      setSidebarWidth(Math.min(Math.max(startW + dx, 280), 600));
    };
    
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = 'default';
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.body.style.cursor = 'col-resize';
  };

  useEffect(() => {
    if (state.phase === 'actions' && state.activePlayer !== undefined) {
      setShowTurnOverlay(true);
      const timer = setTimeout(() => setShowTurnOverlay(false), 1500);
      return () => clearTimeout(timer);
    } else {
      setShowTurnOverlay(false);
    }
  }, [state.activePlayer, state.phase]);

  useEffect(() => {
    if (state.pendingEmission) {
      sound.playAlert();
      setShake(true);
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [state.pendingEmission]);

  const handleZoneClick = (laneIndex: number, zoneIndex: number) => {
    if (state.selectedAction === 'PLACE' && state.selectedFilterIndex !== null) {
      if (state.players[state.activePlayer].lanes.includes(laneIndex)) {
        sound.playSuccess();
        dispatch({ type: 'EXECUTE_PLACE', laneIndex, zoneIndex });
      } else {
        sound.playError();
      }
    }
  };

  const handleTokenClick = (laneIndex: number, zoneIndex: number, tokenIndex: number) => {
    if (state.selectedAction === 'PURIFY') {
      if (state.players[state.activePlayer].lanes.includes(laneIndex)) {
        dispatch({ type: 'EXECUTE_PURIFY', laneIndex, zoneIndex, tokenIndex });
      } else {
        sound.playError();
      }
    } else if (state.selectedAction === 'DEFLECT') {
      if (state.players[state.activePlayer].lanes.includes(laneIndex)) {
        sound.playClick();
        dispatch({ type: 'EXECUTE_DEFLECT', laneIndex, zoneIndex, tokenIndex });
      } else {
        sound.playError();
      }
    }
  };

  const startGame = () => {
    sound.init();
    sound.playSuccess();
    const players = [{ name: p1Name }, { name: p2Name }];
    if (playerCount === 3) players.push({ name: p3Name });
    dispatch({ type: 'START_GAME', players, enableTier3 });
  };

  return (
    <div className={clsx(
      "flex flex-col h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans selection:bg-cyan-500/30 relative",
      shake && "animate-shake"
    )}>
      <div className="scanline" />
      <div className="vignette" />
      <div className="grain" />
      
      <AnimatePresence mode="wait">
        {state.phase === 'setup' && (
          <motion.div 
            key="setup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center text-slate-200 z-[100] overflow-hidden"
          >
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/20 blur-[120px] rounded-full" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/20 blur-[120px] rounded-full" />
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-12 relative"
            >
              <h1 className="text-8xl font-black tracking-tighter mb-2 text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 via-cyan-400 to-blue-500 drop-shadow-[0_0_30px_rgba(52,211,153,0.3)]">
                AIRLOCK
              </h1>
              <div className="flex items-center justify-center gap-4">
                <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-emerald-500" />
                <p className="text-xl text-emerald-400/80 tracking-[0.3em] uppercase font-mono font-bold">Skyline Purifiers</p>
                <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-emerald-500" />
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="glass-panel p-6 md:p-10 rounded-3xl border border-white/10 w-[95vw] sm:w-[90vw] max-w-[450px] shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500" />
              
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-emerald-400" />
                </div>
                <h2 className="text-xl font-black text-white tracking-tight uppercase">System Initialization</h2>
              </div>
              
              <div className="space-y-8">
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-3 uppercase tracking-widest">Operator Count</label>
                  <div className="flex gap-3">
                    {[2, 3].map((num) => (
                      <button 
                        key={num}
                        onClick={() => setPlayerCount(num as 2 | 3)}
                        className={clsx(
                          "flex-1 py-3 rounded-xl font-black transition-all border-2",
                          playerCount === num 
                            ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]" 
                            : "bg-slate-800/50 border-transparent text-slate-500 hover:bg-slate-800 hover:text-slate-300"
                        )}
                      >
                        {num} PLAYERS
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-5">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Operator Credentials</label>
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                      <input 
                        type="text" 
                        placeholder="Player 1 Name"
                        value={p1Name} 
                        onChange={e => setP1Name(e.target.value)} 
                        className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-3 pl-8 pr-4 text-white focus:outline-none focus:border-blue-500/50 transition-colors font-bold" 
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                      <input 
                        type="text" 
                        placeholder="Player 2 Name"
                        value={p2Name} 
                        onChange={e => setP2Name(e.target.value)} 
                        className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-3 pl-8 pr-4 text-white focus:outline-none focus:border-red-500/50 transition-colors font-bold" 
                      />
                    </div>
                    {playerCount === 3 && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="relative"
                      >
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                        <input 
                          type="text" 
                          placeholder="Player 3 Name"
                          value={p3Name} 
                          onChange={e => setP3Name(e.target.value)} 
                          className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-3 pl-8 pr-4 text-white focus:outline-none focus:border-emerald-500/50 transition-colors font-bold" 
                        />
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Game Settings</label>
                  <label className="flex items-center gap-3 p-4 rounded-xl bg-slate-900/50 border border-white/5 cursor-pointer hover:bg-slate-800/50 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={enableTier3}
                      onChange={(e) => setEnableTier3(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500/50 bg-slate-950"
                    />
                    <div>
                      <div className="font-bold text-slate-200">Enable Tier 3 (Advanced)</div>
                      <div className="text-xs text-slate-500">Adds 5 extra rounds and extreme pollution events.</div>
                    </div>
                  </label>
                </div>

                <button 
                  onClick={startGame}
                  className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xl rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_10px_30px_rgba(16,185,129,0.3)] flex items-center justify-center gap-3 group"
                >
                  <Play className="w-6 h-6 fill-current" />
                  INITIALIZE SYSTEM
                </button>
              </div>
            </motion.div>
            
            <div className="mt-12 text-slate-600 font-mono text-[10px] uppercase tracking-[0.5em] animate-pulse">
              Awaiting Operator Input...
            </div>
          </motion.div>
        )}

        {state.phase === 'gameover' && (
          <motion.div 
            key="gameover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center text-slate-200 z-[200]"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <div className="flex justify-center mb-6">
                <div className="p-6 bg-emerald-500/20 rounded-full border-2 border-emerald-500 animate-pulse">
                  <Shield className="w-16 h-16 text-emerald-500" />
                </div>
              </div>
              <h1 className="text-7xl font-black text-emerald-500 mb-4 tracking-tighter">SIMULATION COMPLETE</h1>
              <p className="text-xl text-slate-400 mb-12 max-w-md mx-auto">The designated number of rounds has been reached. Calculating final scores...</p>
              
              <div className="flex gap-6 justify-center">
                {[...state.players].sort((a, b) => b.vp - a.vp).map((player, idx) => (
                  <motion.div 
                    key={player.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                    className={clsx(
                      "p-8 glass-panel rounded-3xl border text-center min-w-[200px]",
                      idx === 0 ? "border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)] bg-emerald-500/10" : "border-white/10"
                    )}
                  >
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                      {idx === 0 ? 'Dominant Operator' : `Rank ${idx + 1}`}
                    </p>
                    <h2 className="text-3xl font-black text-white mb-2">{player.name}</h2>
                    <div className="flex items-center justify-center gap-2">
                      <p className={clsx("text-2xl font-mono font-bold", idx === 0 ? "text-emerald-400" : "text-slate-300")}>
                        {player.vp} VP
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <button 
                onClick={() => { sound.playClick(); window.location.reload(); }}
                className="mt-12 px-8 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold transition-colors border border-white/5"
              >
                REBOOT SYSTEM
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTurnOverlay && (
          <motion.div 
            initial={{ opacity: 0, scale: 1.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 pointer-events-none z-[150] flex items-center justify-center"
          >
            <div className="relative">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100vw' }}
                transition={{ duration: 0.3 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 bg-emerald-500/20 backdrop-blur-md border-y border-emerald-500/30"
              />
              <div className="relative px-20 py-10 text-center">
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-xs font-black text-emerald-400 uppercase tracking-[1em] mb-2"
                >
                  Active Operator
                </motion.p>
                <motion.h2 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-6xl font-black text-white tracking-tighter uppercase"
                >
                  {state.players[state.activePlayer]?.name}
                </motion.h2>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Game UI */}
      <div className="flex flex-col h-full">
        {/* HUD: District Integrity */}
        <div className="h-14 bg-slate-900/80 backdrop-blur-md border-b border-white/5 flex items-center px-6 gap-6 overflow-x-auto shrink-0 z-10">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-slate-500" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">District Status</span>
          </div>
          <div className="h-6 w-[1px] bg-white/5" />
          {state.players.map(p => (
            <div key={p.id} className="flex items-center gap-3 bg-slate-950/50 px-4 py-1.5 rounded-xl border border-white/5 shadow-inner">
              <div className={clsx(
                "w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]", 
                p.id === 0 ? "text-blue-500 bg-blue-500" : p.id === 1 ? "text-red-500 bg-red-500" : "text-emerald-500 bg-emerald-500"
              )} />
              <span className="text-xs font-black w-20 truncate text-slate-300">{p.name}</span>
              <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md whitespace-nowrap">
                {p.vp} VP
              </span>
              <div className="flex gap-1.5">
                {p.lanes.map(l => {
                  const count = state.board.lanes[l].district.length;
                  return (
                    <div 
                      key={l} 
                      className={clsx(
                        "text-[9px] px-2 py-0.5 rounded-md font-mono font-bold transition-colors", 
                        count === 0
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : count <= 2
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                          : "bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse"
                      )}
                    >
                      L{l+1}: {count}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-1 flex-col md:flex-row overflow-hidden relative">
          <div className="flex-1 relative bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.03)_0%,transparent_70%)]">
            <HexBoard 
              state={state} 
              onZoneClick={handleZoneClick} 
              onTokenClick={handleTokenClick} 
            />
          </div>

          {/* Draggable handle for desktop */}
          <div 
            className="hidden md:flex w-2 cursor-col-resize hover:bg-cyan-500/20 active:bg-cyan-500/50 transition-colors shrink-0 z-30 border-l border-white/5 items-center justify-center group"
            onMouseDown={startSidebarResize}
          >
            <div className="w-0.5 h-8 bg-slate-600 group-hover:bg-cyan-400 rounded-full" />
          </div>

          <Sidebar state={state} dispatch={dispatch} width={sidebarWidth} />

          {/* Modals */}
          <AnimatePresence>
            {state.activeClimate && !state.climateModalShown && (
              <ClimateModal 
                key="climate-modal"
                climate={state.activeClimate} 
                onResolve={() => dispatch({ type: 'RESOLVE_CLIMATE' })} 
              />
            )}

            {state.pendingEmission && (!state.activeClimate || state.climateModalShown) && (
              <EmissionModal 
                key="emission-modal"
                emission={state.pendingEmission} 
                onResolve={() => dispatch({ type: 'RESOLVE_EMISSION' })} 
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function EmissionModal({ emission, onResolve }: { emission: any, onResolve: () => void, key?: React.Key }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-[100] w-[90vw] max-w-[400px]"
    >
      <div className="bg-slate-900/95 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.15)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-amber-500" />
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500/20 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <h2 className="text-lg font-black text-white uppercase tracking-tight">Pollution Alert</h2>
          </div>
          <div className="text-[9px] font-mono text-amber-500/50 uppercase tracking-widest">Code: {emission.title.split(' ')[0]}</div>
        </div>
        
        <h3 className="text-sm font-bold text-amber-500 mb-3">{emission.title}</h3>

        <div className="w-full aspect-video bg-slate-950 rounded-xl mb-4 overflow-hidden relative border border-white/5 shadow-inner">
          {emission.image ? (
            <motion.img 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={emission.image} 
              alt="Emission" 
              className="w-full h-full object-cover" 
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <AlertTriangle className="w-6 h-6 text-slate-700" />
              <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">No Visual Data</div>
            </div>
          )}
        </div>

        <div className="mb-6">
          <h4 className="text-[9px] font-black text-slate-500 mb-2 uppercase tracking-widest">Particulate Composition</h4>
          <div className="flex flex-wrap gap-1.5">
            {emission.tokens.map((t: string, i: number) => (
              <div key={i} className={clsx(
                "px-2 py-1 rounded-lg text-[10px] font-black border transition-all",
                ['Dust', 'Pollen', 'Spores', 'Ash'].includes(t) ? "bg-amber-500/10 text-amber-400 border-amber-500/30" :
                ['CO', 'SO2', 'NO2', 'CO2'].includes(t) ? "bg-purple-500/10 text-purple-400 border-purple-500/30" :
                ['Smoke', 'Soot', 'Sulphates', 'Nitrates'].includes(t) ? "bg-rose-500/10 text-rose-400 border-rose-500/30" :
                "bg-slate-800 text-slate-300 border-white/5"
              )}>
                {t}
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={() => { sound.playClick(); onResolve(); }} 
          className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black p-3 rounded-xl uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
        >
          <Wind className="w-4 h-4" />
          Acknowledge & Disperse
        </button>
      </div>
    </motion.div>
  );
}

function ClimateModal({ climate, onResolve }: { climate: any, onResolve: () => void, key?: React.Key }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[100] p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 md:p-8 max-w-lg w-[95vw] shadow-[0_0_100px_rgba(6,182,212,0.15)] relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500" />
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Wind className="w-5 h-5 text-cyan-400" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Environmental Shift</h2>
          </div>
          <div className="text-[10px] font-mono text-cyan-500/50 uppercase tracking-widest">Status: Active</div>
        </div>
        
        <h3 className="text-xl font-bold text-cyan-400 mb-4">{climate.title}</h3>

        <div className="w-full aspect-video bg-slate-950 rounded-2xl mb-6 overflow-hidden relative border border-white/5 shadow-inner">
          {climate.image ? (
            <motion.img 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={climate.image} 
              alt="Climate" 
              className="w-full h-full object-cover" 
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <Wind className="w-8 h-8 text-slate-700" />
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">No Visual Data</div>
            </div>
          )}
        </div>

        <div className="mb-8">
          <h4 className="text-[10px] font-black text-slate-500 mb-3 uppercase tracking-widest">Operational Impact</h4>
          <div className="p-4 bg-slate-950/50 rounded-2xl border border-white/5 text-slate-300 font-bold leading-relaxed">
            {climate.effect}
          </div>
        </div>

        <button 
          onClick={() => { sound.playClick(); onResolve(); }} 
          className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
        >
          ADAPT SYSTEM
        </button>
      </motion.div>
    </motion.div>
  );
}
