import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  FileSearch, 
  ExternalLink,
  Plus,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  History
} from "lucide-react";
import { SourceValidation } from "../types";
import { validateSource, SourceSubmission } from "../services/validationService";

const VERDICT_THEMES = {
  approve: { icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  approve_with_conditions: { icon: ShieldAlert, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  reject: { icon: ShieldX, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/30" }
};

export default function SourceValidatorUI() {
  const [submission, setSubmission] = useState<SourceSubmission>({
    name: "",
    url: "",
    description: "",
    claimed_sectors: "",
    claimed_coverage: "",
    claimed_refresh_rate: "",
    contributor_notes: ""
  });
  const [validation, setValidation] = useState<SourceValidation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);

  const handleValidate = async () => {
    setIsLoading(true);
    const result = await validateSource(submission);
    setValidation(result);
    setIsLoading(false);
    if (result) setShowForm(false);
  };

  return (
    <div className="flex flex-col gap-6 h-full min-h-[500px]">
      <AnimatePresence mode="wait">
        {showForm ? (
          <motion.div 
            key="form"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex flex-col gap-6 p-8 border border-zinc-800 bg-zinc-900/10 rounded-3xl"
          >
            <div className="flex items-center justify-between mb-4">
               <div className="flex flex-col">
                  <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-[0.4em] font-black block mb-2">Protocol V-7 // Civic Grounding</span>
                  <h3 className="text-4xl font-display font-black text-white tracking-tight uppercase">Source Entry</h3>
               </div>
               <div className="w-16 h-16 bg-zinc-900 rounded-3xl flex items-center justify-center text-zinc-500 border border-zinc-800">
                 <FileSearch size={32} />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest font-black ml-4">Entity Identity</label>
                <input 
                  placeholder="Premium Times, ThisDay, etc."
                  className="bg-zinc-950 border border-zinc-800 p-4 text-sm rounded-2xl focus:border-white focus:ring-1 focus:ring-white outline-none transition-all placeholder:text-zinc-700"
                  value={submission.name}
                  onChange={e => setSubmission({...submission, name: e.target.value})}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest font-black ml-4">Resource Endpoint</label>
                <input 
                  placeholder="https://..."
                  className="bg-zinc-950 border border-zinc-800 p-4 text-sm rounded-2xl focus:border-white focus:ring-1 focus:ring-white outline-none transition-all placeholder:text-zinc-700"
                  value={submission.url}
                  onChange={e => setSubmission({...submission, url: e.target.value})}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest font-black ml-4">Mission Statement & Payload Description</label>
                <textarea 
                  placeholder="Historical context, ownership, primary funding models..."
                  className="bg-zinc-950 border border-zinc-800 p-6 text-sm rounded-3xl focus:border-white focus:ring-1 focus:ring-white outline-none transition-all h-32 resize-none placeholder:text-zinc-700"
                  value={submission.description}
                  onChange={e => setSubmission({...submission, description: e.target.value})}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="flex flex-col gap-2">
                 <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest font-black ml-4">Sectors</label>
                 <input 
                   placeholder="Health, Security..."
                   className="bg-zinc-950 border border-zinc-800 p-4 text-[11px] rounded-2xl outline-none"
                   value={submission.claimed_sectors}
                   onChange={e => setSubmission({...submission, claimed_sectors: e.target.value})}
                 />
               </div>
               <div className="flex flex-col gap-2">
                 <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest font-black ml-4">Coverage</label>
                 <input 
                   placeholder="Local / National"
                   className="bg-zinc-950 border border-zinc-800 p-4 text-[11px] rounded-2xl outline-none"
                   value={submission.claimed_coverage}
                   onChange={e => setSubmission({...submission, claimed_coverage: e.target.value})}
                 />
               </div>
               <div className="flex flex-col gap-2">
                 <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest font-black ml-4">Refresh</label>
                 <input 
                   placeholder="Real-time / Daily"
                   className="bg-zinc-950 border border-zinc-800 p-4 text-[11px] rounded-2xl outline-none"
                   value={submission.claimed_refresh_rate}
                   onChange={e => setSubmission({...submission, claimed_refresh_rate: e.target.value})}
                 />
               </div>
            </div>

            <button 
              onClick={handleValidate}
              disabled={isLoading || !submission.name || !submission.url}
              className="mt-6 bg-white text-zinc-950 p-5 rounded-3xl font-display font-black uppercase tracking-widest text-base hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-3 shadow-2xl shadow-white/10"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Cognitive Grounding Audit In Progress...
                </>
              ) : (
                <>
                  <FileSearch size={22} />
                  Initiate Strategic Validation
                </>
              )}
            </button>
          </motion.div>
        ) : validation && (
          <motion.div 
            key="results"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col gap-8"
          >
            {/* Verdict Hero */}
            <div className={`p-8 border rounded-4xl shadow-2xl relative overflow-hidden ${VERDICT_THEMES[validation.verdict].border} ${VERDICT_THEMES[validation.verdict].bg}`}>
               <div className="absolute top-0 right-0 p-8 opacity-5">
                  {(() => {
                    const Icon = VERDICT_THEMES[validation.verdict].icon;
                    return <Icon size={128} />;
                  })()}
               </div>
               
               <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mb-8 relative z-10">
                  <div className="flex items-center gap-6">
                     <div className={`p-4 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl ${VERDICT_THEMES[validation.verdict].color}`}>
                        {(() => {
                           const Icon = VERDICT_THEMES[validation.verdict].icon;
                           return <Icon size={48} />;
                        })()}
                     </div>
                     <div>
                        <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-[0.4em] font-black block mb-2">Final Evaluation</span>
                        <h3 className={`text-5xl font-display font-black uppercase tracking-tight leading-none ${VERDICT_THEMES[validation.verdict].color}`}>
                           {validation.verdict.replace(/_/g, ' ')}
                        </h3>
                     </div>
                  </div>
                  <div className="flex flex-col items-end">
                     <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest font-black mb-1">Recommended Tier</span>
                     <span className="text-5xl font-display font-black text-white">#{validation.recommended_tier}</span>
                  </div>
               </div>
               
               <div className="p-6 bg-zinc-950/40 border border-white/5 rounded-3xl shadow-inner mb-8">
                  <p className="text-zinc-200 text-lg font-display font-bold leading-relaxed italic text-center md:text-left">
                     "{validation.verdict_summary}"
                  </p>
               </div>

               <div className="flex flex-wrap items-center justify-between gap-6">
                  <div className="flex flex-col">
                     <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest font-black mb-3">Integrity Coefficient</span>
                     <div className="flex items-center gap-4">
                        <div className="flex gap-1">
                           {[...Array(8)].map((_, i) => (
                             <div key={i} className={`h-1.5 w-6 rounded-full transition-all ${i < validation.total_score / 5 ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'bg-zinc-900 border border-zinc-800'}`} />
                           ))}
                        </div>
                        <span className="text-xl font-display font-black text-white">{validation.total_score} <span className="opacity-30">/ 40</span></span>
                     </div>
                  </div>
                  {validation.bias_downgrade_applied && (
                     <div className="bg-rose-500/10 text-rose-500 text-[11px] font-mono font-black border border-rose-500/20 px-4 py-2 rounded-full flex items-center gap-2 animate-pulse uppercase tracking-widest">
                        <AlertTriangle size={16} /> Bias Correction Applied
                     </div>
                  )}
               </div>
            </div>

            {/* Detailed Criteria */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {Object.entries(validation.criteria_scores).map(([key, data], idx) => {
                  const scoreData = data as { score: number; finding: string };
                  return (
                    <motion.div 
                      key={key} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + (idx * 0.05) }}
                      className="p-6 border border-zinc-800 bg-zinc-950/40 rounded-3xl flex flex-col gap-3 group hover:bg-zinc-900/50 transition-all border-zinc-800/50 hover:border-zinc-500"
                    >
                       <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest font-black truncate max-w-[70%] group-hover:text-zinc-300">
                             {key.replace(/_/g, ' ')}
                          </span>
                          <span className={`text-xl font-display font-black ${scoreData.score >= 4 ? 'text-emerald-400' : scoreData.score >= 3 ? 'text-amber-400' : 'text-rose-400'}`}>
                             {scoreData.score}
                          </span>
                       </div>
                       <p className="text-sm text-zinc-400 font-sans group-hover:text-zinc-200 transition-colors leading-relaxed">
                          {scoreData.finding}
                       </p>
                    </motion.div>
                  );
               })}
            </div>

            {/* Conditions & Flags */}
            {(validation.conditions.length > 0 || validation.disqualifying_flags.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {validation.conditions.length > 0 && (
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest font-bold">Audit Conditions</span>
                    <div className="space-y-2">
                       {validation.conditions.map((c, i) => (
                         <div key={i} className="flex gap-3 text-xs p-3 bg-amber-500/5 border border-amber-500/10 rounded text-zinc-400">
                            <Plus size={14} className="mt-0.5 text-amber-500 flex-shrink-0" />
                            {c}
                         </div>
                       ))}
                    </div>
                  </div>
                )}
                {validation.disqualifying_flags.length > 0 && (
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono text-rose-500 uppercase tracking-widest font-bold">Pipeline Flags</span>
                    <div className="space-y-2">
                       {validation.disqualifying_flags.map((f, i) => (
                         <div key={i} className="flex gap-3 text-xs p-3 bg-rose-500/5 border border-rose-500/10 rounded text-zinc-400">
                            <AlertTriangle size={14} className="mt-0.5 text-rose-500 flex-shrink-0" />
                            {f}
                         </div>
                       ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Grounding Footer */}
            <div className="p-6 border-t border-zinc-800 bg-zinc-950/30">
               <div className="flex items-center gap-2 mb-4">
                  <History size={16} className="text-zinc-600" />
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">Independent Grounding Audit</span>
               </div>
               <div className="space-y-3">
                  {validation.grounding_sources.map((src, i) => (
                    <div key={i} className="flex items-center justify-between p-2 border border-white/5 rounded hover:bg-white/[0.02] transition-all">
                       <div className="flex flex-col">
                          <span className="text-xs text-zinc-300 font-medium">{src.title}</span>
                          <span className="text-[9px] font-mono text-zinc-600 uppercase italic">{src.used_for}</span>
                       </div>
                       <a href={src.url} target="_blank" rel="noopener noreferrer" className="p-1 text-zinc-600 hover:text-white transition-all">
                          <ExternalLink size={14} />
                       </a>
                    </div>
                  ))}
               </div>

               <div className="mt-8 flex justify-center">
                  <button 
                    onClick={() => { setShowForm(true); setValidation(null); }}
                    className="text-[10px] font-mono text-zinc-500 hover:text-white uppercase tracking-[0.3em] border-b border-zinc-800 hover:border-zinc-400 pb-1 flex items-center gap-2"
                  >
                    Return to Submission
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
