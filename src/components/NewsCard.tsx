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
  Info,
  MapPin,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Tag
} from "lucide-react";
import { NewsItem } from "../types";

const SECTOR_ICONS = {
  security: Shield,
  health: HeartPulse,
  education: GraduationCap,
  agriculture: Sprout,
  economy: TrendingUp,
  infrastructure: Building2,
  governance: Gavel,
  cost_of_living: TrendingUp
};

const STATUS_ICONS = {
  verified: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  partial: { icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-500/10" },
  unverified: { icon: HelpCircle, color: "text-rose-500", bg: "bg-rose-500/10" }
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
        const primarySector = item.sector_relevance[0] || "economy";
        const Icon = SECTOR_ICONS[primarySector as keyof typeof SECTOR_ICONS] || Info;
        const status = STATUS_ICONS[item.verification_status as keyof typeof STATUS_ICONS] || STATUS_ICONS.unverified;
        const StatusIcon = status.icon;

        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="group relative p-6 border border-zinc-800/50 bg-zinc-900/10 hover:bg-zinc-800/30 transition-all rounded-3xl"
          >
            <div className="flex items-start gap-6">
              <div className="mt-1 p-3 bg-zinc-950 rounded-2xl border border-zinc-800 group-hover:border-zinc-400 group-hover:text-white transition-all shadow-lg">
                <Icon size={24} className="text-zinc-500 group-hover:text-white" />
              </div>
              <div className="flex-1 min-w-0">
                {/* Header Metadata */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-500 font-black">
                      {item.event_type}
                    </span>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-zinc-950 rounded-full border border-zinc-900">
                      <MapPin size={10} className="text-zinc-600" />
                      <span className="text-[9px] font-mono text-zinc-400 uppercase font-bold tracking-tight">
                        {item.location.lga || item.location.state}
                      </span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${status.bg} border-white/5`}>
                    <StatusIcon size={12} className={status.color} />
                    <span className={`text-[9px] font-mono uppercase font-black tracking-widest ${status.color}`}>
                      {item.verification_status}
                    </span>
                  </div>
                </div>

                {/* Primary Content */}
                <h3 className="text-2xl font-display font-black text-white mb-3 leading-tight tracking-tight uppercase">
                  {item.headline}
                </h3>
                <p className="text-sm text-zinc-400 mb-6 leading-relaxed font-sans font-medium">
                  {item.narrative_relevance}
                </p>

                {/* Structured Claims */}
                {item.source_claims.length > 0 && (
                  <div className="mb-6 flex flex-wrap gap-2">
                    {item.source_claims.map((claim, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-zinc-950 rounded-xl border border-zinc-800/50">
                        <Tag size={10} className="text-zinc-600" />
                        <span className="text-[10px] text-zinc-300 font-mono italic">
                          "{claim.claim}"
                        </span>
                        {claim.quantified && (
                          <div className="w-1 h-1 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,1)]" />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer Metadata */}
                <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.2em] font-black mb-1">Observed Source</span>
                    <span className="text-xs text-zinc-300 font-black uppercase tracking-tight">{item.source}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.2em] font-black mb-1">Temporal Signal</span>
                    <span className="text-xs text-zinc-400 font-bold uppercase">
                      {new Date(item.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
