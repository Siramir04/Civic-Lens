import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, Zap, LayoutGrid, Search, AlertCircle, Info, Newspaper, BarChart3 } from "lucide-react";
import NigeriaMap from "./components/NigeriaMap";
import RegionSelector from "./components/RegionSelector";
import NewsCard from "./components/NewsCard";
import AnalysisPanel from "./components/AnalysisPanel";
import SourceValidatorUI from "./components/SourceValidatorUI";
import { StateNormalizer } from "./utils/stateNormalizer";
import { generateStateNews } from "./services/newsService";
import { analyzeStateData } from "./services/analysisService";
import { NewsItem, StateAnalysis } from "./types";

export default function App() {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [comparisonState, setComparisonState] = useState<string | null>(null);
  const [newsDigest, setNewsDigest] = useState<NewsItem[] | null>(null);
  const [analysis, setAnalysis] = useState<StateAnalysis | null>(null);
  const [comparisonAnalysis, setComparisonAnalysis] = useState<StateAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"news" | "analysis" | "validator" | "compare">("news");

  const fetchData = async (stateName: string, isComparison: boolean = false) => {
    if (!isComparison) {
      setActiveTab("news");
    }
    setIsLoading(true);
    setError(null);
    try {
      if (isComparison) {
        const analysisData = await analyzeStateData(stateName);
        setComparisonAnalysis(analysisData);
      } else {
        const [newsData, analysisData] = await Promise.all([
          generateStateNews(stateName),
          analyzeStateData(stateName)
        ]);
        setNewsDigest(newsData);
        setAnalysis(analysisData);
      }
    } catch (err) {
      console.error(err);
      setError("FAILED TO ESTABLISH CONNECTION TO CIVIC DATA NODES");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStateSelect = (stateName: string) => {
    const normalized = StateNormalizer.normalize(stateName) || stateName;
    
    if (activeTab === "compare") {
      if (normalized === selectedState) return;
      setComparisonState(normalized);
      fetchData(normalized, true);
    } else {
      setSelectedState(normalized);
      setComparisonState(null);
      setComparisonAnalysis(null);
      fetchData(normalized);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-zinc-100 font-sans selection:bg-white selection:text-black">
      {/* Navigation / Header - Responsive Padding */}
      <nav className="py-4 md:py-6 px-4 md:px-8 lg:px-12 flex items-center justify-between sticky top-0 bg-[#0A0A0B]/80 backdrop-blur-2xl z-[2000] border-b border-zinc-800/50">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-xl md:rounded-2xl flex items-center justify-center text-zinc-950 shadow-lg shadow-white/5 shrink-0">
            <LayoutGrid size={18} className="md:size-[22px]" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-display font-extrabold tracking-tight leading-none uppercase">
              CivicLens <span className="text-zinc-600 font-normal opacity-50 lowercase tracking-normal">v0.1</span>
            </h1>
            <p className="text-[8px] md:text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold mt-1">
              AI-Augmented Citizenship
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-8">
          <button 
            onClick={() => { setSelectedState(null); setActiveTab("validator"); }}
            className={`hidden sm:block text-[9px] md:text-[10px] font-mono uppercase tracking-[0.2em] px-4 md:px-5 py-2 md:py-2.5 rounded-full transition-all border ${activeTab === 'validator' ? 'bg-white text-zinc-900 border-white font-bold shadow-xl shadow-white/10' : 'text-zinc-500 border-zinc-800 hover:border-zinc-100 hover:text-white'}`}
          >
            Contributor
          </button>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse" />
            <span className="hidden xs:block text-[9px] md:text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-semibold">Live</span>
          </div>
        </div>
      </nav>

      <main className="max-w-[1700px] mx-auto p-4 md:p-8 lg:p-12 flex flex-col lg:grid lg:grid-cols-12 gap-8 md:gap-10">
        {/* Map Section - Responsive Scaling */}
        <div className="lg:col-span-7 flex flex-col gap-6 md:gap-8">
          <div className="p-4 md:p-8 border border-zinc-800/50 bg-zinc-900/10 rounded-[32px] md:rounded-4xl shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 md:mb-10">
              <div className="flex flex-col">
                <span className="text-[9px] md:text-[10px] font-mono text-zinc-500 uppercase tracking-[0.4em] mb-1 md:mb-2 font-black">Spatial Selection</span>
                <h2 className="text-3xl md:text-5xl font-display font-black tracking-tighter text-white uppercase">
                  State Network
                </h2>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-zinc-900 border border-zinc-800 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-mono uppercase tracking-widest text-zinc-400 shadow-lg w-fit">
                <Zap size={12} className="text-amber-400 fill-amber-400/20" />
                Synthesis Active
              </div>
            </div>
            
            <div className="flex flex-col gap-6 md:gap-10">
              <div className="rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-zinc-800/50 bg-zinc-950/20 aspect-square md:aspect-auto">
                <NigeriaMap 
                  onStateSelect={handleStateSelect} 
                  selectedStateId={selectedState} 
                  comparisonStateId={comparisonState}
                />
              </div>
              
              <div className="pt-6 md:pt-10 border-t border-zinc-800/50">
                <div className="flex items-center gap-4 mb-6 md:mb-8">
                  <span className="text-[9px] md:text-[10px] font-mono text-zinc-600 uppercase tracking-[0.5em] font-black">Region Browser</span>
                  <div className="h-px flex-1 bg-zinc-900" />
                </div>
                <RegionSelector 
                  onSelect={handleStateSelect} 
                  selectedId={selectedState} 
                />
              </div>
            </div>
            
            {/* Desktop-only secondary metadata for neatness */}
            <div className="hidden sm:grid grid-cols-3 gap-4 md:gap-8 mt-8 md:mt-12 pt-6 md:pt-10 border-t border-zinc-800/50">
              {[
                { label: "Scanning Depth", val: "Verified 100%" },
                { label: "Grounding Mode", val: "Active Search" },
                { label: "Protocol", val: "Civic-3-Flash" }
              ].map((m, i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-[8px] md:text-[9px] font-mono text-zinc-600 uppercase mb-1 font-black tracking-widest">{m.label}</span>
                  <span className="text-xs md:text-sm font-display font-medium text-zinc-400">{m.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info/Results Panel - Responsive Height Management */}
        <div className="lg:col-span-5 flex flex-col gap-6 md:gap-8 h-full">
          <div className="flex flex-col h-full border border-zinc-800/30 rounded-[32px] md:rounded-4xl overflow-hidden bg-zinc-900/5 backdrop-blur-xl shadow-3xl min-h-[500px] lg:min-h-0">
            <div className="p-5 md:p-8 border-b border-zinc-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/20">
              <div className="flex flex-col">
                <span className="text-[9px] md:text-[10px] font-mono text-zinc-500 uppercase tracking-[0.4em] mb-1 font-black">
                  {activeTab === 'validator' ? 'Verification Layer' : 'Intelligence Stream'}
                </span>
                <h2 className="text-2xl md:text-4xl font-display font-black tracking-tighter text-white flex items-center gap-3 uppercase">
                  {activeTab === 'validator' ? 'Audit' : (selectedState ? selectedState : "Idle")}
                  {isLoading && <Loader2 className="animate-spin text-zinc-500" size={20} />}
                </h2>
              </div>
              
              {(selectedState || activeTab === 'validator') && !isLoading && (
                <div className="flex bg-zinc-950 p-1 rounded-xl md:p-1.5 md:rounded-2xl border border-zinc-800 shadow-inner overflow-x-auto no-scrollbar">
                  {[
                    { id: 'news', icon: Newspaper, label: 'Feed' },
                    { id: 'analysis', icon: BarChart3, label: 'Audit' },
                    { id: 'compare', icon: LayoutGrid, label: 'Diff' }
                  ].map((tab) => (
                    <button 
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-3 py-1.5 md:px-4 md:py-2.5 rounded-lg md:rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-zinc-950 font-bold shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      <tab.icon size={16} className="md:size-[18px]" />
                      <span className="text-[9px] md:text-[11px] font-mono uppercase tracking-tighter font-black">{tab.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 p-4 md:p-8 overflow-hidden relative">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-[#0A0A0B]"
                  >
                    <div className="relative w-16 h-16 md:w-20 md:h-20 mb-8">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full"
                      />
                      <motion.div 
                        animate={{ rotate: -360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-3 border-2 border-t-zinc-700 border-r-transparent border-b-transparent border-l-transparent rounded-full"
                      />
                    </div>
                    <p className="text-[10px] md:text-xs font-display font-black text-white uppercase tracking-[0.4em]">
                      Neural Synthesis
                    </p>
                  </motion.div>
                ) : error ? (
                   <motion.div 
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full text-center p-6 md:p-12"
                  >
                    <AlertCircle size={32} className="text-rose-500 mb-4" />
                    <h3 className="text-xl font-display font-bold text-white mb-2 uppercase">Sync Error</h3>
                    <p className="text-zinc-500 text-xs max-w-[200px] mb-6">{error}</p>
                    <button 
                      onClick={() => selectedState && fetchData(selectedState)}
                      className="px-6 py-2 border border-zinc-800 rounded-full text-[10px] font-mono uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                    >
                      Retry
                    </button>
                  </motion.div>
                ) : activeTab === 'validator' ? (
                  <SourceValidatorUI />
                ) : (selectedState && (activeTab === 'news' ? newsDigest : (activeTab === 'compare' ? (analysis && comparisonAnalysis) || analysis : analysis))) ? (
                  <div className="h-full flex flex-col">
                    {activeTab === 'compare' && !comparisonState && (
                      <div className="px-4 py-3 md:px-8 md:py-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center gap-3 mb-4 animate-pulse">
                        <Info size={14} className="text-blue-400" />
                        <span className="text-[9px] font-mono text-blue-400 uppercase tracking-widest font-black">
                          Choose Comparative Node
                        </span>
                      </div>
                    )}
                    <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
                      {activeTab === 'news' ? (
                        <NewsCard news={newsDigest || []} />
                      ) : (
                        analysis && <AnalysisPanel analysis={analysis} comparisonAnalysis={comparisonAnalysis} />
                      )}
                    </div>
                  </div>
                ) : (
                  <motion.div 
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full text-center p-6 md:p-12"
                  >
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-zinc-900/50 border border-zinc-800/50 rounded-[32px] flex items-center justify-center text-zinc-700 mb-8 transform -rotate-3">
                      <Search size={32} className="md:size-40" />
                    </div>
                    <h3 className="text-lg md:text-xl font-display font-black text-white mb-2 uppercase tracking-tight">Node Offline</h3>
                    <p className="text-[10px] md:text-xs font-mono text-zinc-500 uppercase tracking-widest font-semibold max-w-xs">
                      Select spatial identifier to activate stream
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="p-4 md:p-6 bg-zinc-950/50 border-t border-zinc-800/30">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2 md:gap-3">
                   <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                   <span className="text-[8px] md:text-[9px] font-mono text-zinc-600 uppercase tracking-[0.2em] font-black">
                     Engine Active // V 0.4.2
                   </span>
                 </div>
                 <div className="flex items-center gap-1 opacity-20">
                    <div className="w-1 h-3 bg-zinc-500" />
                    <div className="w-1 h-2 bg-zinc-500" />
                    <div className="w-1 h-4 bg-zinc-500" />
                 </div>
               </div>
            </div>
          </div>
        </div>
      </main>

      {/* Decorative Blur Backgrounds */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden opacity-20 md:opacity-100">
        <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-white/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-zinc-500/5 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}

