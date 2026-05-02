import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  Brain,
  Shield,
  GraduationCap,
  Sprout,
  Hammer,
  ChevronDown,
  Activity,
  Layers
} from "lucide-react";
import { StateAnalysis, AIEstimate, Sector } from "../types";
import ReasoningChain from "./ReasoningChain";

const CORE_SECTORS: Sector[] = ["security", "education", "agriculture", "infrastructure"];

const SECTOR_ICONS: Record<string, any> = {
  security: Shield,
  education: GraduationCap,
  agriculture: Sprout,
  infrastructure: Hammer
};

const SECTOR_COLORS: Record<string, string> = {
  security: "text-blue-400",
  education: "text-violet-400",
  agriculture: "text-emerald-400",
  infrastructure: "text-amber-400"
};

export default function AnalysisPanel({ analysis }: { analysis: StateAnalysis }) {
  const [activeEstimate, setActiveEstimate] = useState<AIEstimate | null>(null);
  const [viewMode, setViewMode] = useState<"quality" | "rank">("quality");

  const getTrendIcon = (trend: string) => {
    if (trend === "improving") return <TrendingDown size={14} className="text-emerald-500 rotate-180" />;
    if (trend === "declining") return <TrendingDown size={14} className="text-rose-500" />;
    return <Minus size={14} className="text-zinc-500" />;
  };

  return (
    <div className="flex flex-col gap-8 overflow-y-auto max-h-[700px] pr-2 custom-scrollbar relative px-1">
      <AnimatePresence>
        {activeEstimate && (
          <ReasoningChain estimate={activeEstimate} onClose={() => setActiveEstimate(null)} />
        )}
      </AnimatePresence>

      {/* Metric Mode Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.4em] font-black mb-1">Display Metric</span>
          <h3 className="text-sm font-display font-black text-white uppercase tracking-tight">Lens Calibration</h3>
        </div>
        <div className="relative group">
          <select 
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as "quality" | "rank")}
            className="appearance-none bg-zinc-950 border border-zinc-800 text-zinc-300 text-[11px] font-mono font-bold uppercase tracking-widest px-6 py-3 rounded-2xl outline-none focus:border-white transition-all cursor-pointer pr-12 shadow-xl"
          >
            <option value="quality">Quality Percentage</option>
            <option value="rank">National Percentile</option>
          </select>
          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none group-hover:text-white transition-colors" />
        </div>
      </div>

      {/* Direct Intensity Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CORE_SECTORS.map((sectorId) => {
          const scoreData = analysis.scores[sectorId];
          const insight = analysis.sector_insights.find(i => i.sector === sectorId);
          const Icon = SECTOR_ICONS[sectorId] || Shield;
          
          if (!scoreData) return null;
          
          const value = viewMode === "quality" ? scoreData.score : scoreData.national_percentile;
          const label = viewMode === "quality" ? "Quality Index" : "Natl. Percentile";
          
          return (
            <motion.div
              key={sectorId}
              whileHover={{ y: -4 }}
              className="p-6 bg-zinc-900/10 border border-zinc-800/50 rounded-[32px] flex flex-col gap-6 relative overflow-hidden group transition-all hover:bg-zinc-800/20 shadow-2xl"
            >
              <div className="flex items-start justify-between relative z-10">
                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-inner group-hover:border-white/20 transition-all">
                  <Icon size={24} className={`${SECTOR_COLORS[sectorId]} group-hover:scale-110 transition-transform`} />
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2">
                    <span className="text-4xl font-display font-black text-white">{value}<span className="text-sm opacity-30">%</span></span>
                    {insight && getTrendIcon(insight.trend)}
                  </div>
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-black leading-none mt-1">{label}</span>
                </div>
              </div>
              
              <div className="relative z-10">
                <h4 className="text-lg font-display font-black text-white uppercase tracking-tight mb-2">{sectorId}</h4>
                <p className="text-[11px] text-zinc-500 font-sans leading-relaxed line-clamp-2 h-8 group-hover:text-zinc-300 transition-colors">
                  {insight?.insight || "Core metrics analyzed across verified civil society reports."}
                </p>
              </div>

              {/* Intensity Pulse Bar */}
              <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden blur-[0.5px]">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  className={`h-full ${SECTOR_COLORS[sectorId].replace('text', 'bg')} opacity-80 shadow-[0_0_8px_currentColor]`}
                />
              </div>

              {scoreData.is_estimated && (
                <div className="absolute top-2 right-2">
                  <motion.div 
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-1.5 h-1.5 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]" 
                  />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Summary Verdict */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 bg-white/5 border border-white/5 rounded-4xl relative overflow-hidden shadow-3xl"
      >
        <div className="absolute -right-4 -top-4 opacity-[0.03] rotate-12">
          <Activity size={160} />
        </div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-zinc-950 shadow-xl shadow-white/10">
             <Layers size={16} />
          </div>
          <span className="text-[11px] font-mono text-white uppercase tracking-[0.4em] font-black">Strategic Conclusion</span>
        </div>
        <p className="text-2xl font-display font-black text-white leading-tight tracking-tight mb-6">
          {analysis.verdict}
        </p>
        <div className="flex items-center gap-6 pt-6 border-t border-white/5">
           <div className="flex flex-col">
              <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest font-black mb-1">Synthesis Rating</span>
              <div className="flex items-center gap-2">
                 <span className="text-xl font-display font-black text-white uppercase">{analysis.confidence_rating}</span>
                 <div className="flex gap-1">
                    {[1,2,3].map(i => (
                      <div key={i} className={`w-3 h-1 rounded-full ${i <= (analysis.confidence_rating === 'high' ? 3 : 2) ? 'bg-white' : 'bg-zinc-800'}`} />
                    ))}
                 </div>
              </div>
           </div>
           <div className="h-8 w-px bg-zinc-800" />
           <div className="flex flex-col">
              <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest font-black mb-1">State Integrity</span>
              <span className="text-xl font-display font-black text-white uppercase">#{analysis.generated_at.slice(-4)}</span>
           </div>
        </div>
      </motion.div>

      {/* Secondary Insights (Collapsed) */}
      <div className="space-y-4">
        <button className="w-full flex items-center justify-between px-4 py-2 border-b border-zinc-900 group">
           <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.5em] font-black group-hover:text-zinc-400 transition-colors">Additional Anomalies</span>
           <ChevronDown size={14} className="text-zinc-500" />
        </button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-zinc-900/5 border border-zinc-800/30 rounded-3xl group">
            <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest font-black flex items-center gap-2 mb-4">
               <AlertTriangle size={14} className="text-rose-500" /> Watch List
            </span>
            <div className="flex flex-wrap gap-2">
              {analysis.watch_list.map(s => (
                <span key={s} className="px-3 py-1 bg-zinc-950 border border-zinc-800 text-[9px] font-mono text-rose-400 rounded-full uppercase font-bold tracking-widest">{s}</span>
              ))}
            </div>
          </div>
          <div className="p-6 bg-zinc-900/5 border border-zinc-800/30 rounded-3xl">
            <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest font-black flex items-center gap-2 mb-4">
               <CheckCircle2 size={14} className="text-emerald-500" /> Bright Spots
            </span>
            <div className="flex flex-wrap gap-2">
              {analysis.bright_spots.map(s => (
                <span key={s} className="px-3 py-1 bg-zinc-950 border border-zinc-800 text-[9px] font-mono text-emerald-400 rounded-full uppercase font-bold tracking-widest">{s}</span>
              ))}
              {analysis.bright_spots.length === 0 && <span className="text-[10px] font-mono text-zinc-800 italic">None logged</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
