import React, { useState } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
} from "@vis.gl/react-google-maps";
import {
  Navigation,
  MapPin,
  ExternalLink,
  Shield,
  Layers,
  Compass,
} from "lucide-react";
import { DirectionsPolyline } from "./DirectionsPolyline";
import { getGoogleMapsDirectionsUrl } from "../../utils/geo";

interface GoogleMapRouteViewProps {
  origin: { lat: number; lng: number };
  originLabel: string;
  originSubLabel?: string;
  destination: { lat: number; lng: number };
  destinationLabel: string;
  destinationAddress?: string;
  distanceKm: number;
  transitMode?: "walk" | "bike" | "auto";
  heading?: number;
  className?: string;
}

export const GoogleMapRouteView: React.FC<GoogleMapRouteViewProps> = ({
  origin,
  originLabel,
  originSubLabel = "Worker en route",
  destination,
  destinationLabel,
  destinationAddress = "Job Site",
  distanceKm,
  transitMode = "walk",
  heading = 45,
  className = "w-full h-64",
}) => {
  const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || "";
  const [activeMarker, setActiveMarker] = useState<
    "origin" | "destination" | null
  >(null);
  const [mapTypeId, setMapTypeId] = useState<"roadmap" | "hybrid">("roadmap");

  const centerLat = (origin.lat + destination.lat) / 2;
  const centerLng = (origin.lng + destination.lng) / 2;

  const directionsUrl = getGoogleMapsDirectionsUrl(
    origin.lat,
    origin.lng,
    destination.lat,
    destination.lng,
    transitMode === "bike" ? "bicycling" : "walking",
  );

  // If no API key is provided, show the interactive embed fallback with Google Maps styling
  if (!apiKey) {
    const embedUrl = `https://maps.google.com/maps?saddr=${origin.lat},${origin.lng}&daddr=${destination.lat},${destination.lng}&output=embed&z=14`;

    return (
      <div
        className={`relative ${className} bg-slate-950 rounded-2xl border border-slate-700 overflow-hidden shadow-lg`}
      >
        <iframe
          title="Google Maps Live Routing"
          src={embedUrl}
          className="w-full h-full border-0 filter brightness-95 contrast-105"
          loading="lazy"
          allowFullScreen
        />

        {/* Floating Google Maps Platform pill */}
        <div className="absolute top-2 left-2 bg-slate-900/90 backdrop-blur-xs border border-slate-700 px-3 py-1.5 rounded-xl text-[11px] font-medium text-slate-200 space-y-0.5 shadow-md">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span>Google Maps Platform</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {origin.lat.toFixed(4)}°N, {origin.lng.toFixed(4)}°E →{" "}
            {destination.lat.toFixed(4)}°N, {destination.lng.toFixed(4)}°E
          </div>
        </div>

        {/* Open in Google Maps button */}
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-2 right-2 bg-slate-900/90 hover:bg-slate-800 text-amber-300 border border-slate-700 px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 shadow-md transition"
        >
          <ExternalLink className="w-3 h-3 text-amber-400" />
          <span>Google Maps App</span>
        </a>
      </div>
    );
  }

  return (
    <div
      className={`relative ${className} bg-slate-950 rounded-2xl border border-slate-700 overflow-hidden shadow-lg`}
    >
      <APIProvider apiKey={apiKey} libraries={["marker", "routes", "places"]}>
        <Map
          mapId="DEMO_MAP_ID"
          defaultCenter={{ lat: centerLat, lng: centerLng }}
          defaultZoom={14}
          gestureHandling="greedy"
          disableDefaultUI={false}
          mapTypeId={mapTypeId}
          internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
          className="w-full h-full"
        >
          {/* Dynamic turn-by-turn route rendered by Maps Routes Library */}
          <DirectionsPolyline
            origin={origin}
            destination={destination}
            travelMode={transitMode}
            strokeColor="#F59E0B"
            strokeWeight={5}
          />

          {/* Origin Advanced Marker (Moving Worker) */}
          <AdvancedMarker
            position={{ lat: origin.lat, lng: origin.lng }}
            title={originLabel}
            onClick={() => setActiveMarker("origin")}
          >
            <div className="relative cursor-pointer group">
              <div className="w-9 h-9 rounded-full bg-amber-500 border-2 border-white shadow-xl flex items-center justify-center text-slate-950 font-black">
                <Navigation
                  className="w-5 h-5 text-slate-950 transition-transform duration-300"
                  style={{ transform: `rotate(${heading}deg)` }}
                />
              </div>
              <div className="absolute -inset-1.5 rounded-full border-2 border-amber-400 animate-ping opacity-50 pointer-events-none"></div>
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-slate-900/90 text-amber-300 px-1.5 py-0.5 rounded text-[10px] font-bold border border-amber-500/30 whitespace-nowrap shadow-md">
                {originLabel}
              </div>
            </div>
          </AdvancedMarker>

          {/* Destination Advanced Marker (Job Site) */}
          <AdvancedMarker
            position={{ lat: destination.lat, lng: destination.lng }}
            title={destinationLabel}
            onClick={() => setActiveMarker("destination")}
          >
            <div className="relative cursor-pointer group">
              <div className="w-9 h-9 rounded-full bg-slate-900 border-2 border-amber-400 shadow-xl flex items-center justify-center text-amber-400">
                <MapPin className="w-5 h-5 fill-amber-400 text-slate-900" />
              </div>
              <div className="absolute -inset-1.5 rounded-full border border-amber-400/50 animate-pulse pointer-events-none"></div>
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-slate-900/90 text-amber-300 px-1.5 py-0.5 rounded text-[10px] font-bold border border-amber-500/30 whitespace-nowrap shadow-md">
                Job Site
              </div>
            </div>
          </AdvancedMarker>

          {/* Origin InfoWindow */}
          {activeMarker === "origin" && (
            <InfoWindow
              position={{ lat: origin.lat, lng: origin.lng }}
              onCloseClick={() => setActiveMarker(null)}
            >
              <div className="p-2 text-slate-900 min-w-[160px] text-xs space-y-1">
                <div className="font-black text-amber-700 text-sm flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{originLabel}</span>
                </div>
                <div className="text-slate-600 font-medium">
                  {originSubLabel}
                </div>
                <div className="text-slate-500 text-[11px] font-mono">
                  {origin.lat.toFixed(4)}°N, {origin.lng.toFixed(4)}°E
                </div>
                <div className="text-amber-800 font-bold text-[11px] pt-1 border-t border-slate-200">
                  {distanceKm.toFixed(1)} km to destination
                </div>
              </div>
            </InfoWindow>
          )}

          {/* Destination InfoWindow */}
          {activeMarker === "destination" && (
            <InfoWindow
              position={{ lat: destination.lat, lng: destination.lng }}
              onCloseClick={() => setActiveMarker(null)}
            >
              <div className="p-2 text-slate-900 min-w-[170px] text-xs space-y-1">
                <div className="font-black text-slate-900 text-sm flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  <span>{destinationLabel}</span>
                </div>
                <div className="text-slate-600 text-[11px]">
                  {destinationAddress}
                </div>
                <div className="text-slate-500 text-[10px] font-mono">
                  {destination.lat.toFixed(4)}°N, {destination.lng.toFixed(4)}°E
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>

      {/* Map Control Bar Overlay */}
      <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-xs border border-slate-700 p-1 rounded-xl shadow-lg">
        <button
          onClick={() =>
            setMapTypeId((prev) => (prev === "roadmap" ? "hybrid" : "roadmap"))
          }
          className="px-2 py-1 rounded-lg text-[10px] font-bold text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-1 transition"
          title="Toggle Satellite / Roadmap"
        >
          <Layers className="w-3 h-3 text-amber-400" />
          <span>{mapTypeId === "roadmap" ? "Satellite" : "Map"}</span>
        </button>
        <span className="text-slate-600">|</span>
        <div className="px-2 py-1 text-[10px] font-mono text-amber-400 font-bold flex items-center gap-1">
          <Compass className="w-3 h-3" />
          <span>{heading}°</span>
        </div>
      </div>

      {/* External Link Overlay */}
      <a
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2 right-2 bg-slate-900/90 hover:bg-slate-800 text-amber-300 border border-slate-700 px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 shadow-md transition"
      >
        <ExternalLink className="w-3 h-3 text-amber-400" />
        <span>Open in Google Maps</span>
      </a>
    </div>
  );
};
