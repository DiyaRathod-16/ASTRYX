import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import {
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  DocumentArrowDownIcon,
  MapPinIcon,
  ClockIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import { useAnomalyStore } from '../stores';
import { anomalyApi } from '../services/api';
import AnomalyMap from '../components/AnomalyMap';

export default function AnomalyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedAnomaly, loading, fetchAnomaly, approveAnomaly, rejectAnomaly } = useAnomalyStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchAnomaly(id);
    }
  }, [id, fetchAnomaly]);

  useEffect(() => {
    if (selectedAnomaly) {
      setEditedTitle(selectedAnomaly.title);
      setEditedDescription(selectedAnomaly.description);
    }
  }, [selectedAnomaly]);

  const handleApprove = async () => {
    if (id) {
      await approveAnomaly(id);
      toast.success('Anomaly approved');
    }
  };

  const handleReject = async () => {
    if (id) {
      await rejectAnomaly(id, rejectReason);
      toast.success('Anomaly rejected');
      setShowRejectModal(false);
    }
  };

  const handleSaveEdit = async () => {
    if (id) {
      try {
        await anomalyApi.update(id, {
          title: editedTitle,
          description: editedDescription,
        });
        toast.success('Anomaly updated');
        setIsEditing(false);
        fetchAnomaly(id);
      } catch (error) {
        toast.error('Failed to update anomaly');
      }
    }
  };

  const handleDownloadReport = async (format: 'json' | 'pdf') => {
    if (id) {
      try {
        const response = await anomalyApi.getReport(id, format);
        const blob = new Blob([JSON.stringify(response.data.data, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `anomaly-report-${id}.json`;
        a.click();
        toast.success('Report downloaded');
      } catch (error) {
        toast.error('Failed to generate report');
      }
    }
  };

  if (loading || !selectedAnomaly) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading anomaly details...</p>
        </div>
      </div>
    );
  }

  const anomaly = selectedAnomaly;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-400" />
          </button>
          <div>
            {isEditing ? (
              <input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="text-2xl font-bold bg-gray-700 border-gray-600 rounded-lg px-3 py-1 text-white w-full"
              />
            ) : (
              <h1 className="text-2xl font-bold text-white">{anomaly.title}</h1>
            )}
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <MapPinIcon className="w-4 h-4" />
                {anomaly.location}
              </span>
              <span className="flex items-center gap-1">
                <ClockIcon className="w-4 h-4" />
                {formatDistanceToNow(new Date(anomaly.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDownloadReport('json')}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <DocumentArrowDownIcon className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Status badges */}
      <div className="flex items-center gap-3">
        <span className={clsx(
          'badge',
          anomaly.severity === 'critical' && 'badge-critical',
          anomaly.severity === 'high' && 'badge-high',
          anomaly.severity === 'medium' && 'badge-medium',
          anomaly.severity === 'low' && 'badge-low'
        )}>
          {anomaly.severity.toUpperCase()}
        </span>
        <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm capitalize">
          {anomaly.type}
        </span>
        <span className={clsx(
          'px-3 py-1 rounded-full text-sm',
          anomaly.status === 'approved' && 'bg-green-500/20 text-green-400',
          anomaly.status === 'rejected' && 'bg-red-500/20 text-red-400',
          anomaly.status === 'pending_review' && 'bg-yellow-500/20 text-yellow-400',
          anomaly.status === 'detected' && 'bg-blue-500/20 text-blue-400'
        )}>
          {anomaly.status.replace('_', ' ')}
        </span>
        <span className="text-sm text-primary-400">
          {Math.round(anomaly.confidence * 100)}% confidence
        </span>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-6">
          {/* Description */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">Description</h3>
            {isEditing ? (
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="w-full h-32 bg-gray-700 border-gray-600 rounded-lg p-3 text-white"
              />
            ) : (
              <p className="text-gray-300">{anomaly.description}</p>
            )}
          </div>

          {/* AI Analysis */}
          {anomaly.aiAnalysis && (
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">AI Analysis</h3>
              <div className="space-y-4">
                {(anomaly.aiAnalysis as any).summary && (
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Summary</p>
                    <p className="text-gray-300">{(anomaly.aiAnalysis as any).summary}</p>
                  </div>
                )}
                {(anomaly.aiAnalysis as any).riskFactors && (
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Risk Factors</p>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                      {(anomaly.aiAnalysis as any).riskFactors.map((risk: string, i: number) => (
                        <li key={i}>{risk}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {(anomaly.aiAnalysis as any).recommendations && (
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Recommendations</p>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                      {(anomaly.aiAnalysis as any).recommendations.map((rec: string, i: number) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {anomaly.tags && anomaly.tags.length > 0 && (
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TagIcon className="w-5 h-5" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {anomaly.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Map */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">Location</h3>
            <AnomalyMap
              anomalies={[anomaly]}
              center={[anomaly.latitude, anomaly.longitude]}
              zoom={8}
              height="250px"
            />
            <p className="text-sm text-gray-400 mt-3">
              Coordinates: {anomaly.latitude.toFixed(6)}, {anomaly.longitude.toFixed(6)}
            </p>
          </div>

          {/* Actions */}
          {anomaly.status === 'pending_review' && (
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Review Actions</h3>
              <div className="flex gap-3">
                <button
                  onClick={handleApprove}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <CheckIcon className="w-5 h-5" />
                  Approve
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                  Reject
                </button>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">Details</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-400">ID</dt>
                <dd className="text-gray-300 font-mono text-xs">{anomaly.id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Source</dt>
                <dd className="text-gray-300">{anomaly.sourceType}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Created</dt>
                <dd className="text-gray-300">{format(new Date(anomaly.createdAt), 'PPpp')}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Last Updated</dt>
                <dd className="text-gray-300">{format(new Date(anomaly.updatedAt), 'PPpp')}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Reject Anomaly</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              className="w-full h-32 bg-gray-700 border-gray-600 rounded-lg p-3 text-white mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Confirm Rejection
              </button>
              <button
                onClick={() => setShowRejectModal(false)}
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
