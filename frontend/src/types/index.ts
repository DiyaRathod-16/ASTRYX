export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface Location {
  lat: number;
  lng: number;
  name: string;
}

export interface SwarmConsensus {
  agentCount: number;
  consensusScore: number;
  score: number;
  confidence: number;
  status: 'reaching_consensus' | 'consensus_reached' | 'conflict_detected';
  agents?: SwarmAgent[];
}

export interface SwarmAgent {
  type: string;
  status: string;
  confidence: number;
  output?: string;
}

export interface Anomaly {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  confidence: number;
  swarmConsensus: SwarmConsensus | number;
  location: Location;
  timestamp: string;
  createdAt?: string;
  status: string;
  modalities: string[];
  source?: string;
  tags?: string[];
  latitude?: number;
  longitude?: number;
}

export interface Agent {
  id: string;
  type: 'text' | 'image' | 'audio' | 'sensor' | 'verification' | 'forecasting';
  status: 'active' | 'processing' | 'idle' | 'error';
  confidence: number;
  output?: string;
}

export interface RiskMetric {
  region: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  activeThreats: number;
  change: number;
}

export interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  timestamp?: string;
  details?: string;
}

export interface Notification {
  id: string;
  type: 'alert' | 'new_anomaly' | 'info' | 'system';
  title: string;
  message: string;
  severity?: Severity;
  timestamp: Date;
  read?: boolean;
}
