import cron from 'node-cron';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { AnomalyModel } from '../models/index';
import { GeminiService } from './GeminiService';
import { WorkflowService } from './WorkflowService';
import { WebSocketService } from './WebSocketService';

interface ExternalDataSource {
  name: string;
  type: string;
  endpoint: string;
  apiKey?: string;
  parser: (data: any) => ParsedAnomaly[];
}

interface ParsedAnomaly {
  title: string;
  description: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  latitude: number;
  longitude: number;
  location: string;
  rawData: object;
  mediaUrls?: string[];
  sourceType: string;
}

export class DataIngestionService {
  private static instance: DataIngestionService;
  private cronJob: cron.ScheduledTask | null = null;
  private isRunning = false;
  private wsService: WebSocketService | null = null;
  private geminiService: GeminiService;
  private workflowService: WorkflowService;

  private dataSources: ExternalDataSource[] = [
    {
      name: 'USGS Earthquakes',
      type: 'seismic',
      endpoint: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson',
      parser: this.parseUSGSEarthquakes.bind(this)
    },
    {
      name: 'NASA EONET',
      type: 'environmental',
      endpoint: 'https://eonet.gsfc.nasa.gov/api/v3/events?limit=10',
      parser: this.parseEONET.bind(this)
    },
    {
      name: 'OpenWeatherMap Alerts',
      type: 'weather',
      endpoint: 'https://api.openweathermap.org/data/2.5/onecall',
      apiKey: process.env.OPENWEATHERMAP_API_KEY,
      parser: this.parseOpenWeatherAlerts.bind(this)
    }
  ];

  private constructor() {
    this.geminiService = GeminiService.getInstance();
    this.workflowService = WorkflowService.getInstance();
  }

  static getInstance(): DataIngestionService {
    if (!DataIngestionService.instance) {
      DataIngestionService.instance = new DataIngestionService();
    }
    return DataIngestionService.instance;
  }

  setWebSocketService(wsService: WebSocketService): void {
    this.wsService = wsService;
  }

  start(): void {
    const schedule = process.env.INGESTION_SCHEDULE || '*/15 * * * *';
    
    this.cronJob = cron.schedule(schedule, async () => {
      await this.runIngestion();
    });

    logger.info(`Data ingestion scheduled: ${schedule}`);
    
    // Run initial ingestion
    setTimeout(() => this.runIngestion(), 5000);
  }

  stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
      logger.info('Data ingestion stopped');
    }
  }

  async runIngestion(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Ingestion already running, skipping');
      return;
    }

    this.isRunning = true;
    logger.info('Starting data ingestion cycle');

    try {
      const results = await Promise.allSettled(
        this.dataSources.map(source => this.fetchFromSource(source))
      );

      let totalAnomalies = 0;
      for (const result of results) {
        if (result.status === 'fulfilled') {
          totalAnomalies += result.value;
        } else {
          logger.error('Source fetch failed:', result.reason);
        }
      }

      logger.info(`Ingestion complete: ${totalAnomalies} anomalies processed`);
      
      if (this.wsService && totalAnomalies > 0) {
        this.wsService.broadcastSystemEvent('ingestion_complete', {
          count: totalAnomalies,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      logger.error('Ingestion cycle error:', error);
    } finally {
      this.isRunning = false;
    }
  }

  private async fetchFromSource(source: ExternalDataSource): Promise<number> {
    try {
      let url = source.endpoint;
      if (source.apiKey) {
        const separator = url.includes('?') ? '&' : '?';
        url += `${separator}appid=${source.apiKey}`;
      }

      const response = await axios.get(url, {
        timeout: 30000,
        headers: {
          'User-Agent': 'ASTRYX/1.0 Anomaly Detection System'
        }
      });

      const anomalies = source.parser(response.data);
      
      for (const anomaly of anomalies) {
        await this.processAnomaly(anomaly, source.name);
      }

      logger.info(`Fetched ${anomalies.length} anomalies from ${source.name}`);
      return anomalies.length;
    } catch (error) {
      logger.error(`Error fetching from ${source.name}:`, error);
      return 0;
    }
  }

  private async processAnomaly(parsed: ParsedAnomaly, sourceName: string): Promise<void> {
    try {
      // Check for duplicates
      const existing = await AnomalyModel.findOne({
        where: {
          title: parsed.title,
          latitude: parsed.latitude,
          longitude: parsed.longitude
        }
      });

      if (existing) {
        return; // Skip duplicate
      }

      // AI Analysis
      const aiAnalysis = await this.geminiService.analyzeAnomaly({
        title: parsed.title,
        description: parsed.description,
        type: parsed.type,
        location: parsed.location,
        rawData: parsed.rawData
      });

      // Create anomaly
      const anomaly = await AnomalyModel.create({
        title: parsed.title,
        description: parsed.description,
        type: parsed.type as any,
        severity: aiAnalysis.severity || parsed.severity,
        status: 'detected',
        confidence: aiAnalysis.confidence,
        latitude: parsed.latitude,
        longitude: parsed.longitude,
        location: parsed.location,
        sourceType: sourceName,
        rawData: parsed.rawData,
        aiAnalysis: aiAnalysis,
        mediaUrls: parsed.mediaUrls || [],
        tags: aiAnalysis.categories
      });

      // Broadcast to clients
      if (this.wsService) {
        this.wsService.broadcastAnomaly('new', anomaly.toJSON());
      }

      // Trigger workflow for high severity
      if (['high', 'critical'].includes(anomaly.severity)) {
        await this.workflowService.triggerWorkflow('anomaly_detected', anomaly);
      }

      logger.debug(`Created anomaly: ${anomaly.id}`);
    } catch (error) {
      logger.error('Error processing anomaly:', error);
    }
  }

  // Parser for USGS Earthquake data
  private parseUSGSEarthquakes(data: any): ParsedAnomaly[] {
    if (!data.features) return [];

    return data.features.map((feature: any) => {
      const props = feature.properties;
      const coords = feature.geometry.coordinates;
      
      let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (props.mag >= 7) severity = 'critical';
      else if (props.mag >= 5) severity = 'high';
      else if (props.mag >= 3) severity = 'medium';

      return {
        title: `Earthquake M${props.mag} - ${props.place}`,
        description: `A magnitude ${props.mag} earthquake occurred at ${props.place}. Depth: ${coords[2]}km. ${props.tsunami ? 'Tsunami warning issued.' : ''}`,
        type: 'seismic',
        severity,
        latitude: coords[1],
        longitude: coords[0],
        location: props.place || 'Unknown location',
        rawData: { ...props, coordinates: coords },
        sourceType: 'USGS'
      };
    });
  }

  // Parser for NASA EONET data
  private parseEONET(data: any): ParsedAnomaly[] {
    if (!data.events) return [];

    return data.events.map((event: any) => {
      const geometry = event.geometry?.[0];
      const coords = geometry?.coordinates || [0, 0];

      let type = 'environmental';
      if (event.categories?.[0]?.title?.toLowerCase().includes('fire')) type = 'environmental';
      if (event.categories?.[0]?.title?.toLowerCase().includes('storm')) type = 'weather';
      if (event.categories?.[0]?.title?.toLowerCase().includes('volcano')) type = 'seismic';

      return {
        title: event.title,
        description: `${event.title}. Category: ${event.categories?.[0]?.title || 'Unknown'}`,
        type,
        severity: 'medium' as const,
        latitude: typeof coords[1] === 'number' ? coords[1] : 0,
        longitude: typeof coords[0] === 'number' ? coords[0] : 0,
        location: event.title,
        rawData: event,
        sourceType: 'NASA EONET'
      };
    });
  }

  // Parser for OpenWeatherMap alerts
  private parseOpenWeatherAlerts(data: any): ParsedAnomaly[] {
    if (!data.alerts) return [];

    return data.alerts.map((alert: any) => ({
      title: alert.event,
      description: alert.description || alert.event,
      type: 'weather',
      severity: alert.event.toLowerCase().includes('warning') ? 'high' : 'medium' as const,
      latitude: data.lat || 0,
      longitude: data.lon || 0,
      location: `${data.lat}, ${data.lon}`,
      rawData: alert,
      sourceType: 'OpenWeatherMap'
    }));
  }

  // Manual ingestion trigger
  async triggerManualIngestion(): Promise<{ success: boolean; count: number }> {
    await this.runIngestion();
    return { success: true, count: 0 };
  }
}
