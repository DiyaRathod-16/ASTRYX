import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '../utils/logger';

export class WebSocketService {
  private io: SocketIOServer;
  private connectedClients: Map<string, Socket> = new Map();

  constructor(io: SocketIOServer) {
    this.io = io;
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      logger.info(`Client connected: ${socket.id}`);
      this.connectedClients.set(socket.id, socket);

      // Join rooms based on client preferences
      socket.on('subscribe', (rooms: string[]) => {
        rooms.forEach(room => {
          socket.join(room);
          logger.debug(`Client ${socket.id} joined room: ${room}`);
        });
      });

      socket.on('unsubscribe', (rooms: string[]) => {
        rooms.forEach(room => {
          socket.leave(room);
          logger.debug(`Client ${socket.id} left room: ${room}`);
        });
      });

      // Handle client requesting anomaly updates
      socket.on('request_anomalies', async () => {
        socket.emit('anomalies_sync', { status: 'syncing' });
      });

      // Handle autonomous mode toggle
      socket.on('set_autonomous_mode', (enabled: boolean) => {
        process.env.AUTONOMOUS_MODE = String(enabled);
        this.broadcastSystemEvent('autonomous_mode_changed', { enabled });
        logger.info(`Autonomous mode ${enabled ? 'enabled' : 'disabled'}`);
      });

      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
        this.connectedClients.delete(socket.id);
      });

      socket.on('error', (error) => {
        logger.error(`Socket error for ${socket.id}:`, error);
      });

      // Send initial connection acknowledgment
      socket.emit('connected', {
        clientId: socket.id,
        serverTime: new Date().toISOString(),
        autonomousMode: process.env.AUTONOMOUS_MODE === 'true'
      });
    });
  }

  // Broadcast new or updated anomaly
  broadcastAnomaly(event: 'new' | 'updated' | 'deleted', anomaly: object): void {
    this.io.emit(`anomaly:${event}`, {
      type: event,
      data: anomaly,
      timestamp: new Date().toISOString()
    });
    logger.debug(`Broadcast anomaly:${event}`);
  }

  // Broadcast to specific severity room
  broadcastToSeverity(severity: string, event: string, data: object): void {
    this.io.to(`severity:${severity}`).emit(event, {
      data,
      timestamp: new Date().toISOString()
    });
  }

  // Broadcast workflow status update
  broadcastWorkflowUpdate(workflowId: string, status: object): void {
    this.io.emit('workflow:update', {
      workflowId,
      ...status,
      timestamp: new Date().toISOString()
    });
  }

  // Broadcast system event
  broadcastSystemEvent(event: string, data: object): void {
    this.io.emit(`system:${event}`, {
      event,
      data,
      timestamp: new Date().toISOString()
    });
  }

  // Send notification to all clients
  broadcastNotification(notification: {
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    message: string;
    anomalyId?: string;
  }): void {
    this.io.emit('notification', {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    });
  }

  // Send high severity alert
  broadcastAlert(anomaly: object): void {
    this.io.emit('alert:critical', {
      anomaly,
      timestamp: new Date().toISOString(),
      requiresAction: true
    });
  }

  // Get connected client count
  getConnectedClientCount(): number {
    return this.connectedClients.size;
  }

  // Send message to specific client
  sendToClient(clientId: string, event: string, data: object): boolean {
    const socket = this.connectedClients.get(clientId);
    if (socket) {
      socket.emit(event, data);
      return true;
    }
    return false;
  }
}
