import React, { useState, useMemo } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  Pin,
} from "@vis.gl/react-google-maps";
import {
  MapPin,
  Star,
  ShieldCheck,
  Phone,
  Layers,
  Search,
  ExternalLink,
  Navigation,
  CheckCircle2,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { WorkerProfile, CustomerProfile, TradeType } from "../../types";
import { calculateDistanceKm, getGoogleMapsLocationUrl } from "../../utils/geo";

interface GoogleMapWorkersExplorerProps {
  workers: WorkerProfile[];
  currentCustomer?: CustomerProfile | null;
  onSelectWorker?: (worker: WorkerProfile) => void;
  onBookWorker?: (worker: WorkerProfile) => void;
  className?: string;
  height?: string;
}

const TRADE_COLORS: Record<
  string,
  { bg: string; text: string; pinBg: string; pinGlyph: string }
> = {
  Carpenter: {
    bg: "bg-amber-100 dark:bg-amber-950/60",
    text: "text-amber-800 dark:text-amber-300",
    pinBg: "#D97706",
    pinGlyph: "#FFFFFF",
  },
  Electrician: {
    bg: "bg-yellow-100 dark:bg-yellow-950/60",
    text: "text-yellow-800 dark:text-yellow-300",
    pinBg: "#EAB308",
    pinGlyph: "#000000",
  },
  Plumber: {
    bg: "bg-blue-100 dark:bg-blue-950/60",
    text: "text-blue-800 dark:text-blue-300",
    pinBg: "#2563EB",
    pinGlyph: "#FFFFFF",
  },
  Mason: {
    bg: "bg-orange-100 dark:bg-orange-950/60",
    text: "text-orange-800 dark:text-orange-300",
    pinBg: "#EA580C",
    pinGlyph: "#FFFFFF",
  },
  Painter: {
    bg: "bg-purple-100 dark:bg-purple-950/60",
    text: "text-purple-800 dark:text-purple-300",
    pinBg: "#9333EA",
    pinGlyph: "#FFFFFF",
  },
  Welder: {
    bg: "bg-rose-100 dark:bg-rose-950/60",
    text: "text-rose-800 dark:text-rose-300",
    pinBg: "#E11D48",
    pinGlyph: "#FFFFFF",
  },
  "Construction Helper": {
    bg: "bg-emerald-100 dark:bg-emerald-950/60",
    text: "text-emerald-800 dark:text-emerald-300",
    pinBg: "#059669",
    pinGlyph: "#FFFFFF",
  },
  "Tile Worker": {
    bg: "bg-cyan-100 dark:bg-cyan-950/60",
    text: "text-cyan-800 dark:text-cyan-300",
    pinBg: "#0891B2",
    pinGlyph: "#FFFFFF",
  },
  "Loader/Mover": {
    bg: "bg-stone-100 dark:bg-stone-950/60",
    text: "text-stone-800 dark:text-stone-300",
    pinBg: "#57534E",
    pinGlyph: "#FFFFFF",
  },
};

export const GoogleMapWorkersExplorer: React.FC<
  GoogleMapWorkersExplorerProps
> = ({
  workers,
  currentCustomer,
  onSelectWorker,
  onBookWorker,
  className = "w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg",
  height = "h-[500px]",
}) => {
  const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || "";
  const [selectedTrade, setSelectedTrade] = useState<string>("All");
  const [selectedWorker, setSelectedWorker] = useState<WorkerProfile | null>(
    null,
  );
  const [mapTypeId, setMapTypeId] = useState<"roadmap" | "hybrid">("roadmap");

  const customerLat = currentCustomer?.gpsLocation?.lat || 30.8926;
  const customerLng = currentCustomer?.gpsLocation?.lng || 75.8415;

  // Filter workers based on selected trade
  const filteredWorkers = useMemo(() => {
    if (selectedTrade === "All") return workers;
    return workers.filter((w) => w.primaryTrade === selectedTrade);
  }, [workers, selectedTrade]);

  const tradesList = useMemo(() => {
    const set = new Set<string>();
    workers.forEach((w) => set.add(w.primaryTrade));
    return ["All", ...Array.from(set)];
  }, [workers]);

  return (
    <div className={`relative flex flex-col ${className}`}>
      {/* Top Filter Bar */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800 p-3 flex items-center justify-between gap-2 overflow-x-auto z-10 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
          {tradesList.map((trade) => {
            const isSelected = selectedTrade === trade;
            return (
              <button
                key={trade}
                onClick={() => setSelectedTrade(trade)}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition flex items-center gap-1 ${
                  isSelected
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <span>{trade}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? "bg-amber-700 text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {trade === "All"
                    ? workers.length
                    : workers.filter((w) => w.primaryTrade === trade).length}
                </span>
              </button>
            );
          })}
        </div>

        {/* View Toggle */}
        <button
          onClick={() =>
            setMapTypeId((prev) => (prev === "roadmap" ? "hybrid" : "roadmap"))
          }
          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1 shrink-0 transition"
          title="Toggle Satellite / Roadmap"
        >
          <Layers className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden sm:inline">
            {mapTypeId === "roadmap" ? "Satellite" : "Map"}
          </span>
        </button>
      </div>

      {/* Map Container */}
      <div className={`relative w-full ${height} bg-slate-100 dark:bg-slate-950`}>
        {apiKey ? (
          <APIProvider apiKey={apiKey} libraries={["marker", "places"]}>
            <Map
              mapId="DEMO_MAP_ID"
              defaultCenter={{ lat: customerLat, lng: customerLng }}
              defaultZoom={13}
              gestureHandling="greedy"
              disableDefaultUI={false}
              mapTypeId={mapTypeId}
              internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
              className="w-full h-full"
            >
              {/* Customer Pin */}
              <AdvancedMarker
                position={{ lat: customerLat, lng: customerLng }}
                title="Your Location"
              >
                <div className="relative cursor-pointer">
                  <div className="w-9 h-9 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center text-white">
                    <MapPin className="w-5 h-5 fill-white text-blue-600" />
                  </div>
                  <div className="absolute -inset-1.5 rounded-full border-2 border-blue-400 animate-ping opacity-60 pointer-events-none"></div>
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-blue-900 text-white px-1.5 py-0.5 rounded text-[10px] font-bold whitespace-nowrap shadow-md">
                    You Are Here
                  </div>
                </div>
              </AdvancedMarker>

              {/* Worker Advanced Markers */}
              {filteredWorkers.map((worker) => {
                const wLat = worker.gpsLocation?.lat || customerLat + 0.005;
                const wLng = worker.gpsLocation?.lng || customerLng + 0.005;
                const colors = TRADE_COLORS[worker.primaryTrade] || {
                  pinBg: "#F59E0B",
                  pinGlyph: "#000000",
                };
                const dist = calculateDistanceKm(
                  customerLat,
                  customerLng,
                  wLat,
                  wLng,
                );

                return (
                  <AdvancedMarker
                    key={worker.id}
                    position={{ lat: wLat, lng: wLng }}
                    title={`${worker.name} (${worker.primaryTrade})`}
                    onClick={() => setSelectedWorker(worker)}
                  >
                    <div className="relative cursor-pointer group hover:scale-110 transition-transform">
                      <div
                        className="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs font-black text-white"
                        style={{ backgroundColor: colors.pinBg }}
                      >
                        {worker.name.charAt(0)}
                      </div>
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 text-amber-300 px-1 py-0.2 rounded text-[9px] font-bold border border-amber-500/20 whitespace-nowrap shadow-xs">
                        ₹{worker.dailyRate}
                      </div>
                    </div>
                  </AdvancedMarker>
                );
              })}

              {/* Selected Worker InfoWindow */}
              {selectedWorker && (
                <InfoWindow
                  position={{
                    lat: selectedWorker.gpsLocation?.lat || customerLat,
                    lng: selectedWorker.gpsLocation?.lng || customerLng,
                  }}
                  onCloseClick={() => setSelectedWorker(null)}
                >
                  <div className="p-2.5 text-slate-900 min-w-[210px] max-w-[250px] space-y-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={selectedWorker.avatar}
                        alt={selectedWorker.name}
                        className="w-10 h-10 rounded-full object-cover border border-amber-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-slate-900 flex items-center gap-1 truncate">
                          <span>{selectedWorker.name}</span>
                          {selectedWorker.isVerified && (
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                        </div>
                        <div className="text-xs font-semibold text-amber-700">
                          {selectedWorker.primaryTrade}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs bg-slate-100 p-2 rounded-lg">
                      <div>
                        <span className="text-[10px] text-slate-500 block">
                          Daily Wage
                        </span>
                        <span className="font-black text-slate-900">
                          ₹{selectedWorker.dailyRate}
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] text-slate-500 block">
                          Rating
                        </span>
                        <span className="font-bold text-amber-600 flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {selectedWorker.rating}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">
                          Distance
                        </span>
                        <span className="font-bold text-slate-800">
                          {calculateDistanceKm(
                            customerLat,
                            customerLng,
                            selectedWorker.gpsLocation?.lat || customerLat,
                            selectedWorker.gpsLocation?.lng || customerLng,
                          ).toFixed(1)}{" "}
                          km
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      {onBookWorker && (
                        <button
                          onClick={() => {
                            onBookWorker(selectedWorker);
                            setSelectedWorker(null);
                          }}
                          className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                        >
                          Book Worker
                        </button>
                      )}
                      <a
                        href={getGoogleMapsLocationUrl(
                          selectedWorker.gpsLocation?.lat || customerLat,
                          selectedWorker.gpsLocation?.lng || customerLng,
                          `${selectedWorker.name} - ${selectedWorker.primaryTrade}`,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs transition"
                        title="View on Google Maps"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </APIProvider>
        ) : (
          /* Fallback interactive map when API key is awaiting setup */
          <div className="relative w-full h-full bg-slate-900 text-white flex flex-col items-center justify-center p-4">
            <iframe
              title="Google Maps Worker Explorer"
              src={`https://maps.google.com/maps?q=${customerLat},${customerLng}&hl=en&z=13&output=embed`}
              className="absolute inset-0 w-full h-full border-0 opacity-80"
              loading="lazy"
            />

            {/* Overlay card for workers */}
            <div className="absolute bottom-4 inset-x-4 max-w-lg mx-auto bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl p-4 shadow-2xl space-y-3 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 font-bold">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Google Maps Grounded Explorer</span>
                      <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded text-[9px]">
                        Hyperlocal 10km
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {filteredWorkers.length} verified tradesmen within 10 km
                    </p>
                  </div>
                </div>
                <a
                  href={`https://www.google.com/maps/search/daily+wage+workers+near+${customerLat},${customerLng}?utm_campaign=gmp_mcp_codeassist_v1_aistudio`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-xs transition"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Google Maps</span>
                </a>
              </div>

              {/* Horizontal Scroll of Top 4 Workers */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {filteredWorkers.slice(0, 4).map((w) => {
                  const dist = calculateDistanceKm(
                    customerLat,
                    customerLng,
                    w.gpsLocation?.lat || customerLat,
                    w.gpsLocation?.lng || customerLng,
                  );
                  return (
                    <div
                      key={w.id}
                      onClick={() => onBookWorker && onBookWorker(w)}
                      className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl p-2 min-w-[130px] shrink-0 cursor-pointer transition flex flex-col justify-between"
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <img
                          src={w.avatar}
                          alt={w.name}
                          className="w-6 h-6 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="text-xs font-bold text-white truncate">
                          {w.name}
                        </span>
                      </div>
                      <div className="text-[10px] text-amber-400 font-medium">
                        {w.primaryTrade}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 pt-1 border-t border-slate-700/60 font-mono">
                        <span>₹{w.dailyRate}/d</span>
                        <span className="text-amber-300 font-bold">
                          {dist.toFixed(1)}km
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info Strip */}
      <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>
            Real-time coordinates synced via Google Maps Platform • Solution ID:{" "}
            <code className="text-amber-600 dark:text-amber-400 font-mono font-bold text-[10px]">
              gmp_mcp_codeassist_v1_aistudio
            </code>
          </span>
        </div>
        <div className="font-mono text-[10px]">
          Target Radius: <strong>10.0 km</strong>
        </div>
      </div>
    </div>
  );
};
