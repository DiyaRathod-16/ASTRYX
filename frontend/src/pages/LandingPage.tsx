import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, Shield, Globe, Activity, Users, Brain, 
  ChevronRight, Play, ArrowRight, Eye, Radio, 
  Lock, Sparkles, Target, Cpu
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const [animatedStats, setAnimatedStats] = useState({
    agents: 0,
    consensus: 0,
    processed: 0,
    coverage: 0
  });

  const [activeDemo, setActiveDemo] = useState(0);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    // Animate stats on load
    const targetStats = { agents: 47, consensus: 94, processed: 14847, coverage: 195 };
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setAnimatedStats({
        agents: Math.floor(targetStats.agents * progress),
        consensus: Math.floor(targetStats.consensus * progress),
        processed: Math.floor(targetStats.processed * progress),
        coverage: Math.floor(targetStats.coverage * progress)
      });

      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Cycle through demo anomalies
    const interval = setInterval(() => {
      setActiveDemo(prev => (prev + 1) % demoAnomalies.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const demoAnomalies = [
    { type: 'Infrastructure', location: 'Tokyo, Japan', severity: 'critical', consensus: 94 },
    { type: 'Supply Chain', location: 'Mumbai, India', severity: 'high', consensus: 87 },
    { type: 'Climate Event', location: 'São Paulo, Brazil', severity: 'medium', consensus: 91 },
    { type: 'Cyber Threat', location: 'London, UK', severity: 'high', consensus: 89 }
  ];

  const features = [
    {
      icon: Brain,
      title: 'Multi-Modal AI Analysis',
      description: 'Powered by Gemini multimodal AI for comprehensive text, image, audio, and sensor data analysis.',
      color: 'from-purple-500 to-indigo-500'
    },
    {
      icon: Users,
      title: 'Agent Swarm Consensus',
      description: '47 specialized AI agents work together to verify and validate anomalies with collective intelligence.',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      icon: Globe,
      title: 'Global Coverage',
      description: 'Real-time monitoring across 195 regions with federated intelligence sharing.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Shield,
      title: 'Autonomous Response',
      description: 'Automated mitigation workflows powered by Opus orchestration engine.',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center space-x-3 cursor-pointer"
          >
            <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-black" />
            </div>
            <span className="text-2xl font-bold text-cyan-400">
              ASTRYX
            </span>
          </button>
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => scrollToSection('features')} className="text-gray-300 hover:text-white transition-colors">Features</button>
            <button onClick={() => scrollToSection('how-it-works')} className="text-gray-300 hover:text-white transition-colors">How It Works</button>
            <button onClick={() => scrollToSection('demo')} className="text-gray-300 hover:text-white transition-colors">Live Demo</button>
          </div>
          <Link 
            to="/dashboard"
            className="px-6 py-2 bg-cyan-500 rounded-lg text-black font-semibold hover:bg-cyan-400 transition-all flex items-center space-x-2"
          >
            <span>Enter Command Center</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-900 border border-gray-700 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-cyan-400">Powered by Gemini AI & Opus Workflows</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
              <span className="text-cyan-400">ASTRYX</span>
            </h1>
            <p className="text-xl md:text-2xl text-white mb-2">
              Autonomous System for Threat Recognition & Yielded eXecution
            </p>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-8">
              Enterprise-grade, AI-powered global monitoring with swarm intelligence consensus 
              and autonomous mitigation capabilities. Real-time. Accurate. Unstoppable.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/dashboard"
                className="px-8 py-4 bg-cyan-500 rounded-xl text-black font-bold text-lg hover:bg-cyan-400 transition-all flex items-center space-x-2"
              >
                <Play className="w-5 h-5" />
                <span>Launch Dashboard</span>
              </Link>
              <a
                href="#demo"
                className="px-8 py-4 bg-gray-900 border border-gray-600 rounded-xl text-white font-semibold text-lg hover:bg-gray-800 transition-all flex items-center space-x-2"
              >
                <Eye className="w-5 h-5" />
                <span>Watch Demo</span>
              </a>
            </div>
          </div>

          {/* Animated Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-gray-900 rounded-xl p-6 text-center border border-gray-700">
              <div className="text-4xl font-bold text-cyan-400 mb-2 tabular-nums">
                {animatedStats.agents}
              </div>
              <div className="text-gray-400">Active Agents</div>
            </div>
            <div className="bg-gray-900 rounded-xl p-6 text-center border border-gray-700">
              <div className="text-4xl font-bold text-cyan-400 mb-2 tabular-nums">
                {animatedStats.consensus}%
              </div>
              <div className="text-gray-400">Consensus Rate</div>
            </div>
            <div className="bg-gray-900 rounded-xl p-6 text-center border border-gray-700">
              <div className="text-4xl font-bold text-cyan-400 mb-2 tabular-nums">
                {animatedStats.processed.toLocaleString()}
              </div>
              <div className="text-gray-400">Anomalies Processed</div>
            </div>
            <div className="bg-gray-900 rounded-xl p-6 text-center border border-gray-700">
              <div className="text-4xl font-bold text-cyan-400 mb-2 tabular-nums">
                {animatedStats.coverage}
              </div>
              <div className="text-gray-400">Global Coverage</div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Demo Section */}
      <section id="demo" className="py-20 px-6 bg-black/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Live Anomaly Feed</h2>
            <p className="text-gray-400">Watch ASTRYX detect and analyze anomalies in real-time</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Swarm Visualization */}
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center space-x-2 mb-6">
                <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
                <span className="text-white font-semibold">Agent Swarm Activity</span>
              </div>
              <div className="grid grid-cols-8 gap-2 mb-6">
                {Array.from({ length: 32 }).map((_, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-lg ${
                      i % 3 === 0 
                        ? 'bg-green-500/60 animate-pulse' 
                        : i % 5 === 0 
                          ? 'bg-cyan-500/60' 
                          : 'bg-gray-700/60'
                    }`}
                  />
                ))}
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>32/47 agents active</span>
                <span className="text-green-400">Consensus: 91%</span>
              </div>
            </div>

            {/* Demo Anomaly Cards */}
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center space-x-2 mb-6">
                <Activity className="w-5 h-5 text-orange-400" />
                <span className="text-white font-semibold">Recent Detections</span>
              </div>
              <div className="space-y-4">
                {demoAnomalies.map((anomaly, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border transition-all duration-500 ${
                      idx === activeDemo 
                        ? 'bg-white/10 border-cyan-500/50 scale-[1.02]' 
                        : 'bg-black/30 border-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${getSeverityColor(anomaly.severity)}`} />
                        <span className="text-white font-medium">{anomaly.type}</span>
                      </div>
                      <span className="text-cyan-400 text-sm">{anomaly.consensus}% consensus</span>
                    </div>
                    <div className="text-sm text-gray-400">{anomaly.location}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Enterprise-Grade Capabilities
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              ASTRYX combines cutting-edge AI with autonomous workflows for unparalleled 
              anomaly detection and response.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-black/30 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-white/20 transition-all group"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 bg-black/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How ASTRYX Works
            </h2>
            <p className="text-gray-400">From detection to resolution in milliseconds</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: 1, icon: Eye, title: 'Detect', desc: 'Multi-modal sensors capture anomalies globally' },
              { step: 2, icon: Cpu, title: 'Analyze', desc: 'AI agents process data using swarm intelligence' },
              { step: 3, icon: Target, title: 'Verify', desc: 'Cross-modal verification ensures accuracy' },
              { step: 4, icon: Shield, title: 'Respond', desc: 'Autonomous mitigation workflows activate' }
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-sm text-cyan-400 mb-2">Step {item.step}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
                {idx < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gray-950 rounded-2xl p-12 border border-gray-700">
            <Lock className="w-12 h-12 text-cyan-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Secure Your Operations?
            </h2>
            <p className="text-gray-300 mb-8">
              Join organizations worldwide using ASTRYX for autonomous anomaly detection.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-cyan-500 rounded-xl text-black font-bold text-lg hover:bg-cyan-400 transition-all"
            >
              <span>Access Command Center</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-700 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Zap className="w-5 h-5 text-cyan-400" />
            <span className="text-white">ASTRYX 3.1</span>
          </div>
          <div className="text-gray-400 text-sm">
            © 2026 ASTRYX Autonomous Detection System. Powered by Gemini AI.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
