import { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion, AnimatePresence } from "motion/react";
import { NIGERIA_STATES } from "../constants";
import { MapPin, RotateCcw } from "lucide-react";

// Fix for default marker icons in Leaflet + React
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Dot Icon for a more "tech" look
const createDotIcon = (isSelected: boolean, isHovered: boolean) => {
  const size = isSelected || isHovered ? 24 : 12;
  const color = isSelected ? "#ffffff" : "#444444";
  
  return L.divIcon({
    className: "custom-div-icon",
    html: `<div style="
      width: ${size}px; 
      height: ${size}px; 
      background-color: ${color}; 
      border: 2px solid white; 
      border-radius: 50%;
      box-shadow: ${isSelected ? '0 0 20px rgba(255,255,255,0.5)' : 'none'};
      transition: all 0.3s ease;
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
  });
};

const NIGERIA_CENTER: [number, number] = [9.0820, 8.6753];

// Helper to handle map view updates
function MapController({ selectedStateId, center }: { selectedStateId: string | null, center: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedStateId) {
      const state = NIGERIA_STATES.find(s => s.id === selectedStateId);
      if (state) {
        map.setView([state.lat, state.lng], 8, { animate: true, duration: 1 });
      }
    }
  }, [selectedStateId, map]);

  return null;
}

// Helper to handle background clicks
function MapEvents({ onDeselect }: { onDeselect: () => void }) {
  useMapEvents({
    click: () => {
      onDeselect();
    },
  });
  return null;
}

export default function NigeriaMap({ onStateSelect, selectedStateId }: { onStateSelect: (stateName: string) => void, selectedStateId: string | null }) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  const mapInstance = useMemo(() => (
    <MapContainer 
      center={NIGERIA_CENTER} 
      zoom={6} 
      className="w-full h-full bg-[#0a0a0a]"
      zoomControl={false}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      
      <MapController selectedStateId={selectedStateId} center={NIGERIA_CENTER} />
      <MapEvents onDeselect={() => onStateSelect("")} />

      {NIGERIA_STATES.map((state) => (
        <Marker
          key={state.id}
          position={[state.lat, state.lng]}
          icon={createDotIcon(selectedStateId === state.id, hoveredState === state.id)}
          eventHandlers={{
            click: (e) => {
              L.DomEvent.stopPropagation(e);
              onStateSelect(state.id);
            },
            mouseover: () => setHoveredState(state.id),
            mouseout: () => setHoveredState(null),
          }}
        />
      ))}
    </MapContainer>
  ), [selectedStateId, hoveredState, onStateSelect]);

  return (
    <div className="relative w-full h-[600px] bg-zinc-950 overflow-hidden group">
      {mapInstance}

      {/* Map Legend/Overlay */}
      <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-4">
         <div className="p-4 border border-zinc-800 bg-zinc-950/90 rounded-3xl backdrop-blur-md flex flex-col gap-4 w-56 shadow-2xl">
           <div>
             <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-black block mb-3">State Quality Index</span>
             <div className="flex flex-col gap-2">
               {[
                 { label: "Optimal", color: "bg-white", range: "80-100%" },
                 { label: "Functional", color: "bg-zinc-400", range: "50-79%" },
                 { label: "Degraded", color: "bg-zinc-800", range: "< 50%" }
               ].map((item) => (
                 <div key={item.label} className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <div className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                     <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-tight">{item.label}</span>
                   </div>
                   <span className="text-[9px] font-mono text-zinc-600 font-bold">{item.range}</span>
                 </div>
               ))}
             </div>
           </div>
           
           <div className="pt-4 border-t border-zinc-900">
             <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-black block mb-2">Signal Distribution</span>
             <div className="h-1 w-full bg-zinc-950 rounded-full overflow-hidden flex shadow-inner">
               <div className="h-full w-1/4 bg-white opacity-90" />
               <div className="h-full w-2/4 bg-zinc-500 opacity-50" />
               <div className="h-full w-1/4 bg-zinc-800 opacity-30" />
             </div>
             <div className="flex justify-between mt-2">
                <span className="text-[8px] font-mono text-zinc-700 uppercase">Tier 1</span>
                <span className="text-[8px] font-mono text-zinc-700 uppercase">Tier 3</span>
             </div>
           </div>
         </div>
      </div>

      <AnimatePresence>
        {selectedStateId && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute top-6 left-6 z-[1000] pointer-events-none"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white text-zinc-900 rounded shadow-lg">
                <MapPin size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest leading-none mb-1">Target Initialized</span>
                <h2 className="text-3xl font-display font-black text-white uppercase tracking-tighter leading-none">
                  {NIGERIA_STATES.find(s => s.id === selectedStateId)?.name}
                </h2>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual Reset View */}
      <div className="absolute bottom-6 left-6 z-[1000]">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onStateSelect("");
          }}
          className="p-3 bg-zinc-900 border border-zinc-800 rounded group hover:border-white transition-all shadow-xl flex items-center gap-2"
        >
          <RotateCcw size={16} className="text-zinc-500 group-hover:text-white transition-colors" />
          <span className="text-[10px] font-mono text-zinc-500 group-hover:text-white uppercase tracking-widest">Reset View</span>
        </button>
      </div>
    </div>
  );
}
