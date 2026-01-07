import React, { useState, useEffect } from 'react';
import {
  Bell, Mail, MessageSquare, Smartphone, Slack,
  CheckCircle, Clock, AlertTriangle, Filter,
  Settings, Volume2, VolumeX, ChevronRight
} from 'lucide-react';
import Sidebar from '../components/Sidebar';

interface AlertNotification {
  id: string;
  type: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  channels: string[];
  anomalyId?: string;
}

const AlertsDeliveryPage: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertNotification[]>([
    {
      id: 'alert-001',
      type: 'critical',
      title: 'Critical Infrastructure Anomaly',
      message: 'Detected critical infrastructure disruption in Tokyo region. Swarm consensus: 94%',
      timestamp: '2 minutes ago',
      read: false,
      channels: ['email', 'sms', 'slack'],
      anomalyId: 'ANM-001'
    },
    {
      id: 'alert-002',
      type: 'high',
      title: 'Supply Chain Disruption',
      message: 'High-priority supply chain anomaly detected in Mumbai. Immediate review recommended.',
      timestamp: '15 minutes ago',
      read: false,
      channels: ['email', 'slack'],
      anomalyId: 'ANM-002'
    },
    {
      id: 'alert-003',
      type: 'medium',
      title: 'Climate Event Warning',
      message: 'Medium severity climate-related anomaly flagged in São Paulo region.',
      timestamp: '1 hour ago',
      read: true,
      channels: ['email'],
      anomalyId: 'ANM-003'
    },
    {
      id: 'alert-004',
      type: 'low',
      title: 'Routine Pattern Detected',
      message: 'Low-priority pattern variation noted in European sensor network.',
      timestamp: '3 hours ago',
      read: true,
      channels: ['dashboard'],
      anomalyId: 'ANM-004'
    }
  ]);

  const [filter, setFilter] = useState<string>('all');
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    sms: true,
    slack: true,
    push: true,
    sound: true
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'sms': return <Smartphone className="w-4 h-4" />;
      case 'slack': return <Slack className="w-4 h-4" />;
      case 'push': return <Bell className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const markAsRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  };

  const markAllAsRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  };

  const filteredAlerts = filter === 'all' 
    ? alerts 
    : filter === 'unread' 
      ? alerts.filter(a => !a.read)
      : alerts.filter(a => a.type === filter);

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />

      <main className="flex-1 ml-0 lg:ml-64 px-3 lg:px-8 pt-[60px] lg:pt-8 pb-[72px] lg:pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Alerts & Notifications</h1>
            <p className="text-gray-400">Manage alert delivery and notification preferences</p>
          </div>
          <div className="flex items-center space-x-3">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center space-x-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Mark All Read</span>
              </button>
            )}
            <button className="p-2 bg-black/30 rounded-lg hover:bg-black/50 transition-all">
              <Settings className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Alerts List */}
          <div className="col-span-2 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="text-2xl font-bold text-white">{alerts.length}</div>
                <div className="text-sm text-gray-400">Total Alerts</div>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <div className="text-2xl font-bold text-red-400">
                  {alerts.filter(a => a.type === 'critical').length}
                </div>
                <div className="text-sm text-gray-400">Critical</div>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                <div className="text-2xl font-bold text-orange-400">
                  {alerts.filter(a => a.type === 'high').length}
                </div>
                <div className="text-sm text-gray-400">High</div>
              </div>
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                <div className="text-2xl font-bold text-cyan-400">{unreadCount}</div>
                <div className="text-sm text-gray-400">Unread</div>
              </div>
            </div>

            {/* Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              {['all', 'unread', 'critical', 'high', 'medium', 'low'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-lg text-sm transition-all ${
                    filter === f 
                      ? 'bg-cyan-500/20 text-cyan-400' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Alerts */}
            <div className="space-y-3">
              {filteredAlerts.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No alerts to display</p>
                </div>
              ) : (
                filteredAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => markAsRead(alert.id)}
                    className={`bg-black/30 backdrop-blur-sm rounded-xl p-5 border transition-all cursor-pointer hover:border-cyan-500/50 ${
                      alert.read ? 'border-white/10' : 'border-cyan-500/30 bg-cyan-500/5'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`px-2 py-1 text-xs rounded border font-semibold ${getTypeColor(alert.type)}`}>
                            {alert.type.toUpperCase()}
                          </span>
                          {!alert.read && (
                            <span className="w-2 h-2 rounded-full bg-cyan-400" />
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-1">{alert.title}</h3>
                        <p className="text-sm text-gray-400 mb-3">{alert.message}</p>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{alert.timestamp}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {alert.channels.map((channel, idx) => (
                              <span key={idx} className="text-gray-500">
                                {getChannelIcon(channel)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Settings Panel */}
          <div className="space-y-6">
            {/* Notification Channels */}
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Notification Channels</h3>
              <div className="space-y-4">
                {[
                  { key: 'email', icon: Mail, label: 'Email Notifications' },
                  { key: 'sms', icon: Smartphone, label: 'SMS Alerts' },
                  { key: 'slack', icon: Slack, label: 'Slack Integration' },
                  { key: 'push', icon: Bell, label: 'Push Notifications' }
                ].map((channel) => (
                  <div key={channel.key} className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <channel.icon className="w-5 h-5 text-gray-400" />
                      <span className="text-white">{channel.label}</span>
                    </div>
                    <button
                      onClick={() => setNotificationSettings(prev => ({
                        ...prev,
                        [channel.key]: !prev[channel.key as keyof typeof prev]
                      }))}
                      className={`w-12 h-6 rounded-full transition-all ${
                        notificationSettings[channel.key as keyof typeof notificationSettings]
                          ? 'bg-cyan-500'
                          : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-all ${
                        notificationSettings[channel.key as keyof typeof notificationSettings]
                          ? 'translate-x-6'
                          : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Sound Settings */}
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Sound Settings</h3>
              <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  {notificationSettings.sound ? (
                    <Volume2 className="w-5 h-5 text-cyan-400" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-gray-400" />
                  )}
                  <span className="text-white">Alert Sounds</span>
                </div>
                <button
                  onClick={() => setNotificationSettings(prev => ({ ...prev, sound: !prev.sound }))}
                  className={`w-12 h-6 rounded-full transition-all ${
                    notificationSettings.sound ? 'bg-cyan-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-all ${
                    notificationSettings.sound ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>

            {/* Alert Rules */}
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Alert Rules</h3>
              <div className="space-y-3">
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="text-sm font-medium text-red-400">Critical Alerts</div>
                  <div className="text-xs text-gray-500">All channels, immediate</div>
                </div>
                <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                  <div className="text-sm font-medium text-orange-400">High Priority</div>
                  <div className="text-xs text-gray-500">Email + Slack, within 5m</div>
                </div>
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="text-sm font-medium text-yellow-400">Medium Priority</div>
                  <div className="text-xs text-gray-500">Email only, batched hourly</div>
                </div>
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="text-sm font-medium text-green-400">Low Priority</div>
                  <div className="text-xs text-gray-500">Dashboard only</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AlertsDeliveryPage;
