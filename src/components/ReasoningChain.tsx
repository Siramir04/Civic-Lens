import { motion } from "motion/react";
import { AIEstimate } from "../types";
import { Brain, MapPin, Search, Activity, CornerDownRight, ExternalLink } from "lucide-react";

export default function ReasoningChain({ estimate, onClose }: { estimate: AIEstimate, onClose: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 z-[3000] bg-[#0A0A0B] p-8 overflow-y-auto custom-scrollbar border border-zinc-800/50 rounded-4xl shadow-3xl"
    >
      <div className="flex items-center justify-between mb-10 pb-6 border-b border-zinc-800/50">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
            <Brain size={24} className="text-amber-500" />
          </div>
          <div>
            <h3 className="text-2xl font-display font-black uppercase tracking-tight text-white leading-none">AI Gap-Fill Protocol</h3>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold mt-2">Reasoning Chain • {estimate.sector}</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="text-[10px] font-mono text-zinc-500 hover:text-white uppercase tracking-[0.3em] font-black px-5 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-500 rounded-full transition-all"
        >
          Close Protocol
        </button>
      </div>

      <div className="space-y-10">
        {/* Logic Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <section>
              <div className="flex items-center gap-2 mb-4 ml-4">
                <MapPin size={16} className="text-zinc-600" />
                <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-[0.3em] font-black">Anchoring Signal</span>
              </div>
              <div className="p-6 bg-zinc-900/40 border border-zinc-800/50 rounded-3xl group hover:border-zinc-500 transition-colors">
                <p className="text-base text-zinc-300 leading-relaxed italic border-l-4 border-zinc-800 pl-6 group-hover:border-white transition-colors">
                  "{estimate.reasoning.anchor}"
                </p>
                <div className="mt-6 flex items-center justify-between pt-6 border-t border-zinc-800/50">
                   <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest font-black">Historical Baseline</span>
                   <span className="text-xl font-display font-black text-zinc-400">{estimate.estimated_score - estimate.drift_from_last_known} <span className="text-[10px] uppercase opacity-50">Points</span></span>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4 ml-4">
                <Activity size={16} className="text-zinc-600" />
                <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-[0.3em] font-black">Regional Drift Dynamics</span>
              </div>
              <div className="p-6 bg-zinc-900/40 border border-zinc-800/50 rounded-3xl">
                <p className="text-base text-zinc-300 leading-relaxed font-sans">
                  {estimate.reasoning.regional_signal}
                </p>
              </div>
            </section>
          </div>

          <section>
            <div className="flex items-center gap-2 mb-4 ml-4">
              <Search size={16} className="text-zinc-600" />
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-[0.3em] font-black">Independent Grounding Engine</span>
            </div>
            <div className="p-6 bg-zinc-900/40 border border-zinc-800/50 rounded-3xl min-h-[140px]">
              <p className="text-base text-zinc-300 leading-relaxed font-sans mb-6">
                {estimate.reasoning.grounding_findings}
              </p>
              {estimate.grounding_sources.length > 0 && (
                <div className="pt-6 border-t border-zinc-800/50 space-y-4">
                  {estimate.grounding_sources.map((src, i) => (
                    <div key={i} className="flex flex-col gap-2 p-4 bg-zinc-950 border border-zinc-800 rounded-2xl group hover:border-zinc-500 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-display font-bold text-zinc-100 truncate pr-6 uppercase tracking-tight">{src.title}</span>
                        {src.url && (
                          <a href={src.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white text-zinc-950 rounded-lg hover:scale-110 transition-transform">
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                      <p className="text-[10px] font-mono text-zinc-600 leading-normal italic uppercase tracking-tighter group-hover:text-zinc-400">{src.relevance}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Weighted Factors */}
        <section>
          <div className="flex items-center gap-2 mb-6 ml-4">
             <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-[0.4em] font-black">Strategic Weight Distribution</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {estimate.reasoning.factors_considered.map((f, i) => (
              <div key={i} className="flex flex-col gap-4 p-6 border border-zinc-800/50 bg-zinc-900/20 rounded-3xl group hover:bg-zinc-800/40 transition-all">
                <div className="flex items-center justify-between">
                  <div className={`w-3 h-3 rounded-full ${f.direction === 'up' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : f.direction === 'down' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'bg-zinc-700'}`} />
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-mono text-zinc-600 uppercase font-black tracking-widest">Weight</span>
                    <span className="text-sm font-display font-black text-white">{f.weight}</span>
                  </div>
                </div>
                <span className="text-sm font-bold text-zinc-400 group-hover:text-white transition-colors">{f.factor}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Final Conclusion */}
        <section className="mt-12 pt-10 border-t border-zinc-800/80">
           <div className="flex flex-col md:flex-row gap-8">
             <div className="p-5 bg-amber-500/10 rounded-3xl h-fit border border-amber-500/20 shadow-xl">
                <CornerDownRight size={32} className="text-amber-500" />
             </div>
             <div className="flex-1">
               <span className="text-[11px] font-mono text-amber-500 uppercase tracking-[0.4em] font-black block mb-4 animate-pulse">Neural Synthesis Complete // Conclusion</span>
               <p className="text-2xl font-display font-black text-white leading-tight tracking-tight mb-8">
                 {estimate.reasoning.final_logic}
               </p>
               <div className="flex flex-wrap items-center gap-10 bg-zinc-950 p-8 rounded-[40px] border border-zinc-800 shadow-inner">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-mono text-zinc-600 uppercase tracking-widest font-black mb-2">Synthetic Score</span>
                    <span className="text-6xl font-display font-black text-white">{estimate.estimated_score} <span className="text-xl opacity-30 text-zinc-500">/ 100</span></span>
                  </div>
                  <div className="hidden md:block h-16 w-px bg-zinc-800" />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-mono text-zinc-600 uppercase tracking-widest font-black mb-2">Net Volatility</span>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-4xl font-display font-black ${estimate.drift_from_last_known >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {estimate.drift_from_last_known >= 0 ? '+' : ''}{estimate.drift_from_last_known}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-600 uppercase font-bold tracking-widest">Index Points</span>
                    </div>
                  </div>
               </div>
             </div>
           </div>
        </section>
      </div>

      <div className="mt-16 flex items-center justify-between opacity-30">
         <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.6em] font-black">CivicLens Intelligence Utility // Neural Engine v4.2 // SHA-256 Verified</span>
      </div>
    </motion.div>
  );
}
