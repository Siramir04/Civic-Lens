import { motion } from "motion/react";
import { 
  Shield, 
  HeartPulse, 
  GraduationCap, 
  Sprout, 
  TrendingUp, 
  Building2, 
  Gavel,
  ExternalLink,
  Info
} from "lucide-react";
import { NewsItem } from "../types";

const SECTOR_ICONS = {
  security: Shield,
  health: HeartPulse,
  education: GraduationCap,
  agriculture: Sprout,
  economy: TrendingUp,
  infrastructure: Building2,
  governance: Gavel
};

const CONFIDENCE_COLORS = {
  high: "bg-emerald-500",
  medium: "bg-amber-500",
  low: "bg-rose-500"
};

export default function NewsCard({ news }: { news: NewsItem[] }) {
  if (news.length === 0) {
    return (
      <div className="p-8 text-center text-zinc-500 font-mono text-sm border-t border-zinc-800">
        NO RECENT VERIFIED DATA AVAILABLE FOR THIS REGION
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 overflow-y-auto max-h-[700px] pr-2 custom-scrollbar p-1">
      {news.map((item, idx) => {
        const Icon = SECTOR_ICONS[item.sector] || Info;
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1, type: "spring", damping: 20 }}
            className="group relative p-6 border border-zinc-800/50 bg-zinc-900/10 hover:bg-zinc-800/30 transition-all rounded-3xl"
          >
            <div className="flex items-start gap-6">
              <div className="mt-1 p-3 bg-zinc-950 rounded-2xl border border-zinc-800 group-hover:border-zinc-400 group-hover:text-white transition-all shadow-lg">
                <Icon size={24} className="text-zinc-500 group-hover:text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-zinc-500 font-bold">
                    {item.sector}
                  </span>
                  <div className="flex items-center gap-2 ml-auto bg-zinc-950 px-3 py-1 rounded-full border border-zinc-800 shadow-inner">
                    <span className="text-[9px] font-mono text-zinc-600 uppercase font-black uppercase tracking-widest">Trust</span>
                    <div className={`w-2 h-2 rounded-full ${CONFIDENCE_COLORS[item.confidence]} shadow-[0_0_8px_${CONFIDENCE_COLORS[item.confidence]}aa]`} />
                  </div>
                </div>
                <h3 className="text-2xl font-display font-bold text-white mb-3 leading-tight tracking-tight">
                  {item.headline}
                </h3>
                <p className="text-sm text-zinc-400 mb-6 leading-relaxed font-sans">
                  {item.summary}
                </p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-800/50">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest font-black mb-1">Source Agent</span>
                    <span className="text-xs text-zinc-300 font-bold uppercase tracking-tight">{item.source_name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {item.published_at && (
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest font-black mb-1">Observed</span>
                        <span className="text-xs text-zinc-400 font-bold">
                          {new Date(item.published_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }).toUpperCase()}
                        </span>
                      </div>
                    )}
                    {item.source_url && (
                      <a 
                        href={item.source_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2.5 bg-white text-zinc-950 rounded-xl hover:scale-110 transition-transform shadow-xl"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
                {item.ai_generated && (
                  <div className="mt-4 flex items-center gap-2 bg-blue-500/5 border border-blue-500/20 px-3 py-1.5 rounded-full w-fit">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    <span className="text-[9px] font-mono text-blue-400 uppercase tracking-widest font-black">Neural Synthesis Verified</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
