import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Map, AlertCircle } from "lucide-react";
import { useTranslation } from "../context/LanguageContext";
import API from "../services/api";

// Leaflet default icon asset resolution hack for build/bundling systems
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png"
});

const HotspotMap = () => {
  const { t } = useTranslation();
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  // Fetch hotspots data
  useEffect(() => {
    const fetchHotspots = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await API.get("/analytics/hotspots");
        setHotspots(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load map hotspot details.");
      } finally {
        setLoading(false);
      }
    };
    fetchHotspots();
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapInstanceRef.current && mapContainerRef.current) {
      // Center on India geographic center
      const map = L.map(mapContainerRef.current).setView([20.5937, 78.9629], 5);
      
      // Light tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers when hotspots data loads
  useEffect(() => {
    if (mapInstanceRef.current && markersLayerRef.current && hotspots.length > 0) {
      // Clear old layer markers
      markersLayerRef.current.clearLayers();

      hotspots.forEach((h) => {
        const color = h.risk_level === "High" ? "#ef4444" : h.risk_level === "Medium" ? "#f59e0b" : "#10b981";
        
        // Custom Styled Popup HTML
        const popupContent = `
          <div style="font-family: 'Outfit', sans-serif; padding: 4px; min-width: 140px;">
            <h4 style="font-weight: bold; font-size: 14px; margin: 0 0 6px 0; color: #7c3aed;">${h.reference_id}</h4>
            <div style="font-size: 11px; margin-bottom: 2px;"><b>Type:</b> ${h.incident_type}</div>
            <div style="font-size: 11px; margin-bottom: 6px;"><b>Location:</b> ${h.location_name}</div>
            <div style="display: flex; gap: 4px;">
              <span style="font-size: 9px; font-weight: bold; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; background-color: ${color}20; color: ${color};">
                ${h.risk_level}
              </span>
              <span style="font-size: 9px; font-weight: bold; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; background-color: #f1f5f9; color: #475569;">
                ${h.priority}
              </span>
            </div>
          </div>
        `;

        // 1. Coverage area hotspot circle
        const circle = L.circle([h.latitude, h.longitude], {
          color: color,
          fillColor: color,
          fillOpacity: 0.2,
          weight: 1.5,
          radius: h.risk_level === "High" ? 30000 : h.risk_level === "Medium" ? 18000 : 10000
        }).bindPopup(popupContent);
        
        // 2. Exact pin marker
        const marker = L.marker([h.latitude, h.longitude]).bindPopup(popupContent);
        
        markersLayerRef.current.addLayer(circle);
        markersLayerRef.current.addLayer(marker);
      });

      // Auto zoom map to fit all points
      try {
        const layers = markersLayerRef.current.getLayers();
        if (layers.length > 0) {
          const group = new L.featureGroup(layers);
          mapInstanceRef.current.fitBounds(group.getBounds().pad(0.15));
        }
      } catch (err) {
        console.error("Leaflet bounds zoom error:", err);
      }
    }
  }, [hotspots]);

  return (
    <div className="space-y-8 h-full flex flex-col">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <Map className="text-purple-600" />
          {t("hotspotMap")}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Geographic incident mapping using Leaflet.js. Visual hotspots denote safety zones and priority incidents.
        </p>
      </div>

      {/* Error Info */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-red-500/10 p-4 text-red-600 dark:bg-red-500/20 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      {/* Map Outer Box */}
      <div className="relative flex-1 min-h-[500px] rounded-3xl overflow-hidden shadow-md border border-slate-200/50 dark:border-slate-800/50">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-500/10 backdrop-blur-sm">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
          </div>
        )}
        
        {/* Actual Map Target */}
        <div ref={mapContainerRef} className="w-full h-full min-h-[500px]" />
      </div>
    </div>
  );
};

export default HotspotMap;
