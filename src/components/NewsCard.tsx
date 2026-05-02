import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Shield, 
  GraduationCap, 
  Activity as HeartPulse, 
  Sprout, 
  Hammer, 
  ShoppingBag, 
  Gavel, 
  Leaf,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  MapPin,
  X,
  Link2Off
} from "lucide-react";
import { NewsItem, Sector } from "../types";

const SECTOR_ICONS: Record<Sector, any> = {
  security: Shield,
  education: GraduationCap,
  healthcare: HeartPulse,
  agriculture: Sprout,
  infrastructure: Hammer,
  cost_of_living: ShoppingBag,
  governance: Gavel,
  environment: Leaf
};

const VERIFICATION_STATUS = {
  verified: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  partial: { icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-500/10" },
  single_source: { icon: HelpCircle, color: "text-rose-500", bg: "bg-rose-500/10" }
};

function SingleNewsCard({ item, idx }: { item: NewsItem; idx: number }) {
  const [tapCount, setTapCount] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const tapTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const primarySector = item.sector_tags[0] || "governance";
  const Icon = SECTOR_ICONS[primarySector as Sector] || Gavel;
  const status = VERIFICATION_STATUS[item.verification_status as keyof typeof VERIFICATION_STATUS] || VERIFICATION_STATUS.single_source;
  const StatusIcon = status.icon;

  const isLinkBlocked = !item.source_url || item.display_restriction === "summary_only_no_link";

  const handleTap = () => {
    if (isLinkBlocked) {
      setShowDetail(true);
      return;
    }

    setTapCount(prev => prev + 1);
    
    if (tapCount === 0) {
      // First tap: start window
      tapTimeout.current = setTimeout(() => {
        setTapCount(0);
        setShowDetail(true); // Single-tap behavior -> detail view
      }, 400); // UI contract: 400ms window
    } else {
      // Second tap within window: navigate
      if (tapTimeout.current) clearTimeout(tapTimeout.current);
      setTapCount(0);
      if (item.source_url) {
        window.open(item.source_url, '_blank', 'noreferrer');
      }
    }
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: idx * 0.05 }}
        whileTap={{ scale: 0.98, transition: { duration: 0.15 } }}
        onClick={handleTap}
        className={`group relative cursor-pointer p-5 md:p-6 border border-zinc-800/50 bg-zinc-900/10 hover:bg-zinc-800/20 transition-all rounded-[32px] overflow-hidden ${
          isLinkBlocked ? "opacity-70 grayscale-[0.5]" : ""
        }`}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-500 group-hover:text-white group-hover:border-zinc-400 transition-all shadow-lg`}>
                <Icon size={20} />
              </div>
              <div className="flex flex-col">
                 <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-black leading-none mb-1">
                   {item.source_name}
                 </span>
                 <div className="flex items-center gap-2">
                    <Clock size={10} className="text-zinc-700" />
                    <span className="text-[9px] font-mono text-zinc-600 uppercase font-bold">
                      {item.published_date}
                    </span>
                 </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isLinkBlocked && (
                <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-500">
                  <Link2Off size={10} />
                  <span className="text-[8px] font-mono uppercase font-black tracking-widest">🔗 unavailable</span>
                </div>
              )}
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${status.bg} border-white/5`}>
                <StatusIcon size={12} className={status.color} />
                <span className={`text-[9px] font-mono uppercase font-black tracking-widest ${status.color}`}>
                  {item.verification_status}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl md:text-2xl font-display font-black text-white leading-tight uppercase tracking-tight group-hover:text-zinc-200 transition-colors">
              {item.headline}
            </h3>
            <p className="mt-3 text-sm text-zinc-500 line-clamp-2 leading-relaxed font-sans font-medium">
              {item.summary}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {item.sector_tags.map((tag, i) => (
              <span key={i} className="text-[9px] font-mono uppercase tracking-widest text-zinc-600 border border-zinc-800 px-2.5 py-1 rounded-full bg-zinc-950/50">
                #{tag}
              </span>
            ))}
          </div>
        </div>
        
        {/* Subtle accessibility hint */}
        <span className="sr-only">
          {isLinkBlocked ? "Source link unavailable — verify independently." : "Double-tap to open source link"}
        </span>
      </motion.div>

      {/* Detail Overlay */}
      <AnimatePresence>
        {showDetail && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[3000] flex items-center justify-center p-4 md:p-12 backdrop-blur-2xl bg-black/80"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#0A0A0B] border border-zinc-800 w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl relative"
            >
              <button 
                onClick={() => setShowDetail(false)}
                className="absolute top-6 right-6 p-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-400 hover:text-white transition-all z-10"
              >
                <X size={20} />
              </button>

              <div className="p-8 md:p-12 max-h-[85vh] overflow-y-auto no-scrollbar">
                <div className="flex items-center gap-5 mb-10">
                  <div className={`p-4 rounded-3xl bg-zinc-950 border border-zinc-800 text-white shadow-inner`}>
                    <Icon size={32} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.4em] font-black block mb-2">Original Context</span>
                    <h4 className="text-4xl font-display font-black text-white uppercase tracking-tighter leading-none">{item.source_name}</h4>
                  </div>
                </div>

                <h3 className="text-3xl font-display font-black text-white mb-6 leading-tight uppercase tracking-tight">
                  {item.headline}
                </h3>

                <p className="text-zinc-400 text-lg leading-relaxed mb-10 font-sans font-medium">
                  {item.summary}
                </p>

                <div className="space-y-10">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.3em] font-black block mb-5">Key Claims & Attribution</span>
                    <div className="grid gap-4">
                      {item.key_claims.map((claim, i) => (
                        <div key={i} className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-3xl group hover:border-zinc-700 transition-colors">
                          <p className="text-white font-medium mb-4 italic leading-relaxed">"{claim.claim}"</p>
                          <div className="flex items-center justify-between pt-4 border-t border-zinc-800/30">
                             <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-black">Attributed to</span>
                             <span className="text-[10px] font-mono text-zinc-300 uppercase font-black tracking-tight">{claim.attributed_to}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-10 border-t border-zinc-800/50">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest font-black mb-3">Geographic Reach</span>
                      <div className="flex flex-wrap gap-2">
                        {item.state_relevance.map((s, i) => (
                          <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-zinc-950 rounded-xl border border-zinc-800">
                             <MapPin size={10} className="text-zinc-600" />
                             <span className="text-[10px] font-mono text-white uppercase font-black">{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button 
                      onClick={() => item.source_url && window.open(item.source_url, '_blank', 'noreferrer')}
                      disabled={isLinkBlocked}
                      className={`px-10 py-5 rounded-2xl font-display font-black uppercase text-sm shadow-2xl transition-all ${
                        isLinkBlocked 
                        ? "bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50 shadow-none" 
                        : "bg-white text-zinc-950 shadow-white/10 active:scale-95 hover:bg-zinc-200"
                      }`}
                    >
                      {isLinkBlocked ? "Link Restricted" : "Access Data URL"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function NewsCard({ news }: { news: NewsItem[] }) {
  if (news.length === 0) {
    return (
      <div className="p-12 text-center text-zinc-600 font-mono text-xs border-t border-zinc-800 animate-pulse tracking-[0.2em] font-black uppercase">
        Awaiting Signal Synthesis... No current verified data detected
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 overflow-y-auto max-h-[80vh] pr-4 custom-scrollbar pb-24">
      <div className="flex items-center gap-4 mb-4 sticky top-0 bg-[#020203] z-10 py-2">
         <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.6em] font-black">Intelligence Extraction Feed</span>
         <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
      </div>
      {news.map((item, idx) => (
        <SingleNewsCard key={idx} item={item} idx={idx} />
      ))}
    </div>
  );
}
