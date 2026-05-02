import { motion } from "motion/react";
import { NIGERIA_STATES } from "../constants";
import { ChevronRight } from "lucide-react";

interface RegionSelectorProps {
  onSelect: (stateId: string) => void;
  selectedId: string | null;
}

const REGIONS = ["North West", "North East", "North Central", "South West", "South East", "South South"];

export default function RegionSelector({ onSelect, selectedId }: RegionSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {REGIONS.map((region) => {
        const statesInRegion = NIGERIA_STATES.filter(s => s.region === region);
        
        return (
          <div key={region} className="flex flex-col gap-4">
            <h3 className="text-sm font-display font-black text-zinc-600 uppercase tracking-[0.3em]">
              {region}
            </h3>
            
            <div className="flex flex-wrap gap-2">
              {statesInRegion.map((state) => (
                <button
                  key={state.id}
                  onClick={() => onSelect(state.id)}
                  className={`
                    px-4 py-2 rounded-2xl text-[11px] font-display font-bold uppercase tracking-tight border transition-all flex items-center gap-2 group
                    ${selectedId === state.id 
                      ? "bg-white text-zinc-950 border-white shadow-xl shadow-white/5" 
                      : "bg-zinc-900/40 border-zinc-800/50 text-zinc-500 hover:border-zinc-400 hover:text-white"}
                  `}
                >
                  {state.name}
                  {selectedId === state.id && (
                    <motion.div layoutId="active-dot" className="w-1.5 h-1.5 bg-zinc-950 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
