import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import {
  PlayIcon,
  PauseIcon,
  PlusIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { useWorkflowStore } from '../stores';
import { workflowApi } from '../services/api';

export default function Workflows() {
  const { workflows, templates, loading, fetchWorkflows, fetchTemplates } = useWorkflowStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  useEffect(() => {
    fetchWorkflows();
    fetchTemplates();
  }, [fetchWorkflows, fetchTemplates]);

  const handleActivate = async (id: string) => {
    try {
      await workflowApi.activate(id);
      toast.success('Workflow activated');
      fetchWorkflows();
    } catch (error) {
      toast.error('Failed to activate workflow');
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await workflowApi.deactivate(id);
      toast.success('Workflow deactivated');
      fetchWorkflows();
    } catch (error) {
      toast.error('Failed to deactivate workflow');
    }
  };

  const handleExecute = async (id: string) => {
    try {
      await workflowApi.execute(id);
      toast.success('Workflow execution started');
    } catch (error) {
      toast.error('Failed to execute workflow');
    }
  };

  const handleCreateFromTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      await workflowApi.createFromTemplate(selectedTemplate);
      toast.success('Workflow created from template');
      setShowCreateModal(false);
      setSelectedTemplate('');
      fetchWorkflows();
    } catch (error) {
      toast.error('Failed to create workflow');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Workflows</h1>
          <p className="text-gray-400">Manage anomaly processing workflows</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          New Workflow
        </button>
      </div>

      {/* Workflow List */}
      <div className="grid gap-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-xl p-6 animate-pulse">
              <div className="h-5 bg-gray-700 rounded w-48 mb-2" />
              <div className="h-4 bg-gray-700 rounded w-96" />
            </div>
          ))
        ) : workflows.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700/50">
            <ArrowPathIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No workflows yet</h3>
            <p className="text-gray-400 mb-4">
              Create a workflow from a template to get started
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg"
            >
              Create Workflow
            </button>
          </div>
        ) : (
          workflows.map((workflow) => (
            <div
              key={workflow.id}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700/50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{workflow.name}</h3>
                    <span className={clsx(
                      'px-2 py-0.5 rounded text-xs font-medium',
                      workflow.status === 'active' && 'bg-green-500/20 text-green-400',
                      workflow.status === 'inactive' && 'bg-gray-500/20 text-gray-400',
                      workflow.status === 'draft' && 'bg-yellow-500/20 text-yellow-400'
                    )}>
                      {workflow.status}
                    </span>
                    <span className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-400 capitalize">
                      {workflow.type}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">{workflow.description}</p>

                  {/* Steps visualization */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {workflow.steps?.map((step: any, index: number) => (
                      <div key={step.id} className="flex items-center">
                        <span className="px-3 py-1 bg-gray-700 rounded text-xs text-gray-300">
                          {step.name}
                        </span>
                        {index < workflow.steps.length - 1 && (
                          <span className="text-gray-600 mx-1">→</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {workflow.status === 'active' ? (
                    <button
                      onClick={() => handleDeactivate(workflow.id)}
                      className="p-2 bg-gray-700 hover:bg-gray-600 text-yellow-400 rounded-lg transition-colors"
                      title="Deactivate"
                    >
                      <PauseIcon className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleActivate(workflow.id)}
                      className="p-2 bg-gray-700 hover:bg-gray-600 text-green-400 rounded-lg transition-colors"
                      title="Activate"
                    >
                      <PlayIcon className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleExecute(workflow.id)}
                    disabled={workflow.status !== 'active'}
                    className="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
                  >
                    Execute
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Templates Section */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Available Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template: any) => (
            <div
              key={template.name}
              className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
            >
              <h3 className="font-medium text-white mb-2">{template.name}</h3>
              <p className="text-sm text-gray-400 mb-4">{template.description}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{template.steps?.length || 0} steps</span>
                <span>•</span>
                <span className="capitalize">{template.type} workflow</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Create Workflow</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Select Template
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full bg-gray-700 border-gray-600 rounded-lg p-3 text-white"
                >
                  <option value="">Choose a template...</option>
                  {templates.map((t: any) => (
                    <option key={t.name} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateFromTemplate}
                disabled={!selectedTemplate}
                className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-lg"
              >
                Create Workflow
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
