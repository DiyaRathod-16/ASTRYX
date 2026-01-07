import React, { useState } from 'react';
import { Shield, CheckCircle, Clock, AlertTriangle, ChevronRight, Target } from 'lucide-react';

interface MitigationStep {
  id: string;
  action: string;
  status: 'completed' | 'in-progress' | 'pending';
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
  assignedTo?: string;
}

interface MitigationPlan {
  anomalyId: string;
  title: string;
  severity: string;
  steps: MitigationStep[];
  overallProgress: number;
}

const MitigationPlanner: React.FC = () => {
  const [plans] = useState<MitigationPlan[]>([
    {
      anomalyId: 'ANM-001',
      title: 'Infrastructure Disruption - Tokyo',
      severity: 'critical',
      overallProgress: 45,
      steps: [
        { id: '1', action: 'Isolate affected systems', status: 'completed', priority: 'high', estimatedTime: '15m' },
        { id: '2', action: 'Deploy backup resources', status: 'completed', priority: 'high', estimatedTime: '30m' },
        { id: '3', action: 'Notify stakeholders', status: 'in-progress', priority: 'medium', estimatedTime: '10m' },
        { id: '4', action: 'Root cause analysis', status: 'pending', priority: 'medium', estimatedTime: '2h' },
        { id: '5', action: 'Implement permanent fix', status: 'pending', priority: 'high', estimatedTime: '4h' }
      ]
    },
    {
      anomalyId: 'ANM-002',
      title: 'Supply Chain Alert - Mumbai',
      severity: 'high',
      overallProgress: 20,
      steps: [
        { id: '1', action: 'Verify supply status', status: 'completed', priority: 'high', estimatedTime: '20m' },
        { id: '2', action: 'Contact alternate suppliers', status: 'in-progress', priority: 'high', estimatedTime: '1h' },
        { id: '3', action: 'Adjust inventory forecast', status: 'pending', priority: 'medium', estimatedTime: '45m' },
        { id: '4', action: 'Update logistics routes', status: 'pending', priority: 'low', estimatedTime: '2h' }
      ]
    }
  ]);

  const [expandedPlan, setExpandedPlan] = useState<string | null>('ANM-001');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'in-progress': return <Clock className="w-4 h-4 text-yellow-400 animate-pulse" />;
      default: return <div className="w-4 h-4 rounded-full border-2 border-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-blue-400 bg-blue-500/20';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Shield className="w-6 h-6 text-cyan-400" />
          <h3 className="text-xl font-semibold text-white">Mitigation Planner</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Target className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">{plans.length} active plans</span>
        </div>
      </div>

      <div className="space-y-4">
        {plans.map((plan) => (
          <div key={plan.anomalyId} className="bg-black/30 rounded-lg border border-white/5 overflow-hidden">
            {/* Plan Header */}
            <div
              className="p-4 cursor-pointer hover:bg-white/5 transition-all"
              onClick={() => setExpandedPlan(expandedPlan === plan.anomalyId ? null : plan.anomalyId)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ChevronRight 
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      expandedPlan === plan.anomalyId ? 'rotate-90' : ''
                    }`} 
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-semibold">{plan.title}</span>
                      <span className={`px-2 py-0.5 text-xs rounded border ${getSeverityColor(plan.severity)}`}>
                        {plan.severity}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{plan.anomalyId}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">{plan.overallProgress}%</div>
                    <div className="text-xs text-gray-500">complete</div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${plan.overallProgress}%` }}
                />
              </div>
            </div>

            {/* Expanded Steps */}
            {expandedPlan === plan.anomalyId && (
              <div className="px-4 pb-4 space-y-2">
                {plan.steps.map((step, idx) => (
                  <div 
                    key={step.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      step.status === 'in-progress' 
                        ? 'bg-yellow-500/10 border border-yellow-500/30' 
                        : 'bg-black/20'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(step.status)}
                      <span className={`text-sm ${
                        step.status === 'completed' ? 'text-gray-500 line-through' : 'text-white'
                      }`}>
                        {idx + 1}. {step.action}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-0.5 text-xs rounded ${getPriorityColor(step.priority)}`}>
                        {step.priority}
                      </span>
                      <span className="text-xs text-gray-500">{step.estimatedTime}</span>
                    </div>
                  </div>
                ))}

                {/* Action Buttons */}
                <div className="flex space-x-2 mt-4 pt-3 border-t border-white/5">
                  <button className="flex-1 px-3 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/30 transition-all">
                    Update Progress
                  </button>
                  <button className="flex-1 px-3 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-sm hover:bg-purple-500/30 transition-all">
                    Add Step
                  </button>
                  <button className="px-3 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition-all">
                    <CheckCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-6 grid grid-cols-4 gap-3">
        <div className="bg-green-500/10 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-green-400">12</div>
          <div className="text-xs text-gray-400">Completed</div>
        </div>
        <div className="bg-yellow-500/10 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-yellow-400">5</div>
          <div className="text-xs text-gray-400">In Progress</div>
        </div>
        <div className="bg-gray-500/10 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-gray-400">8</div>
          <div className="text-xs text-gray-400">Pending</div>
        </div>
        <div className="bg-red-500/10 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-red-400">2</div>
          <div className="text-xs text-gray-400">Blocked</div>
        </div>
      </div>
    </div>
  );
};

export default MitigationPlanner;
