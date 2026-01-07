import React, { useState, useEffect } from 'react';
import {
  Settings, User, Bell, Shield, Database, Globe,
  Moon, Sun, Lock, Key, Mail, Smartphone, Save,
  RefreshCw, Trash2, Download, Upload, Cpu, Eye, EyeOff,
  CheckCircle, XCircle, Loader2, ExternalLink, Sparkles
} from 'lucide-react';
import Sidebar from '../components/Sidebar';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'notifications' | 'security' | 'data' | 'integrations'>('general');
  const [settings, setSettings] = useState({
    // General
    theme: 'dark',
    language: 'en',
    timezone: 'UTC',
    autoRefresh: true,
    refreshInterval: 30,
    
    // AI Settings
    geminiApiKey: '',
    aiModel: 'gemini-1.5-pro',
    enableAI: true,
    autoAnalysis: true,
    
    // Notifications
    emailAlerts: true,
    smsAlerts: true,
    pushNotifications: true,
    criticalOnly: false,
    digestFrequency: 'realtime',
    
    // Security
    twoFactorAuth: true,
    sessionTimeout: 60,
    ipWhitelist: '',
    
    // Data
    retentionPeriod: 90,
    autoBackup: true,
    backupFrequency: 'daily'
  });

  const [saved, setSaved] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [testingApi, setTestingApi] = useState(false);
  const [apiStatus, setApiStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Load saved API key from localStorage on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
      setSettings(prev => ({ ...prev, geminiApiKey: savedApiKey }));
    }
  }, []);

  const handleSave = () => {
    // Save API key to localStorage
    if (settings.geminiApiKey) {
      localStorage.setItem('gemini_api_key', settings.geminiApiKey);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const testApiConnection = async () => {
    if (!settings.geminiApiKey) {
      setApiStatus('error');
      return;
    }
    
    setTestingApi(true);
    setApiStatus('idle');
    
    try {
      // Test the API key by making a simple request
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${settings.geminiApiKey}`);
      if (response.ok) {
        setApiStatus('success');
      } else {
        setApiStatus('error');
      }
    } catch (error) {
      setApiStatus('error');
    }
    
    setTestingApi(false);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'ai', label: 'AI & API', icon: Cpu },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'data', label: 'Data Management', icon: Database },
    { id: 'integrations', label: 'Integrations', icon: Globe }
  ];

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />

      <main className="flex-1 ml-0 lg:ml-64 px-3 lg:px-8 pt-[60px] lg:pt-8 pb-[72px] lg:pb-8 overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 lg:mb-8 gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 lg:mb-2">Settings</h1>
            <p className="text-xs sm:text-sm text-gray-400">Configure your ASTRYX preferences</p>
          </div>
          <button
            onClick={handleSave}
            className={`flex items-center justify-center space-x-2 px-4 lg:px-6 py-2 rounded-lg transition-all text-sm lg:text-base ${
              saved 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
            }`}
          >
            {saved ? (
              <>
                <Save className="w-4 h-4" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Tabs - Horizontal scroll on mobile */}
          <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 lg:space-y-2 -mx-3 px-3 lg:mx-0 lg:px-0 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-shrink-0 flex items-center space-x-2 lg:space-x-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-cyan-500/20 text-cyan-400' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-4 lg:w-5 h-4 lg:h-5" />
                <span className="text-sm lg:text-base">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === 'general' && (
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 lg:p-6 border border-white/10 space-y-4 lg:space-y-6">
                <h3 className="text-base lg:text-lg font-semibold text-white mb-3 lg:mb-4">General Settings</h3>
                
                {/* Theme */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 lg:p-4 bg-black/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {settings.theme === 'dark' ? <Moon className="w-4 lg:w-5 h-4 lg:h-5 text-purple-400" /> : <Sun className="w-4 lg:w-5 h-4 lg:h-5 text-yellow-400" />}
                    <div>
                      <div className="text-sm lg:text-base text-white font-medium">Theme</div>
                      <div className="text-xs lg:text-sm text-gray-500">Choose your preferred theme</div>
                    </div>
                  </div>
                  <select
                    value={settings.theme}
                    onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value }))}
                    className="w-full sm:w-auto bg-black/30 text-white px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg border border-white/10 text-sm"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="system">System</option>
                  </select>
                </div>

                {/* Language */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 lg:p-4 bg-black/30 rounded-lg">
                  <div>
                    <div className="text-sm lg:text-base text-white font-medium">Language</div>
                    <div className="text-xs lg:text-sm text-gray-500">Select interface language</div>
                  </div>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full sm:w-auto bg-black/30 text-white px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg border border-white/10 text-sm"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="ja">Japanese</option>
                  </select>
                </div>

                {/* Timezone */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 lg:p-4 bg-black/30 rounded-lg">
                  <div>
                    <div className="text-sm lg:text-base text-white font-medium">Timezone</div>
                    <div className="text-xs lg:text-sm text-gray-500">Set your local timezone</div>
                  </div>
                  <select
                    value={settings.timezone}
                    onChange={(e) => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
                    className="w-full sm:w-auto bg-black/30 text-white px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg border border-white/10 text-sm"
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">EST (UTC-5)</option>
                    <option value="PST">PST (UTC-8)</option>
                    <option value="GMT">GMT</option>
                    <option value="IST">IST (UTC+5:30)</option>
                    <option value="JST">JST (UTC+9)</option>
                  </select>
                </div>

                {/* Auto Refresh */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 lg:p-4 bg-black/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <RefreshCw className="w-4 lg:w-5 h-4 lg:h-5 text-cyan-400" />
                    <div>
                      <div className="text-sm lg:text-base text-white font-medium">Auto Refresh</div>
                      <div className="text-xs lg:text-sm text-gray-500">Automatically refresh dashboard data</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      value={settings.refreshInterval}
                      onChange={(e) => setSettings(prev => ({ ...prev, refreshInterval: parseInt(e.target.value) }))}
                      className="w-16 bg-black/30 text-white px-2 py-1.5 rounded-lg border border-white/10 text-center text-sm"
                      min={5}
                      max={300}
                    />
                    <span className="text-gray-400 text-xs">seconds</span>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, autoRefresh: !prev.autoRefresh }))}
                      className={`w-10 h-5 rounded-full transition-all flex-shrink-0 ${settings.autoRefresh ? 'bg-cyan-500' : 'bg-gray-600'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-all ${settings.autoRefresh ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-6">
                {/* Gemini API Configuration */}
                <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Gemini AI Configuration</h3>
                    <a 
                      href="https://aistudio.google.com/apikey" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      <span>Get API Key</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  
                  {/* How to get API Key */}
                  <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-cyan-400 mt-0.5" />
                      <div>
                        <h4 className="text-white font-medium mb-2">How to get your Gemini API Key:</h4>
                        <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
                          <li>Visit <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Google AI Studio</a></li>
                          <li>Sign in with your Google account</li>
                          <li>Click "Create API Key"</li>
                          <li>Copy the key and paste it below</li>
                        </ol>
                        <p className="text-xs text-gray-500 mt-2">Note: Free tier includes 60 requests/minute. For production, consider upgrading.</p>
                      </div>
                    </div>
                  </div>

                  {/* API Key Input */}
                  <div className="p-4 bg-black/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Key className="w-4 h-4 text-yellow-400" />
                        <span className="text-white font-medium">API Key</span>
                      </div>
                      {apiStatus === 'success' && (
                        <span className="flex items-center gap-1 text-xs text-green-400">
                          <CheckCircle className="w-3 h-3" /> Connected
                        </span>
                      )}
                      {apiStatus === 'error' && (
                        <span className="flex items-center gap-1 text-xs text-red-400">
                          <XCircle className="w-3 h-3" /> Invalid Key
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          type={showApiKey ? 'text' : 'password'}
                          value={settings.geminiApiKey}
                          onChange={(e) => setSettings(prev => ({ ...prev, geminiApiKey: e.target.value }))}
                          placeholder="AIza..."
                          className="w-full bg-black/50 text-white px-4 py-3 pr-12 rounded-lg border border-white/10 focus:border-cyan-500/50 focus:outline-none font-mono text-sm"
                        />
                        <button
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <button
                        onClick={testApiConnection}
                        disabled={testingApi || !settings.geminiApiKey}
                        className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {testingApi ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                        <span>Test</span>
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Your API key is stored locally and never sent to our servers.</p>
                  </div>

                  {/* AI Model Selection */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 lg:p-4 bg-black/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Cpu className="w-5 h-5 text-purple-400" />
                      <div>
                        <div className="text-white font-medium">AI Model</div>
                        <div className="text-sm text-gray-500">Select Gemini model version</div>
                      </div>
                    </div>
                    <select
                      value={settings.aiModel}
                      onChange={(e) => setSettings(prev => ({ ...prev, aiModel: e.target.value }))}
                      className="w-full sm:w-auto bg-black/50 text-white px-3 py-1.5 rounded-lg border border-white/10 text-sm"
                    >
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro (Recommended)</option>
                      <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast)</option>
                      <option value="gemini-pro">Gemini Pro</option>
                      <option value="gemini-pro-vision">Gemini Pro Vision</option>
                    </select>
                  </div>
                </div>

                {/* AI Features */}
                <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10 space-y-6">
                  <h3 className="text-lg font-semibold text-white">AI Features</h3>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 lg:p-4 bg-black/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Sparkles className="w-5 h-5 text-cyan-400" />
                      <div>
                        <div className="text-white font-medium">Enable AI Analysis</div>
                        <div className="text-sm text-gray-500">Use Gemini AI for anomaly analysis</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, enableAI: !prev.enableAI }))}
                      className={`w-10 h-5 rounded-full flex-shrink-0 transition-all ${settings.enableAI ? 'bg-cyan-500' : 'bg-gray-600'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-all ${settings.enableAI ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 lg:p-4 bg-black/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <RefreshCw className="w-5 h-5 text-green-400" />
                      <div>
                        <div className="text-white font-medium">Auto Analysis</div>
                        <div className="text-sm text-gray-500">Automatically analyze new anomalies</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, autoAnalysis: !prev.autoAnalysis }))}
                      className={`w-10 h-5 rounded-full flex-shrink-0 transition-all ${settings.autoAnalysis ? 'bg-green-500' : 'bg-gray-600'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-all ${settings.autoAnalysis ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                </div>

                {/* API Usage Info */}
                <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">API Capabilities</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Text Analysis', desc: 'Analyze text-based anomalies', enabled: true },
                      { label: 'Image Analysis', desc: 'Analyze images & visual data', enabled: true },
                      { label: 'Audio Analysis', desc: 'Process audio inputs', enabled: true },
                      { label: 'Multimodal', desc: 'Combined analysis modes', enabled: true }
                    ].map((cap, idx) => (
                      <div key={idx} className="p-3 bg-black/30 rounded-lg flex items-center justify-between">
                        <div>
                          <div className="text-sm text-white font-medium">{cap.label}</div>
                          <div className="text-xs text-gray-500">{cap.desc}</div>
                        </div>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10 space-y-6">
                <h3 className="text-lg font-semibold text-white mb-4">Notification Preferences</h3>
                
                {[
                  { key: 'emailAlerts', icon: Mail, label: 'Email Alerts', desc: 'Receive alerts via email' },
                  { key: 'smsAlerts', icon: Smartphone, label: 'SMS Alerts', desc: 'Receive alerts via SMS' },
                  { key: 'pushNotifications', icon: Bell, label: 'Push Notifications', desc: 'Browser push notifications' },
                  { key: 'criticalOnly', icon: Shield, label: 'Critical Only', desc: 'Only notify for critical alerts' }
                ].map((item) => (
                  <div key={item.key} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 lg:p-4 bg-black/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-white font-medium">{item.label}</div>
                        <div className="text-sm text-gray-500">{item.desc}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                      className={`w-10 h-5 rounded-full flex-shrink-0 transition-all ${
                        settings[item.key as keyof typeof settings] ? 'bg-cyan-500' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-all ${
                        settings[item.key as keyof typeof settings] ? 'translate-x-5' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                ))}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 lg:p-4 bg-black/30 rounded-lg">
                  <div>
                    <div className="text-white font-medium">Digest Frequency</div>
                    <div className="text-sm text-gray-500">How often to receive summary emails</div>
                  </div>
                  <select
                    value={settings.digestFrequency}
                    onChange={(e) => setSettings(prev => ({ ...prev, digestFrequency: e.target.value }))}
                    className="bg-black/30 text-white px-4 py-2 rounded-lg border border-white/10"
                  >
                    <option value="realtime">Real-time</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10 space-y-6">
                <h3 className="text-lg font-semibold text-white mb-4">Security Settings</h3>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 lg:p-4 bg-black/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Key className="w-5 h-5 text-green-400" />
                    <div>
                      <div className="text-white font-medium">Two-Factor Authentication</div>
                      <div className="text-sm text-gray-500">Add an extra layer of security</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, twoFactorAuth: !prev.twoFactorAuth }))}
                    className={`w-10 h-5 rounded-full flex-shrink-0 transition-all ${settings.twoFactorAuth ? 'bg-green-500' : 'bg-gray-600'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-all ${settings.twoFactorAuth ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 lg:p-4 bg-black/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Lock className="w-5 h-5 text-purple-400" />
                    <div>
                      <div className="text-white font-medium">Session Timeout</div>
                      <div className="text-sm text-gray-500">Auto-logout after inactivity</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                      className="w-20 bg-black/30 text-white px-3 py-2 rounded-lg border border-white/10 text-center"
                      min={5}
                      max={480}
                    />
                    <span className="text-gray-400 text-sm">minutes</span>
                  </div>
                </div>

                <div className="p-4 bg-black/30 rounded-lg">
                  <div className="mb-3">
                    <div className="text-white font-medium">IP Whitelist</div>
                    <div className="text-sm text-gray-500">Restrict access to specific IPs (one per line)</div>
                  </div>
                  <textarea
                    value={settings.ipWhitelist}
                    onChange={(e) => setSettings(prev => ({ ...prev, ipWhitelist: e.target.value }))}
                    placeholder="192.168.1.1&#10;10.0.0.0/24"
                    rows={3}
                    className="w-full bg-black/30 text-white px-4 py-2 rounded-lg border border-white/10 resize-none"
                  />
                </div>

                <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all">
                  <Trash2 className="w-4 h-4" />
                  <span>Revoke All Sessions</span>
                </button>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10 space-y-6">
                <h3 className="text-lg font-semibold text-white mb-4">Data Management</h3>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 lg:p-4 bg-black/30 rounded-lg">
                  <div>
                    <div className="text-white font-medium">Data Retention</div>
                    <div className="text-sm text-gray-500">How long to keep historical data</div>
                  </div>
                  <select
                    value={settings.retentionPeriod}
                    onChange={(e) => setSettings(prev => ({ ...prev, retentionPeriod: parseInt(e.target.value) }))}
                    className="bg-black/30 text-white px-4 py-2 rounded-lg border border-white/10"
                  >
                    <option value={30}>30 days</option>
                    <option value={90}>90 days</option>
                    <option value={180}>180 days</option>
                    <option value={365}>1 year</option>
                    <option value={-1}>Forever</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 lg:p-4 bg-black/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Database className="w-5 h-5 text-cyan-400" />
                    <div>
                      <div className="text-white font-medium">Auto Backup</div>
                      <div className="text-sm text-gray-500">Automatically backup data</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, autoBackup: !prev.autoBackup }))}
                    className={`w-10 h-5 rounded-full flex-shrink-0 transition-all ${settings.autoBackup ? 'bg-cyan-500' : 'bg-gray-600'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-all ${settings.autoBackup ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-all">
                    <Download className="w-4 h-4" />
                    <span>Export Data</span>
                  </button>
                  <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all">
                    <Upload className="w-4 h-4" />
                    <span>Import Data</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'integrations' && (
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10 space-y-6">
                <h3 className="text-lg font-semibold text-white mb-4">Integrations</h3>
                
                {[
                  { name: 'Slack', status: 'connected', color: 'bg-green-500/20 text-green-400' },
                  { name: 'Microsoft Teams', status: 'not connected', color: 'bg-gray-500/20 text-gray-400' },
                  { name: 'PagerDuty', status: 'connected', color: 'bg-green-500/20 text-green-400' },
                  { name: 'Jira', status: 'not connected', color: 'bg-gray-500/20 text-gray-400' },
                  { name: 'ServiceNow', status: 'not connected', color: 'bg-gray-500/20 text-gray-400' }
                ].map((integration, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 lg:p-4 bg-black/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                        <Globe className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium">{integration.name}</div>
                        <div className={`text-xs ${integration.color}`}>{integration.status}</div>
                      </div>
                    </div>
                    <button className={`px-4 py-2 rounded-lg text-sm ${
                      integration.status === 'connected' 
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                        : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                    }`}>
                      {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
