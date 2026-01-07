import { useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { Anomaly } from '../stores';
import 'leaflet/dist/leaflet.css';

interface AnomalyMapProps {
  anomalies: Anomaly[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onAnomalyClick?: (anomaly: Anomaly) => void;
}

const severityColors: Record<string, string> = {
  critical: '#dc2626',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

const severityRadius: Record<string, number> = {
  critical: 12,
  high: 10,
  medium: 8,
  low: 6,
};

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  
  useMemo(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);

  return null;
}

export default function AnomalyMap({
  anomalies,
  center = [20, 0],
  zoom = 2,
  height = '500px',
  onAnomalyClick,
}: AnomalyMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height, width: '100%', borderRadius: '0.75rem' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <MapController center={center} zoom={zoom} />
      
      {anomalies.map((anomaly) => (
        <CircleMarker
          key={anomaly.id}
          center={[anomaly.latitude, anomaly.longitude]}
          radius={severityRadius[anomaly.severity] || 8}
          pathOptions={{
            color: severityColors[anomaly.severity] || '#6b7280',
            fillColor: severityColors[anomaly.severity] || '#6b7280',
            fillOpacity: 0.6,
            weight: 2,
          }}
          eventHandlers={{
            click: () => onAnomalyClick?.(anomaly),
          }}
        >
          <Popup>
            <div className="min-w-48">
              <h4 className="font-semibold text-gray-900 mb-1">{anomaly.title}</h4>
              <p className="text-sm text-gray-600 mb-2">{anomaly.location}</p>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs px-2 py-0.5 rounded font-medium
                  ${anomaly.severity === 'critical' ? 'bg-red-100 text-red-700' : ''}
                  ${anomaly.severity === 'high' ? 'bg-orange-100 text-orange-700' : ''}
                  ${anomaly.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' : ''}
                  ${anomaly.severity === 'low' ? 'bg-green-100 text-green-700' : ''}
                `}>
                  {anomaly.severity.toUpperCase()}
                </span>
                <span className="text-xs text-gray-500">
                  {Math.round(anomaly.confidence * 100)}% confidence
                </span>
              </div>
              <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                {anomaly.description}
              </p>
              <Link
                to={`/anomalies/${anomaly.id}`}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                View Details →
              </Link>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}

// Heatmap-style indicator component
export function SeverityLegend() {
  return (
    <div className="flex items-center gap-4 text-sm">
      <span className="text-gray-400">Severity:</span>
      {Object.entries(severityColors).map(([severity, color]) => (
        <div key={severity} className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-gray-300 capitalize">{severity}</span>
        </div>
      ))}
    </div>
  );
}
