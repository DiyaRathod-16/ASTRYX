import React from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, Brain, Users, Globe, Shield, Activity,
  Github, Twitter, Linkedin, Mail, ExternalLink,
  ChevronRight, Star, Code, Database
} from 'lucide-react';
import Sidebar from '../components/Sidebar';

const AboutPage: React.FC = () => {
  const features = [
    {
      icon: Brain,
      title: 'Gemini AI Integration',
      description: 'Powered by Google Gemini multimodal AI for comprehensive analysis of text, images, audio, and sensor data.'
    },
    {
      icon: Users,
      title: 'Swarm Intelligence',
      description: '47 specialized AI agents work in consensus to verify and validate anomalies with unprecedented accuracy.'
    },
    {
      icon: Globe,
      title: 'Global Coverage',
      description: 'Real-time monitoring across 195 regions with federated intelligence sharing between nodes.'
    },
    {
      icon: Shield,
      title: 'Autonomous Response',
      description: 'Opus workflow engine enables automated mitigation and response protocols without human intervention.'
    },
    {
      icon: Activity,
      title: 'Real-Time Processing',
      description: 'Sub-second detection and analysis with average response times under 5 minutes.'
    },
    {
      icon: Database,
      title: 'Federated Learning',
      description: 'Privacy-preserving intelligence sharing across global nodes without centralized data storage.'
    }
  ];

  const stats = [
    { label: 'Anomalies Detected', value: '14,847+' },
    { label: 'AI Agents', value: '47' },
    { label: 'Regions Covered', value: '195' },
    { label: 'Accuracy Rate', value: '99.2%' }
  ];

  const techStack = [
    { category: 'AI/ML', items: ['Google Gemini', 'Swarm Intelligence', 'Federated Learning'] },
    { category: 'Backend', items: ['Node.js', 'Express', 'TypeScript', 'Socket.io'] },
    { category: 'Frontend', items: ['React', 'TypeScript', 'Tailwind CSS', 'Leaflet'] },
    { category: 'Infrastructure', items: ['Docker', 'Redis', 'PostgreSQL', 'Nginx'] }
  ];

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />

      <main className="flex-1 ml-64 p-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-16 h-16 bg-cyan-500 rounded-2xl flex items-center justify-center">
              <Zap className="w-10 h-10 text-black" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            ASTRYX <span className="text-cyan-400">3.1</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Autonomous System for Threat Recognition & Yielded eXecution — powered by Gemini AI and Opus Workflow Orchestration
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-gray-950 rounded-xl p-6 border border-gray-700 text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-gray-300">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Core Capabilities</h2>
          <div className="grid grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-cyan-500/50 transition-all">
                <feature.icon className="w-10 h-10 text-cyan-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Technology Stack</h2>
          <div className="grid grid-cols-4 gap-6">
            {techStack.map((tech, idx) => (
              <div key={idx} className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-center space-x-2 mb-4">
                  <Code className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">{tech.category}</h3>
                </div>
                <div className="space-y-2">
                  {tech.items.map((item, iidx) => (
                    <div key={iidx} className="flex items-center space-x-2">
                      <Star className="w-3 h-3 text-cyan-400" />
                      <span className="text-sm text-gray-400">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Architecture */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-8 border border-white/10 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">System Architecture</h2>
          <div className="grid grid-cols-4 gap-4">
            {[
              { step: 1, title: 'Data Ingestion', desc: 'Multi-modal sensors capture global data streams', color: 'from-cyan-500 to-blue-500' },
              { step: 2, title: 'AI Analysis', desc: 'Gemini processes data through specialized agents', color: 'from-blue-500 to-purple-500' },
              { step: 3, title: 'Swarm Consensus', desc: '47 agents vote to verify anomaly detection', color: 'from-purple-500 to-pink-500' },
              { step: 4, title: 'Autonomous Response', desc: 'Opus workflows trigger mitigation protocols', color: 'from-pink-500 to-red-500' }
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="bg-black/40 rounded-xl p-5 border border-white/10">
                  <div className={`w-10 h-10 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center mb-3`}>
                    <span className="text-white font-bold">{item.step}</span>
                  </div>
                  <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
                {idx < 3 && (
                  <ChevronRight className="absolute top-1/2 -right-3 transform -translate-y-1/2 w-6 h-6 text-gray-600" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Version Info */}
        <div className="grid grid-cols-2 gap-6 mb-12">
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Version Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Version</span>
                <span className="text-white">3.1.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Build</span>
                <span className="text-white">2026.01.06</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">AI Model</span>
                <span className="text-white">Gemini 2.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Workflow Engine</span>
                <span className="text-white">Opus 1.5</span>
              </div>
            </div>
          </div>

          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <div className="space-y-3">
              <a href="#" className="flex items-center justify-between p-3 bg-black/30 rounded-lg hover:bg-black/50 transition-all">
                <div className="flex items-center space-x-3">
                  <Github className="w-5 h-5 text-gray-400" />
                  <span className="text-white">GitHub Repository</span>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
              <a href="#" className="flex items-center justify-between p-3 bg-black/30 rounded-lg hover:bg-black/50 transition-all">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <span className="text-white">Documentation</span>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
              <a href="#" className="flex items-center justify-between p-3 bg-black/30 rounded-lg hover:bg-black/50 transition-all">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-white">Contact Support</span>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8 border-t border-white/10">
          <div className="flex items-center justify-center space-x-6 mb-4">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
          <p className="text-gray-500 text-sm">
            © 2026 ASTRYX Autonomous Detection System. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs mt-2">
            Powered by Gemini AI & Opus Workflow Engine
          </p>
        </div>
      </main>
    </div>
  );
};

// Add missing import
const FileText = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

export default AboutPage;
