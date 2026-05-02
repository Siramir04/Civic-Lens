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
  Layers,
  Trophy,
  Info,
  ChevronRight
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

const QUALITY_INFO = {
  current: { label: "Current", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  stale_12_24mo: { label: "Stale (1y+)", color: "text-amber-500", bg: "bg-amber-500/10" },
  stale_24mo_plus: { label: "Atrophy (2y+)", color: "text-rose-500", bg: "bg-rose-500/10" },
  partial: { label: "Partial", color: "text-zinc-500", bg: "bg-zinc-500/10" },
  unavailable: { label: "Missing", color: "text-zinc-800", bg: "bg-zinc-800/10" }
};

export default function AnalysisPanel({ 
  analysis, 
  comparisonAnalysis 
}: { 
  analysis: StateAnalysis, 
  comparisonAnalysis?: StateAnalysis | null 
}) {
  const [activeEstimate, setActiveEstimate] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<"quality" | "rank">("quality");

  const getTrendIcon = (trend: string) => {
    if (trend === "improving") return <TrendingDown size={14} className="text-emerald-500 rotate-180" />;
    if (trend === "declining") return <TrendingDown size={14} className="text-rose-500" />;
    return <Minus size={14} className="text-zinc-500" />;
  };

  const isComparison = !!comparisonAnalysis;

  return (
    <div className="flex flex-col gap-8 overflow-y-auto max-h-[700px] pr-2 custom-scrollbar relative px-1">
      <AnimatePresence>
        {activeEstimate && (
          <ReasoningChain estimate={activeEstimate} onClose={() => setActiveEstimate(null)} />
        )}
      </AnimatePresence>

      {/* Comparison Header */}
      {isComparison && (
        <div className="flex flex-col gap-4">
          <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-3xl">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-blue-400 uppercase tracking-[0.4em] font-black mb-1">Comparative Logic Enabled</span>
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-display font-black text-white uppercase">{analysis.stateName}</h3>
                  <div className="px-3 py-1 bg-zinc-950 text-zinc-600 font-mono text-[9px] rounded-full">VS</div>
                  <h3 className="text-lg font-display font-black text-blue-400 uppercase">{comparisonAnalysis.stateName}</h3>
                </div>
              </div>
              <Activity className="text-blue-500 animate-pulse" size={24} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 bg-zinc-900/10 border border-zinc-800/50 rounded-3xl">
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-black block mb-2">{analysis.stateName} Index</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-display font-black text-white">{analysis.overall_score}</span>
                <span className="text-[10px] font-mono text-zinc-600 uppercase">Rank #{analysis.national_rank}</span>
              </div>
            </div>
            <div className="p-5 bg-blue-500/5 border border-blue-500/10 rounded-3xl">
              <span className="text-[9px] font-mono text-blue-500/50 uppercase tracking-widest font-black block mb-2">{comparisonAnalysis.stateName} Index</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-display font-black text-blue-400">{comparisonAnalysis.overall_score}</span>
                <span className="text-[10px] font-mono text-blue-500/30 uppercase">Rank #{comparisonAnalysis.national_rank}</span>
              </div>
            </div>
          </div>
        </div>
      )}

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
      <div className={`grid gap-4 ${isComparison ? 'grid-cols-1' : 'grid-cols-1'}`}>
        {CORE_SECTORS.map((sectorId) => {
          const score1 = analysis.scores[sectorId];
          const score2 = comparisonAnalysis?.scores[sectorId];
          const insight1 = analysis.sector_insights.find(i => i.sector === sectorId);
          const insight2 = comparisonAnalysis?.sector_insights.find(i => i.sector === sectorId);
          const Icon = SECTOR_ICONS[sectorId] || Shield;
          
          if (!score1) return null;
          
          const val1 = viewMode === "quality" ? score1.score : score1.national_percentile;
          const val2 = score2 ? (viewMode === "quality" ? score2.score : score2.national_percentile) : null;
          const label = viewMode === "quality" ? "Index" : "Rank";
          
          const isWinner1 = val2 !== null && val1 > val2;
          const isWinner2 = val2 !== null && val2 > val1;
          const diff = val2 !== null ? Math.abs(val1 - val2) : 0;

          const quality1 = QUALITY_INFO[score1.data_quality || "unavailable"];
          
          return (
            <motion.div
              key={sectorId}
              whileHover={{ y: -2 }}
              className={`p-8 bg-zinc-900/10 border border-zinc-800/50 rounded-[40px] flex flex-col gap-8 relative overflow-hidden group transition-all hover:bg-zinc-800/20 shadow-2xl ${isComparison ? 'border-l-4 border-l-blue-500/30' : ''}`}
            >
              {isComparison && (isWinner1 || isWinner2) && (
                <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-3xl flex items-center gap-2 text-[10px] font-mono font-black uppercase tracking-widest ${isWinner1 ? 'bg-emerald-500 text-zinc-950' : 'bg-blue-500 text-zinc-950'}`}>
                  <Trophy size={14} />
                  {isWinner1 ? analysis.stateName : comparisonAnalysis!.stateName} Lead (+{diff}%)
                </div>
              )}

              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-3xl shadow-inner group-hover:border-white/20 transition-all">
                    <Icon size={28} className={`${SECTOR_COLORS[sectorId]} group-hover:scale-110 transition-transform`} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-display font-black text-white uppercase tracking-tight leading-none mb-2">{sectorId}</h4>
                    <div className="flex items-center gap-2">
                       <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${quality1.bg} border border-white/5`}>
                          <Clock size={10} className={quality1.color} />
                          <span className={`text-[9px] font-mono uppercase font-black tracking-widest ${quality1.color}`}>{quality1.label}</span>
                       </div>
                       <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest font-black">/ {label} Comparison</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-12">
                   <div className={`flex flex-col items-end ${isWinner1 ? 'scale-110' : 'opacity-40'}`}>
                      <span className={`text-5xl font-display font-black ${isWinner1 ? 'text-white' : 'text-zinc-600'}`}>{val1}<span className="text-sm opacity-30">%</span></span>
                      <span className={`text-[9px] font-mono uppercase tracking-widest mt-1 ${isWinner1 ? 'text-zinc-500' : 'text-zinc-700'}`}>{analysis.stateName}</span>
                   </div>
                   {isComparison && val2 !== null && (
                     <>
                        <div className="w-px h-12 bg-zinc-800" />
                        <div className={`flex flex-col items-end ${isWinner2 ? 'scale-110' : 'opacity-40'}`}>
                          <span className={`text-5xl font-display font-black ${isWinner2 ? 'text-blue-400' : 'text-zinc-600'}`}>{val2}<span className="text-sm opacity-30">%</span></span>
                          <span className={`text-[9px] font-mono uppercase tracking-widest mt-1 ${isWinner2 ? 'text-blue-500' : 'text-zinc-700'}`}>{comparisonAnalysis!.stateName}</span>
                        </div>
                     </>
                   )}
                </div>
              </div>
              
              {/* Specialized Visuals for Estimates/Gaps */}
              {score1.is_estimated && (
                <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="p-2 bg-amber-500/10 rounded-lg">
                        <Brain size={16} className="text-amber-500" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest font-black">Predictive Synthesis Enabled</span>
                        <span className="text-[11px] text-zinc-400 font-medium">{score1.estimate_data?.methodology}</span>
                      </div>
                   </div>
                   <button 
                    onClick={() => setActiveEstimate(score1.estimate_data)}
                    className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 hover:text-white uppercase font-black transition-colors"
                   >
                     Audit Chain <ChevronRight size={14} />
                   </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                   <div className="flex items-center gap-2">
                     <span className="text-[10px] font-mono text-zinc-600 uppercase font-black tracking-widest">{analysis.stateName} Vector</span>
                     {getTrendIcon(insight1?.trend || "stable")}
                   </div>
                   <p className="text-[13px] text-zinc-400 font-sans leading-relaxed">
                     {insight1?.summary || "Node performance metrics within expected variance."}
                   </p>
                </div>
                {isComparison && (
                  <div className="space-y-4 border-l border-zinc-800 pl-8">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-zinc-600 uppercase font-black tracking-widest">{comparisonAnalysis!.stateName} Vector</span>
                      {getTrendIcon(insight2?.trend || "stable")}
                    </div>
                    <p className="text-[13px] text-zinc-500 font-sans leading-relaxed">
                      {insight2?.summary || "Comparative signals suggest stable regional parity."}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary Verdict */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-10 bg-white/5 border border-white/5 rounded-5xl relative overflow-hidden shadow-3xl"
      >
        <div className="absolute -right-10 -top-10 opacity-[0.03] rotate-12">
          <Activity size={240} />
        </div>
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-zinc-950 shadow-2xl shadow-white/10">
             <Layers size={20} />
          </div>
          <span className="text-[11px] font-mono text-white uppercase tracking-[0.5em] font-black">Strategic Conclusion</span>
        </div>
        <p className="text-3xl font-display font-black text-white leading-tight tracking-tight mb-10">
          {analysis.verdict}
        </p>
        <div className="flex items-center gap-10 pt-8 border-t border-zinc-800/50">
           <div className="flex flex-col">
              <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest font-black mb-2">Synthesis Confidence</span>
              <div className="flex items-center gap-3">
                 <span className="text-2xl font-display font-black text-white uppercase">{analysis.confidence_rating}</span>
                 <div className="flex gap-1.5">
                    {[1,2,3].map(i => (
                      <div key={i} className={`w-4 h-1.5 rounded-full ${i <= (analysis.confidence_rating === 'high' ? 3 : (analysis.confidence_rating === 'medium' ? 2 : 1)) ? 'bg-white shadow-[0_0_8px_white]' : 'bg-zinc-800'}`} />
                    ))}
                 </div>
              </div>
           </div>
           <div className="h-10 w-px bg-zinc-800" />
           <div className="flex flex-col">
              <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest font-black mb-2">System Audit Node</span>
              <span className="text-2xl font-display font-black text-white uppercase">V-{analysis.generated_at.slice(-4)}</span>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
