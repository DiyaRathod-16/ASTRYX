import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAnomalyStore, useNotificationStore } from '../stores';

const SOCKET_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';

export function useWebSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { addAnomaly, updateAnomaly, removeAnomaly, setAutonomousMode } = useAnomalyStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    // Create socket connection
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const socket = socketRef.current;

    // Connection events
    socket.on('connect', () => {
      console.log('WebSocket connected');
      toast.success('Connected to ASTRYX server');
    });

    socket.on('connected', (data) => {
      console.log('Server acknowledged connection:', data);
      setAutonomousMode(data.autonomousMode);
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      toast.error('Disconnected from server');
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    // Anomaly events
    socket.on('anomaly:new', (payload) => {
      addAnomaly(payload.data);
      
      const severity = payload.data.severity;
      if (severity === 'critical' || severity === 'high') {
        toast.error(`New ${severity} anomaly: ${payload.data.title}`, {
          duration: 6000,
        });
        
        addNotification({
          id: Date.now().toString(),
          type: severity === 'critical' ? 'error' : 'warning',
          title: `New ${severity.toUpperCase()} Anomaly`,
          message: payload.data.title,
          anomalyId: payload.data.id,
          timestamp: new Date().toISOString(),
        });
      }
    });

    socket.on('anomaly:updated', (payload) => {
      updateAnomaly(payload.data);
    });

    socket.on('anomaly:deleted', (payload) => {
      removeAnomaly(payload.data.id);
    });

    // System events
    socket.on('system:autonomous_mode_changed', (payload) => {
      setAutonomousMode(payload.data.enabled);
      toast.success(`Autonomous mode ${payload.data.enabled ? 'enabled' : 'disabled'}`);
    });

    socket.on('system:ingestion_complete', (payload) => {
      if (payload.data.count > 0) {
        toast.success(`Ingested ${payload.data.count} new data points`);
      }
    });

    // Notifications
    socket.on('notification', (notification) => {
      addNotification({
        ...notification,
        timestamp: notification.timestamp || new Date().toISOString(),
      });

      if (notification.type === 'error') {
        toast.error(notification.message);
      } else if (notification.type === 'warning') {
        toast(notification.message, { icon: '⚠️' });
      }
    });

    // Critical alerts
    socket.on('alert:critical', (payload) => {
      toast.error(`🚨 CRITICAL: ${payload.anomaly.title}`, {
        duration: 10000,
      });
      
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Critical Alert',
        message: payload.anomaly.title,
        anomalyId: payload.anomaly.id,
        timestamp: new Date().toISOString(),
      });
    });

    // Cleanup
    return () => {
      socket.disconnect();
    };
  }, [addAnomaly, updateAnomaly, removeAnomaly, setAutonomousMode, addNotification]);

  // Return socket for manual operations
  return socketRef.current;
}

// Hook for subscribing to specific rooms
export function useSocketRoom(rooms: string[]) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (socketRef.current && rooms.length > 0) {
      socketRef.current.emit('subscribe', rooms);

      return () => {
        socketRef.current?.emit('unsubscribe', rooms);
      };
    }
  }, [rooms]);
}
