import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, Zap, LayoutGrid, Search, AlertCircle, Info, Newspaper, BarChart3 } from "lucide-react";
import NigeriaMap from "./components/NigeriaMap";
import RegionSelector from "./components/RegionSelector";
import NewsCard from "./components/NewsCard";
import AnalysisPanel from "./components/AnalysisPanel";
import SourceValidatorUI from "./components/SourceValidatorUI";
import { generateStateNews } from "./services/newsService";
import { analyzeStateData } from "./services/analysisService";
import { NewsItem, StateAnalysis } from "./types";

export default function App() {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [newsDigest, setNewsDigest] = useState<NewsItem[] | null>(null);
  const [analysis, setAnalysis] = useState<StateAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"news" | "analysis" | "validator">("news");

  const fetchData = async (stateName: string) => {
    setActiveTab("news");
    setIsLoading(true);
    setError(null);
    try {
      const [newsData, analysisData] = await Promise.all([
        generateStateNews(stateName),
        analyzeStateData(stateName)
      ]);
      setNewsDigest(newsData);
      setAnalysis(analysisData);
    } catch (err) {
      console.error(err);
      setError("FAILED TO ESTABLISH CONNECTION TO CIVIC DATA NODES");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStateSelect = (stateName: string) => {
    setSelectedState(stateName);
    fetchData(stateName);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-zinc-100 font-sans selection:bg-white selection:text-black">
      {/* Navigation / Header */}
      <nav className="py-6 px-6 lg:px-12 flex items-center justify-between sticky top-0 bg-[#0A0A0B]/80 backdrop-blur-2xl z-[2000]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-zinc-950 shadow-lg shadow-white/5">
            <LayoutGrid size={22} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl font-display font-extrabold tracking-tight leading-none">
              CivicLens <span className="text-zinc-600 font-normal opacity-50">v0.1</span>
            </h1>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold mt-1">
              AI-Augmented Citizenship
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => { setSelectedState(null); setActiveTab("validator"); }}
            className={`text-[10px] font-mono uppercase tracking-[0.2em] px-5 py-2.5 rounded-full transition-all border ${activeTab === 'validator' ? 'bg-white text-zinc-900 border-white font-bold shadow-xl shadow-white/10' : 'text-zinc-500 border-zinc-800 hover:border-zinc-100 hover:text-white'}`}
          >
            Contributor Protocol
          </button>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse" />
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-semibold">Active Engine</span>
          </div>
        </div>
      </nav>

      <main className="max-w-[1700px] mx-auto p-6 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Map Section */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          <div className="p-8 border border-zinc-800/50 bg-zinc-900/10 rounded-4xl shadow-2xl">
            <div className="flex items-end justify-between mb-10">
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.4em] mb-2 font-black">Spatial Selection</span>
                <h2 className="text-5xl font-display font-black tracking-tighter text-white">
                  State Of The Union
                </h2>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-2xl text-[10px] font-mono uppercase tracking-widest text-zinc-400 shadow-lg">
                <Zap size={14} className="text-amber-400 fill-amber-400/20" />
                Live Synthesis
              </div>
            </div>
            
            <div className="flex flex-col gap-10">
              <div className="rounded-3xl overflow-hidden shadow-2xl border border-zinc-800/50">
                <NigeriaMap onStateSelect={handleStateSelect} selectedStateId={selectedState} />
              </div>
              
              <div className="pt-10 border-t border-zinc-800/50">
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.5em] font-black">Region Browser</span>
                  <div className="h-px flex-1 bg-zinc-900" />
                </div>
                <RegionSelector 
                  onSelect={handleStateSelect} 
                  selectedId={selectedState} 
                />
              </div>
            </div>
            
            <div className="mt-12 pt-10 border-t border-zinc-800/50 grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-zinc-600 uppercase mb-2 font-black tracking-widest">Scanning Depth</span>
                <span className="text-base font-display font-semibold text-zinc-300">Verified Sources 100%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-zinc-600 uppercase mb-2 font-black tracking-widest">Grounding Mode</span>
                <span className="text-base font-display font-semibold text-zinc-300">Real-time Search</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-zinc-600 uppercase mb-2 font-black tracking-widest">Protocol Version</span>
                <span className="text-base font-display font-semibold text-zinc-300">Civic-3-Flash</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info/Results Panel */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          <div className="flex flex-col h-full border border-zinc-800/30 rounded-4xl overflow-hidden bg-zinc-900/5 backdrop-blur-xl shadow-3xl">
            <div className="p-8 border-b border-zinc-800/30 flex items-center justify-between bg-zinc-900/20">
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.4em] mb-2 font-black">
                  {activeTab === 'validator' ? 'Verification Layer' : 'Intelligence Stream'}
                </span>
                <h2 className="text-4xl font-display font-black tracking-tighter text-white flex items-center gap-3">
                  {activeTab === 'validator' ? 'Source Audit' : (selectedState ? selectedState : "Standing By")}
                  {isLoading && <Loader2 className="animate-spin text-zinc-500" size={24} />}
                </h2>
              </div>
              {selectedState && activeTab !== 'validator' && !isLoading && (
                <div className="flex bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800 shadow-inner">
                  <button 
                    onClick={() => setActiveTab("news")}
                    className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${activeTab === 'news' ? 'bg-white text-zinc-950 font-bold shadow-xl' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    <Newspaper size={18} />
                    {activeTab === 'news' && <span className="text-[11px] font-mono uppercase tracking-tighter">Feed</span>}
                  </button>
                  <button 
                    onClick={() => setActiveTab("analysis")}
                    className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${activeTab === 'analysis' ? 'bg-white text-zinc-950 font-bold shadow-xl' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    <BarChart3 size={18} />
                    {activeTab === 'analysis' && <span className="text-[11px] font-mono uppercase tracking-tighter">Audit</span>}
                  </button>
                  <div className="w-px h-8 bg-zinc-800 mx-2 self-center" />
                  <button 
                    onClick={() => fetchData(selectedState)}
                    className="p-2.5 text-zinc-500 hover:text-white transition-all hover:bg-white/5 rounded-xl"
                  >
                    <Search size={18} />
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 p-8 overflow-hidden relative min-h-[600px]">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center bg-[#0A0A0B]"
                  >
                    <div className="relative w-24 h-24 mb-10">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-3 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full"
                      />
                      <motion.div 
                        animate={{ rotate: -360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-4 border-3 border-t-zinc-700 border-r-transparent border-b-transparent border-l-transparent rounded-full"
                      />
                    </div>
                    <p className="text-sm font-display font-bold text-white uppercase tracking-[0.5em]">
                      Cognitive Synthesis
                    </p>
                    <p className="mt-4 text-[11px] font-mono text-zinc-600 uppercase tracking-widest max-w-xs leading-relaxed">
                      Cross-referencing {selectedState || 'submission'} across verified digital archives
                    </p>
                  </motion.div>
                ) : error ? (
                   <motion.div 
                    key="error"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center h-full text-center p-12"
                  >
                    <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6">
                      <AlertCircle size={40} className="text-rose-500" />
                    </div>
                    <h3 className="text-2xl font-display font-bold text-white mb-2">Protocol Interrupted</h3>
                    <p className="text-zinc-500 text-sm max-w-xs">{error}</p>
                    <button 
                      onClick={() => selectedState && fetchData(selectedState)}
                      className="mt-8 px-6 py-2 border border-zinc-800 rounded-full text-xs font-mono uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                    >
                      Retry Manual Sync
                    </button>
                  </motion.div>
                ) : activeTab === 'validator' ? (
                  <SourceValidatorUI />
                ) : (selectedState && (activeTab === 'news' ? newsDigest : analysis)) ? (
                  activeTab === 'news' ? (
                    <NewsCard news={newsDigest || []} />
                  ) : (
                    analysis && <AnalysisPanel analysis={analysis} />
                  )
                ) : (
                  <motion.div 
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full text-center p-12 overflow-y-auto"
                  >
                    <div className="w-32 h-32 bg-zinc-900 rounded-[40px] flex items-center justify-center text-zinc-800 mb-10 transform rotate-6 border border-zinc-800/50">
                      <LayoutGrid size={64} />
                    </div>
                    <h3 className="text-2xl font-display font-bold text-white mb-4">Awaiting Directives</h3>
                    <p className="text-sm font-mono text-zinc-500 uppercase tracking-widest font-semibold max-w-sm">
                      Initialize spatial observation by selecting a state node
                    </p>
                    
                    <div className="mt-12 grid grid-cols-1 gap-4 w-full">
                      {[
                        { icon: BarChart3, label: "Civic Health Audit" },
                        { icon: Newspaper, label: "Real-time Verification" },
                        { icon: Zap, label: "Confidence Evaluation" }
                      ].map((item, idx) => (
                        <div key={idx} className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-3xl flex items-center gap-4 group hover:bg-white/5 transition-all cursor-default">
                          <div className="p-3 bg-zinc-950 rounded-2xl text-zinc-500 group-hover:text-white transition-colors">
                            <item.icon size={20} />
                          </div>
                          <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest group-hover:text-white font-bold">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="px-8 py-6 bg-white/5 border-t border-zinc-800/30">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-emerald-500" />
                   <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] font-bold">
                     Fact-Check Engine // Sync v4.2
                   </span>
                 </div>
                 <span className="text-[10px] font-mono text-zinc-700 uppercase font-black">
                   CIVICLENS • AI STUDIO
                 </span>
               </div>
            </div>
          </div>
        </div>
      </main>

      {/* Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-violet-600/5 blur-[160px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-600/5 blur-[160px] rounded-full" />
        <div className="absolute top-[30%] right-[-5%] w-[40%] h-[40%] bg-blue-600/5 blur-[160px] rounded-full" />
      </div>
    </div>
  );
}

