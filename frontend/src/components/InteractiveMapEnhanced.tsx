import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { apiService } from '../services/apiService';
import { Anomaly } from '../types';

interface InteractiveMapEnhancedProps {
  onAnomalySelect?: (anomaly: Anomaly) => void;
  selectedAnomalyId?: string;
}

const InteractiveMapEnhanced: React.FC<InteractiveMapEnhancedProps> = ({ 
  onAnomalySelect,
  selectedAnomalyId 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.CircleMarker }>({});
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnomalies();
    const interval = setInterval(fetchAnomalies, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAnomalies = async () => {
    try {
      const data = await apiService.fetchAnomalies();
      setAnomalies(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch anomalies:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map with dark theme
    const map = L.map(mapRef.current, {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: false
    });

    // Dark map tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Add zoom control to bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Add anomaly markers
    anomalies.forEach((anomaly) => {
      const lat = anomaly.location?.lat || anomaly.latitude || getRandomLat();
      const lng = anomaly.location?.lng || anomaly.longitude || getRandomLng();

      const markerColor = getSeverityColor(anomaly.severity);
      const markerRadius = getMarkerRadius(anomaly.severity);
      
      const marker = L.circleMarker([lat, lng], {
        radius: markerRadius,
        fillColor: markerColor,
        fillOpacity: 0.7,
        color: markerColor,
        weight: 2,
        className: anomaly.id === selectedAnomalyId ? 'selected-marker' : ''
      }).addTo(mapInstanceRef.current!);

      // Pulsing effect for critical anomalies
      if (anomaly.severity === 'critical') {
        const pulseMarker = L.circleMarker([lat, lng], {
          radius: markerRadius + 10,
          fillColor: markerColor,
          fillOpacity: 0.3,
          color: markerColor,
          weight: 1,
          className: 'pulse-marker'
        }).addTo(mapInstanceRef.current!);
      }

      // Create popup content
      const popupContent = `
        <div class="anomaly-popup" style="background: #1a1a2e; color: white; padding: 12px; border-radius: 8px; min-width: 200px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span style="
              padding: 2px 8px; 
              border-radius: 4px; 
              font-size: 10px; 
              text-transform: uppercase;
              font-weight: bold;
              background: ${getSeverityBgColor(anomaly.severity)};
              color: ${markerColor};
            ">${anomaly.severity}</span>
            <span style="color: #9ca3af; font-size: 11px;">${anomaly.id}</span>
          </div>
          <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">${anomaly.title || 'Anomaly Detected'}</h4>
          <p style="margin: 0 0 8px 0; color: #9ca3af; font-size: 12px;">${anomaly.description?.substring(0, 100) || 'No description'}...</p>
          <div style="display: flex; justify-content: space-between; font-size: 11px; color: #6b7280;">
            <span>📍 ${anomaly.location?.name || 'Unknown Location'}</span>
            <span>🕐 ${formatTime(anomaly.timestamp || anomaly.createdAt)}</span>
          </div>
          ${anomaly.swarmConsensus ? `
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #374151;">
              <span style="font-size: 11px; color: #9ca3af;">Swarm Consensus:</span>
              <span style="font-size: 13px; font-weight: bold; color: #10b981; margin-left: 4px;">
                ${Math.round((anomaly.swarmConsensus.score || 0.85) * 100)}%
              </span>
            </div>
          ` : ''}
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: 'dark-popup'
      });

      marker.on('click', () => {
        if (onAnomalySelect) {
          onAnomalySelect(anomaly);
        }
      });

      markersRef.current[anomaly.id] = marker;
    });

  }, [anomalies, selectedAnomalyId, onAnomalySelect]);

  // Pan to selected anomaly
  useEffect(() => {
    if (selectedAnomalyId && mapInstanceRef.current && markersRef.current[selectedAnomalyId]) {
      const marker = markersRef.current[selectedAnomalyId];
      mapInstanceRef.current.setView(marker.getLatLng(), 6, { animate: true });
      marker.openPopup();
    }
  }, [selectedAnomalyId]);

  const getSeverityColor = (severity: string): string => {
    switch (severity?.toLowerCase()) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getSeverityBgColor = (severity: string): string => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'rgba(239, 68, 68, 0.2)';
      case 'high': return 'rgba(249, 115, 22, 0.2)';
      case 'medium': return 'rgba(234, 179, 8, 0.2)';
      case 'low': return 'rgba(34, 197, 94, 0.2)';
      default: return 'rgba(107, 114, 128, 0.2)';
    }
  };

  const getMarkerRadius = (severity: string): number => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 12;
      case 'high': return 10;
      case 'medium': return 8;
      case 'low': return 6;
      default: return 6;
    }
  };

  const getRandomLat = () => Math.random() * 140 - 70;
  const getRandomLng = () => Math.random() * 340 - 170;

  const formatTime = (timestamp: string | Date | undefined) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-gray-700">
      {loading && (
        <div className="absolute inset-0 bg-black flex items-center justify-center z-50">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-white">Loading anomalies...</span>
          </div>
        </div>
      )}
      
      <div ref={mapRef} className="w-full h-full" style={{ minHeight: '400px' }} />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-black border border-gray-700 rounded-lg p-3 z-40">
        <div className="text-xs text-gray-300 mb-2">Severity Legend</div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs text-white">Critical</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-xs text-white">High</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-xs text-white">Medium</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs text-white">Low</span>
          </div>
        </div>
      </div>

      {/* Stats Overlay */}
      <div className="absolute top-4 right-4 bg-black border border-gray-700 rounded-lg p-3 z-40">
        <div className="text-xs text-gray-300 mb-1">Active Anomalies</div>
        <div className="text-2xl font-bold text-white">{anomalies.length}</div>
      </div>

      <style>{`
        .dark-popup .leaflet-popup-content-wrapper {
          background: transparent;
          box-shadow: none;
          padding: 0;
        }
        .dark-popup .leaflet-popup-tip {
          background: #000000;
        }
        .pulse-marker {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.2); }
          100% { opacity: 0.7; transform: scale(1); }
        }
        .selected-marker {
          stroke-width: 4 !important;
        }
      `}</style>
    </div>
  );
};

export default InteractiveMapEnhanced;
