import React from 'react';
import { GameState, FilterType } from '../types';
import { FILTER_COSTS } from '../game/engine';
import { clsx } from 'clsx';
import { FilterCard } from './Card';
import { 
  Activity, 
  Coins, 
  Trophy, 
  Zap, 
  Wind, 
  RefreshCw, 
  ArrowRightLeft, 
  History,
  ChevronRight,
  Recycle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sound } from '../utils/sound';

interface SidebarProps {
  state: GameState;
  dispatch: (action: any) => void;
  width?: number;
}

export function Sidebar({ state, dispatch, width }: SidebarProps) {
  const activePlayer = state.players[state.activePlayer];

  if (!activePlayer) return null;

  const handleActionClick = (action: string) => {
    sound.playClick();
    if (state.selectedAction === action) {
      dispatch({ type: 'SELECT_ACTION', action: null });
    } else {
      dispatch({ type: 'SELECT_ACTION', action });
    }
  };

  const getCost = (f: FilterType) => FILTER_COSTS[f];

  return (
    <div 
      className="w-full md:w-[var(--sidebar-width)] h-[45vh] md:h-full bg-slate-950 border-t-2 md:border-t-0 md:border-l-2 border-slate-800 flex flex-col overflow-hidden shadow-2xl relative shrink-0 z-20 transition-[width] duration-0"
      style={{ '--sidebar-width': `${width || 384}px` } as React.CSSProperties}
    >
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Game Info */}
        <div className="px-5 pt-5 pb-2 flex justify-between items-center border-b border-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Live</span>
          </div>
          <div className="flex items-center gap-3">
            {state.tier > 1 && (
              <span className={clsx(
                "text-[9px] font-black uppercase px-2 py-0.5 rounded border",
                state.tier === 2 ? "text-amber-400 bg-amber-500/10 border-amber-500/30" :
                  "text-red-400 bg-red-500/10 border-red-500/30"
              )}>
                Tier {state.tier}
              </span>
            )}
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Round <span className="text-white text-sm ml-1">{state.round}</span> / {state.enableTier3 ? 15 : 10}
            </div>
          </div>
        </div>

        {/* Player Stats */}
        <div className="p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={clsx("w-4 h-4 rounded-sm rotate-45 border-2 shadow-lg", 
                activePlayer.id === 0 ? "bg-blue-500 border-blue-300 shadow-blue-500/40" : 
                activePlayer.id === 1 ? "bg-red-500 border-red-300 shadow-red-500/40" : 
                "bg-emerald-500 border-emerald-300 shadow-emerald-500/40"
              )} />
              <span className="text-lg font-black text-white tracking-tight uppercase truncate max-w-[140px]">{activePlayer.name}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold text-sm">
              <Coins size={14} />
              {activePlayer.sc}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-panel p-3 rounded-xl border-emerald-500/20">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-black uppercase tracking-wider mb-1">
                <Trophy size={10} className="text-emerald-500" />
                Victory
              </div>
              <div className="text-2xl font-black text-emerald-400 tracking-tighter text-glow-emerald">{activePlayer.vp} <span className="text-[10px] text-slate-500 ml-1">VP</span></div>
            </div>
            <div className="glass-panel p-3 rounded-xl border-blue-500/20">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-black uppercase tracking-wider mb-1">
                <Zap size={10} className="text-blue-500" />
                Actions
              </div>
              <div className="text-2xl font-black text-blue-400 tracking-tighter text-glow-blue">{state.ap} <span className="text-[10px] text-slate-500 ml-1">/ 2</span></div>
            </div>
          </div>

          {/* All-player VP summary (compact) */}
          {state.players.length > 1 && (
            <div className="glass-panel p-3 rounded-xl">
              <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-2">All Operators</div>
              <div className="space-y-1.5">
                {state.players.map(p => (
                  <div key={p.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={clsx("w-1.5 h-1.5 rounded-full",
                        p.id === 0 ? "bg-blue-500" : p.id === 1 ? "bg-red-500" : "bg-emerald-500"
                      )} />
                      <span className="text-[10px] text-slate-400 font-bold truncate max-w-[80px]">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-mono">{p.sc} SC</span>
                      <span className="text-[10px] text-emerald-400 font-black font-mono">{p.vp} VP</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Player Hand */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Inventory</h3>
              <span className="text-[10px] font-mono text-slate-600">{activePlayer.hand.length} / 5</span>
            </div>
            {activePlayer.hand.length === 0 ? (
              <div className="text-xs text-slate-600 italic p-6 bg-slate-900/30 rounded-xl border-2 border-dashed border-slate-800 text-center">
                No filters available
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {activePlayer.hand.map((f, i) => (
                  <FilterCard 
                    key={i} 
                    filter={f} 
                    cost={getCost(f)} 
                    sellValue={Math.floor(getCost(f)/2)} 
                    compact 
                    selected={state.selectedAction === 'PLACE' && state.selectedFilterIndex === i}
                    onClick={() => { sound.playClick(); dispatch({ type: 'SELECT_ACTION', action: 'PLACE', index: i }); }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Actions Menu */}
          <div className="space-y-3">
            <h3 className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Command Center</h3>
            
            {state.phase === 'emission' && (
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { sound.playClick(); dispatch({ type: 'SPAWN_EMISSION' }); }} 
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 p-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20 border-b-4 border-amber-700 flex items-center justify-center gap-2"
              >
                <Wind size={20} />
                Trigger Emission
              </motion.button>
            )}

            {state.phase === 'actions' && (
              <div className="grid grid-cols-1 gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    disabled={state.ap === 0}
                    onClick={() => { sound.playClick(); dispatch({ type: 'SELECT_ACTION', action: 'DRAFT' }); }} 
                    className="game-button bg-indigo-900/40 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500 hover:text-white flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <RefreshCw size={14} />
                    Draft
                  </button>
                  <button 
                    disabled={state.ap === 0}
                    onClick={() => { sound.playClick(); dispatch({ type: 'SELECT_ACTION', action: 'PURIFY' }); }} 
                    className="game-button bg-emerald-900/40 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500 hover:text-white flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Recycle className="w-4 h-4" />
                    Purify
                  </button>
                </div>
                <button 
                  disabled={state.ap === 0 || activePlayer.deflectedThisTurn}
                  onClick={() => { sound.playClick(); dispatch({ type: 'SELECT_ACTION', action: 'DEFLECT' }); }} 
                  className="game-button bg-rose-900/40 text-rose-400 border-rose-500/30 hover:bg-rose-500 hover:text-white flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ArrowRightLeft size={14} />
                  Deflect
                </button>
                <button 
                  onClick={() => { sound.playClick(); dispatch({ type: 'END_TURN' }); }} 
                  className="game-button bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-white mt-2 flex items-center justify-center gap-2"
                >
                  End Turn
                  <ChevronRight size={14} />
                </button>
              </div>
            )}

            {state.phase === 'upkeep' && (
              <button 
                onClick={() => { sound.playClick(); dispatch({ type: 'UPKEEP' }); }} 
                className="w-full bg-purple-600 hover:bg-purple-500 text-white p-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-purple-500/20 border-b-4 border-purple-800 flex items-center justify-center gap-2"
              >
                <Activity size={20} />
                Run Upkeep
              </button>
            )}
          </div>
        </div>

        {/* Market / Context Panels */}
        <AnimatePresence>
          {state.selectedAction === 'DRAFT' && (
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="p-5 bg-slate-900 border-t-2 border-amber-500/30"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <RefreshCw size={16} className="text-amber-400" />
                  <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest">Marketplace</h3>
                </div>
                <button onClick={() => dispatch({ type: 'SELECT_ACTION', action: null })} className="text-[10px] text-slate-500 hover:text-white uppercase font-bold">Cancel</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {state.activeMarket.map((f, i) => (
                  <FilterCard 
                    key={i} 
                    filter={f} 
                    cost={getCost(f)} 
                    sellValue={Math.floor(getCost(f)/2)}
                    canAfford={activePlayer.sc >= getCost(f)}
                    onClick={() => { sound.playClick(); dispatch({ type: 'SELECT_ACTION', action: 'DRAFT', index: i }); }}
                    selected={state.selectedFilterIndex === i}
                  />
                ))}
              </div>
              {state.selectedFilterIndex !== null && (
                <motion.button 
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  onClick={() => dispatch({ type: 'EXECUTE_DRAFT' })}
                  className="w-full mt-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black p-3 rounded-xl uppercase tracking-widest shadow-lg shadow-amber-500/20"
                >
                  Confirm Purchase
                </motion.button>
              )}
            </motion.div>
          )}

          {state.selectedAction && state.selectedAction !== 'DRAFT' && (
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="p-5 bg-slate-900 border-t-2 border-cyan-500/30"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-cyan-400" />
                  <h3 className="text-xs font-black text-cyan-400 uppercase tracking-widest">{state.selectedAction} Mode</h3>
                </div>
                <button onClick={() => dispatch({ type: 'SELECT_ACTION', action: null })} className="text-[10px] text-slate-500 hover:text-white uppercase font-bold">Cancel</button>
              </div>
              
              <div className="glass-panel p-4 rounded-xl border-cyan-500/20">
                {state.selectedAction === 'PLACE' && (
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">Select a <span className="text-cyan-400 font-bold">Zone</span> on your lanes to deploy a filter.</p>
                )}

                {state.selectedAction === 'PURIFY' && (
                  <div className="flex items-center gap-4 bg-emerald-900/20 p-2 rounded-lg border border-emerald-500/20">
                    <div className="flex-1">
                      <p className="text-xs text-emerald-100 leading-relaxed font-medium">Click a <span className="text-emerald-400 font-bold">trapped pollutant</span> in your Zones to destroy it (+1 VP, +1 SC).</p>
                    </div>
                    {state.purifiesLeft > 0 && (
                      <div className="text-center bg-emerald-950 px-3 py-1 rounded-md border border-emerald-500/30">
                        <div className="text-3xl font-black text-emerald-400 tracking-tighter">{state.purifiesLeft}</div>
                        <div className="text-[10px] text-slate-500 font-black uppercase leading-none">Remaining<br/>Purifies</div>
                      </div>
                    )}
                  </div>
                )}

                {state.selectedAction === 'DEFLECT' && (
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">Click a token in your Zones to redirect it to the opponent lane with the least pollution. (Max 1 per turn)</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer: Status & Logs */}
      <div className="p-5 bg-slate-900/80 border-t border-slate-800 backdrop-blur-md">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <History size={14} className="text-slate-500" />
            <h3 className="text-[10px] text-slate-500 font-black uppercase tracking-widest">System Status</h3>
          </div>
          <button 
            onClick={() => {
              const el = document.getElementById('full-log-modal');
              if (el) el.style.display = 'flex';
            }} 
            className="text-[10px] text-cyan-400 hover:text-cyan-300 font-black uppercase tracking-wider flex items-center gap-1"
          >
            Logs
            <ChevronRight size={10} />
          </button>
        </div>
        
        <div className="space-y-3">
          {/* Active Climate */}
          <div className="glass-panel p-3 rounded-xl border-amber-500/10">
            <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1 opacity-60">Climate Event</div>
            {state.activeClimate ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-black text-amber-500 uppercase">{state.activeClimate.title}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{state.activeClimate.effect}</div>
                </div>
                <div className="text-[10px] font-mono text-amber-500/60 bg-amber-500/5 px-1.5 py-0.5 rounded border border-amber-500/20 ml-2 shrink-0">
                  {state.climateDuration}R
                </div>
              </div>
            ) : (
              <div className="text-[10px] text-slate-600 italic">Nominal conditions</div>
            )}
          </div>

          {/* VP Scoring reminder */}
          <div className="glass-panel p-3 rounded-xl border-emerald-500/10">
            <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1 opacity-60">End-Game District Bonus</div>
            <div className="text-[10px] text-slate-400 space-y-0.5">
              <div className="flex justify-between"><span>0 pollutants</span><span className="text-emerald-400 font-black">+5 VP</span></div>
              <div className="flex justify-between"><span>1–2 pollutants</span><span className="text-amber-400 font-black">+3 VP</span></div>
              <div className="flex justify-between"><span>3+ pollutants</span><span className="text-slate-500 font-black">+0 VP</span></div>
            </div>
          </div>

          {/* Last log entry */}
          {state.logs.length > 0 && (
            <div className="text-[10px] text-slate-400 font-mono bg-slate-950/50 p-2 rounded-lg border-l-2 border-cyan-700 leading-tight">
              {state.logs[0]}
            </div>
          )}
        </div>
      </div>

      {/* Full Log Modal */}
      <div id="full-log-modal" className="hidden fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[100] items-center justify-center p-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-slate-900 border-2 border-slate-700 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
        >
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
            <div className="flex items-center gap-3">
              <History size={20} className="text-cyan-400" />
              <h2 className="font-black text-white uppercase tracking-widest">System Archive</h2>
            </div>
            <button 
              onClick={() => {
                const el = document.getElementById('full-log-modal');
                if (el) el.style.display = 'none';
              }}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="p-6 overflow-y-auto flex-1 space-y-3 custom-scrollbar bg-slate-950/30">
            {state.logs.map((entry, i) => (
              <div key={i} className="text-xs text-slate-300 font-mono bg-slate-900/50 p-3 rounded-xl border-l-4 border-cyan-600 shadow-sm">
                <span className="text-cyan-600 mr-2">[{i.toString().padStart(3, '0')}]</span>
                {entry}
              </div>
            ))}
            {state.logs.length === 0 && (
              <div className="text-slate-500 text-center italic py-12">Archive empty. No logs recorded.</div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
