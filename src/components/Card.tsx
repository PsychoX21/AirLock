import React, { useEffect, useState } from 'react';
import { FilterType } from '../types';
import { Shield, Wind, Zap, Fan, Droplets } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface CardProps {
  key?: React.Key;
  filter: FilterType;
  cost: number;
  sellValue: number;
  canAfford?: boolean;
  onClick?: () => void;
  selected?: boolean;
  compact?: boolean;
}

/**
 * FILTER CARD EDUCATIONAL DESCRIPTIONS
 * -------------------------------------
 * All descriptions are accurate for a high-school air quality learning context.
 * Sources: EPA Air Quality Index, WHO Air Quality Guidelines.
 *
 * MESH (Mechanical Particulate Filter)
 *   Physical size-exclusion: fibres form a barrier that traps particles larger than
 *   the mesh openings (>10 µm). Used in HVAC pre-filters and basic respirators.
 *   Catches: PM10 (Dust, Pollen, Spores, Ash)
 *
 * CARBON (Activated Carbon / Activated Charcoal Filter)
 *   Adsorption: high-surface-area carbon binds gaseous molecules (CO, SO₂, NO₂, CO₂)
 *   to its porous structure via Van der Waals forces. Moisture clogs pores, reducing
 *   capacity in humid conditions.
 *   Catches: GAS pollutants. Half-strength in High Humidity.
 *
 * HEPA (High-Efficiency Particulate Air Filter)
 *   Dense, randomly-arranged fibres capture particles ≥0.3 µm via diffusion, interception
 *   and impaction. True HEPA must remove ≥99.97% of particles (US DOE standard).
 *   Catches: PM2.5 (Smoke, Soot, Sulphates, Nitrates) AND PM10.
 *
 * ELECTROSTATIC (Electrostatic Precipitator, ESP)
 *   Ionises incoming air with a high-voltage corona discharge. Charged particles are
 *   attracted to and collected on grounded plates. Used in industrial smokestacks.
 *   Catches: PM10 AND PM2.5. Broad-spectrum particulate removal.
 *
 * SCRUBBER (Wet Scrubber)
 *   Sprays water or alkaline solution into the gas stream. SO₂ and NO₂ dissolve and
 *   react chemically (acid-base neutralisation). Large PM10 particles are washed out.
 *   Catches: GAS pollutants (SO₂, NO₂, CO neutralised) AND PM10.
 *
 * FAN (Exhaust Fan / Ventilation Fan)
 *   Moves air mechanically. Does not filter pollutants itself; redirects airflow to
 *   adjacent districts. Increases air circulation, boosting scrub efficiency.
 *   Effect: +1 to Scrub Die roll. Enables Deflect action.
 */
const FILTER_INFO: Record<FilterType, { icon: any; desc: string; catchLabel: string; image: string }> = {
  MESH: {
    icon: Shield,
    desc: 'Mechanical mesh traps large particles by physical size exclusion.',
    catchLabel: 'PM10 only',
    image: '/assets/filters/mesh.jpg',
  },
  CARBON: {
    icon: Droplets,
    desc: 'Activated carbon adsorbs toxic gases. Disabled in High Humidity — moisture fills all pores.',
    catchLabel: 'GAS only',
    image: '/assets/filters/carbon.jpg',
  },
  HEPA: {
    icon: Wind,
    desc: 'Dense fibre mat captures fine and coarse particles ≥0.3 µm. 99.97% efficient.',
    catchLabel: 'PM2.5 + PM10',
    image: '/assets/filters/hepa.jpg',
  },
  ELECTROSTATIC: {
    icon: Zap,
    desc: 'High-voltage corona ionises particles; collector plates attract all charged PM.',
    catchLabel: 'PM10 + PM2.5',
    image: '/assets/filters/electrostatic.jpg',
  },
  SCRUBBER: {
    icon: Droplets,
    desc: 'Alkaline spray neutralises SO₂ and NO₂ via acid-base reaction; washes out PM10.',
    catchLabel: 'GAS + PM10',
    image: '/assets/filters/scrubber.jpg',
  },
};

const FILTER_COLORS: Record<FilterType, {
  bar: string; icon: string; iconBorder: string;
}> = {
  MESH:         { bar: 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]',     icon: 'text-blue-400',    iconBorder: 'bg-blue-500/10 border-blue-500/30' },
  CARBON:       { bar: 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]',   icon: 'text-purple-400',  iconBorder: 'bg-purple-500/10 border-purple-500/30' },
  HEPA:         { bar: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]',  icon: 'text-emerald-400', iconBorder: 'bg-emerald-500/10 border-emerald-500/30' },
  ELECTROSTATIC:{ bar: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]',   icon: 'text-amber-400',   iconBorder: 'bg-amber-500/10 border-amber-500/30' },
  SCRUBBER:     { bar: 'bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.8)]',     icon: 'text-teal-400',    iconBorder: 'bg-teal-500/10 border-teal-500/30' },
};

export function FilterCard({ filter, cost, sellValue, canAfford = true, onClick, selected, compact }: CardProps) {
  const info = FILTER_INFO[filter];
  const colors = FILTER_COLORS[filter];
  const Icon = info.icon;
  return (
    <motion.div 
      whileHover={canAfford ? { scale: 1.05, y: -5 } : {}}
      whileTap={canAfford ? { scale: 0.95 } : {}}
      onClick={canAfford ? onClick : undefined}
      className={clsx(
        "relative rounded-xl border-2 overflow-hidden transition-all duration-300 group",
        canAfford ? "cursor-pointer" : "opacity-40 cursor-not-allowed grayscale",
        selected ? "border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.4)] z-10" : "border-slate-800 hover:border-slate-600",
        compact ? "h-28" : "h-48"
      )}
    >
      {/* Background Image */}
      <img src={info.image} alt={filter} className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:opacity-45 transition-opacity duration-500" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
      
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/90 to-slate-900/20" />

      {/* Top colour bar — identifies filter tier/type */}
      <div className={clsx("absolute top-0 left-0 w-full h-1", colors.bar)} />

      <div className="relative h-full flex flex-col p-3">
        <div className="flex justify-between items-start">
          <div className={clsx("p-1.5 rounded-lg border shadow-inner", colors.iconBorder)}>
            <Icon size={compact ? 16 : 20} className={colors.icon} />
          </div>
          
          <div className="flex flex-col items-end gap-1">
            <span className="bg-slate-950/80 text-amber-400 text-[10px] font-black px-2 py-0.5 rounded border border-amber-500/30 shadow-sm">
              {cost} SC
            </span>
            {selected && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,1)]"
              />
            )}
          </div>
        </div>

        <div className="mt-auto">
          <h4 className={clsx("font-black tracking-tight text-white uppercase", compact ? "text-[10px]" : "text-sm")}>
            {filter}
          </h4>
          {!compact && (
            <div className="mt-1.5 space-y-1">
              <p className="text-[10px] text-slate-400 leading-tight font-medium">{info.desc}</p>
              <div className="flex justify-between items-center pt-2 border-t border-white/5">
                <span className={clsx("text-[9px] font-black uppercase tracking-wider", colors.icon)}>
                  {info.catchLabel}
                </span>
                <span className="text-[9px] text-slate-500 font-mono">Resale: {sellValue} SC</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
