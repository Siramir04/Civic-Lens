import { motion } from "motion/react";
import { Brain, MapPin, Search, Activity, CornerDownRight, AlertTriangle, ShieldCheck, HelpCircle } from "lucide-react";

export default function ReasoningChain({ estimate, onClose }: { estimate: any, onClose: () => void }) {
  const trace = estimate.reasoning_trace;

  if (!trace) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 z-[3000] bg-[#0A0A0B] p-8 flex items-center justify-center border border-zinc-800/50 rounded-4xl"
      >
        <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest animate-pulse">Initializing Reasoning Trace Cache...</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 z-[3000] bg-[#0A0A0B] p-8 overflow-y-auto custom-scrollbar border border-zinc-800/50 rounded-4xl shadow-3xl"
    >
      <div className="flex items-center justify-between mb-10 pb-6 border-b border-zinc-800/50">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
            <Brain size={24} className="text-blue-500" />
          </div>
          <div>
            <h3 className="text-2xl font-display font-black uppercase tracking-tight text-white leading-none">Logic Exposure Matrix</h3>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold mt-2">Reasoning Trace • System Audit Verified</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="text-[10px] font-mono text-zinc-500 hover:text-white uppercase tracking-[0.3em] font-black px-5 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-500 rounded-full transition-all"
        >
          Close Matrix
        </button>
      </div>

      <div className="space-y-12">
        {/* Tier 0-1: Data Points */}
        <section>
          <div className="flex items-center gap-2 mb-6 ml-4">
            <MapPin size={16} className="text-zinc-600" />
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-[0.3em] font-black">Verified Grounding Data</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trace.data_points.map((dp: string, i: number) => (
              <div key={i} className="p-4 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl flex items-start gap-3">
                <ShieldCheck size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">{dp}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Neural Inferences */}
        <section>
          <div className="flex items-center gap-2 mb-6 ml-4">
            <Activity size={16} className="text-zinc-600" />
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-[0.3em] font-black">Neural Inferences & Trend Projections</span>
          </div>
          <div className="space-y-4">
            {trace.inferences.map((inf: string, i: number) => (
              <div key={i} className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-[32px] group hover:bg-blue-500/10 transition-all">
                <div className="flex items-start gap-4">
                  <CornerDownRight size={18} className="text-blue-500 mt-1 shrink-0" />
                  <p className="text-base text-zinc-300 font-medium leading-relaxed uppercase tracking-tight">{inf}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Hazards & Counter-Evidence */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section>
            <div className="flex items-center gap-2 mb-6 ml-4">
              <AlertTriangle size={16} className="text-rose-500" />
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-[0.3em] font-black">Uncertainty Vectors</span>
            </div>
            <div className="space-y-3">
              {trace.uncertainties.map((u: string, i: number) => (
                <div key={i} className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)] shrink-0" />
                  <p className="text-xs text-rose-300/70 font-mono italic uppercase tracking-tighter">{u}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-6 ml-4">
              <HelpCircle size={16} className="text-amber-500" />
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-[0.3em] font-black">Counter-Evidence Thresholds</span>
            </div>
            <div className="space-y-3">
              {trace.counter_evidence.map((ce: string, i: number) => (
                <div key={i} className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] shrink-0" />
                  <p className="text-xs text-amber-300/70 font-mono italic uppercase tracking-tighter">{ce}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Logic Closing */}
        <div className="pt-12 border-t border-zinc-800/50 opacity-40">
           <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.6em] font-black">CivicLens Neural Trace Cache // Tier 4 Reasoning Exposer // End of Chain</span>
        </div>
      </div>
    </motion.div>
  );
}
