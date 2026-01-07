import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Upload, FileText, Image, Mic, Radio, 
  CheckCircle, AlertTriangle, X, Loader2,
  MapPin, Tag, FileType, Brain, Sparkles, Shield, Settings
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { apiService } from '../services/apiService';
import { geminiService, GeminiAnalysisResult } from '../services/geminiService';

interface UploadedFile {
  file: File;
  preview?: string;
  type: 'text' | 'image' | 'audio' | 'sensor';
}

interface AIAnalysis {
  summary: string;
  anomalyType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  detectedElements: string[];
  potentialThreats: string[];
  recommendations: string[];
  location?: string;
}

const AnomalyUploadEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'analyzing' | 'analyzed' | 'success' | 'error'>('idle');
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    severity: 'medium',
    tags: ''
  });

  const getFileType = (file: File): 'text' | 'image' | 'audio' | 'sensor' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.includes('json') || file.type.includes('csv')) return 'sensor';
    return 'text';
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files).map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      type: getFileType(file)
    }));
    
    setFiles(prev => [...prev, ...droppedFiles]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).map(file => ({
        file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        type: getFileType(file)
      }));
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Analyze with Gemini AI
  const handleAnalyze = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadStatus('analyzing');
    setAiError(null);
    setUploadProgress(10);

    try {
      // Check if API key is configured
      if (!geminiService.isConfigured()) {
        setAiError('Gemini API key not configured. Please add your API key in Settings > AI & API.');
        setUploadStatus('idle');
        setUploading(false);
        return;
      }

      // Find all image files
      const imageFiles = files.filter(f => f.type === 'image');
      let result: GeminiAnalysisResult;

      if (imageFiles.length > 0) {
        // Analyze the selected image
        const imageToAnalyze = imageFiles[selectedImageIndex] || imageFiles[0];
        setUploadProgress(30);
        result = await geminiService.analyzeImage(imageToAnalyze.file);
        
        // If multiple images, add note to summary
        if (imageFiles.length > 1 && result.success && result.analysis) {
          result.analysis.summary = `[Image ${selectedImageIndex + 1} of ${imageFiles.length}: ${imageToAnalyze.file.name}] ` + result.analysis.summary;
        }
      } else {
        // If no image, try text analysis with file content
        setUploadProgress(30);
        const textFile = files[0];
        const text = await textFile.file.text();
        result = await geminiService.analyzeText(text);
      }

      setUploadProgress(100);

      if (result.success && result.analysis) {
        setAiAnalysis(result.analysis);
        // Auto-fill form with AI analysis
        setFormData(prev => ({
          ...prev,
          title: prev.title || `${result.analysis!.anomalyType} Anomaly Detected`,
          description: prev.description || result.analysis!.summary,
          severity: result.analysis!.severity,
          location: prev.location || result.analysis!.location || '',
          tags: prev.tags || result.analysis!.detectedElements.slice(0, 3).join(', ')
        }));
        setUploadStatus('analyzed');
      } else {
        setAiError(result.error || 'Analysis failed');
        setUploadStatus('idle');
      }
    } catch (error: any) {
      console.error('Analysis failed:', error);
      setAiError(error.message || 'Analysis failed');
      setUploadStatus('idle');
    }

    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;

    setUploading(true);
    setUploadStatus('uploading');

    try {
      // Upload files
      const formDataObj = new FormData();
      files.forEach(({ file }) => {
        formDataObj.append('files', file);
      });
      formDataObj.append('title', formData.title);
      formDataObj.append('description', formData.description);
      formDataObj.append('location', formData.location);
      formDataObj.append('severity', formData.severity);
      formDataObj.append('tags', formData.tags);
      if (aiAnalysis) {
        formDataObj.append('aiAnalysis', JSON.stringify(aiAnalysis));
      }

      for (let i = 0; i <= 100; i += 20) {
        setUploadProgress(i);
        await new Promise(r => setTimeout(r, 200));
      }

      await apiService.uploadFile(formDataObj);

      setUploadStatus('success');
      setTimeout(() => {
        navigate('/incidents');
      }, 2000);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('error');
    }

    setUploading(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-5 h-5 text-purple-400" />;
      case 'audio': return <Mic className="w-5 h-5 text-green-400" />;
      case 'sensor': return <Radio className="w-5 h-5 text-cyan-400" />;
      default: return <FileText className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      
      <main className="flex-1 ml-0 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Upload Anomaly Data</h1>
            <p className="text-gray-400">Submit multi-modal data for AI analysis and swarm verification</p>
          </div>

          {uploadStatus === 'success' ? (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Upload Successful!</h2>
              <p className="text-gray-400 mb-4">Your anomaly data has been submitted for swarm analysis.</p>
              <p className="text-sm text-gray-500">Redirecting to incidents...</p>
            </div>
          ) : uploadStatus === 'error' ? (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-12 text-center">
              <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Upload Failed</h2>
              <p className="text-gray-400 mb-4">There was an error processing your upload.</p>
              <button
                onClick={() => setUploadStatus('idle')}
                className="px-6 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
              >
                Try Again
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all mb-6 ${
                  isDragging 
                    ? 'border-cyan-400 bg-cyan-500/10' 
                    : 'border-white/20 bg-black/30 hover:border-white/40'
                }`}
              >
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept="image/*,audio/*,.txt,.json,.csv"
                />
                <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-cyan-400' : 'text-gray-400'}`} />
                <h3 className="text-lg font-semibold text-white mb-2">
                  Drop files here or click to upload
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  Supports images, audio, text documents, and sensor data
                </p>
                <div className="flex justify-center space-x-4">
                  {['Image', 'Audio', 'Text', 'Sensor'].map((type, idx) => (
                    <div key={idx} className="flex items-center space-x-1 text-xs text-gray-500">
                      {getTypeIcon(type.toLowerCase())}
                      <span>{type}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Uploaded Files */}
              {files.length > 0 && (
                <div className="bg-black/30 rounded-xl p-4 border border-white/10 mb-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Uploaded Files ({files.length})</h3>
                  <div className="space-y-2">
                    {files.map((item, idx) => {
                      const imageFiles = files.filter(f => f.type === 'image');
                      const imageIndex = imageFiles.findIndex(f => f === item);
                      const isSelected = item.type === 'image' && imageIndex === selectedImageIndex;
                      
                      return (
                        <div 
                          key={idx} 
                          className={`flex items-center justify-between p-3 rounded-lg gap-3 transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-cyan-500/20 border border-cyan-500/50' 
                              : 'bg-black/30 hover:bg-black/50'
                          }`}
                          onClick={() => {
                            if (item.type === 'image') {
                              setSelectedImageIndex(imageIndex);
                            }
                          }}
                        >
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            {item.preview ? (
                              <div className="relative flex-shrink-0">
                                <img src={item.preview} alt="" className="w-10 h-10 object-cover rounded" />
                                {isSelected && (
                                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-3 h-3 text-white" />
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex-shrink-0">{getTypeIcon(item.type)}</div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="text-sm text-white truncate max-w-[200px]" title={item.file.name}>{item.file.name}</div>
                              <div className="text-xs text-gray-500">
                                {(item.file.size / 1024).toFixed(1)} KB • {item.type}
                                {isSelected && <span className="text-cyan-400 ml-2">• Selected for analysis</span>}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                            className="p-1 hover:bg-red-500/20 rounded transition-all flex-shrink-0"
                          >
                            <X className="w-4 h-4 text-gray-400 hover:text-red-400" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Image selection hint */}
                  {files.filter(f => f.type === 'image').length > 1 && (
                    <p className="text-xs text-gray-500 mt-2">
                      Click on an image to select it for AI analysis
                    </p>
                  )}

                  {/* AI Analysis Button */}
                  {!aiAnalysis && uploadStatus !== 'analyzing' && (
                    <button
                      type="button"
                      onClick={handleAnalyze}
                      disabled={uploading}
                      className="w-full mt-4 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg font-semibold text-white hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                      <Brain className="w-5 h-5" />
                      <span>Analyze with Gemini AI</span>
                      <Sparkles className="w-4 h-4" />
                    </button>
                  )}

                  {/* AI Error */}
                  {aiError && (
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-red-400 text-sm">{aiError}</p>
                          {aiError.includes('API key') && (
                            <Link to="/settings" className="text-cyan-400 text-sm hover:underline flex items-center gap-1 mt-2">
                              <Settings className="w-4 h-4" />
                              Go to Settings to add API key
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* AI Analysis Progress */}
              {uploadStatus === 'analyzing' && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6 mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Brain className="w-6 h-6 text-purple-400 animate-pulse" />
                    <span className="text-white font-medium">Gemini AI Analyzing...</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-400 mt-3">Detecting anomalies, threats, and patterns...</p>
                </div>
              )}

              {/* AI Analysis Results */}
              {aiAnalysis && (
                <div className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/30 rounded-xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Brain className="w-6 h-6 text-purple-400" />
                      <h3 className="text-lg font-semibold text-white">Gemini AI Analysis</h3>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Confidence:</span>
                        <span className="text-cyan-400 font-bold">{Math.round(aiAnalysis.confidence * 100)}%</span>
                      </div>
                      {/* Re-analyze button */}
                      <button
                        type="button"
                        onClick={() => { setAiAnalysis(null); setUploadStatus('idle'); }}
                        className="px-3 py-1 text-sm bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30 transition-all"
                      >
                        Analyze Another
                      </button>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-black/30 rounded-lg p-4 mb-4">
                    <p className="text-white">{aiAnalysis.summary}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {/* Anomaly Type */}
                    <div className="bg-black/30 rounded-lg p-3">
                      <div className="text-xs text-gray-500 uppercase mb-1">Anomaly Type</div>
                      <div className="text-white font-medium">{aiAnalysis.anomalyType}</div>
                    </div>
                    {/* Severity */}
                    <div className="bg-black/30 rounded-lg p-3">
                      <div className="text-xs text-gray-500 uppercase mb-1">Detected Severity</div>
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        aiAnalysis.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                        aiAnalysis.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        aiAnalysis.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {aiAnalysis.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Detected Elements */}
                  {aiAnalysis.detectedElements.length > 0 && (
                    <div className="mb-4">
                      <div className="text-xs text-gray-500 uppercase mb-2">Detected Elements</div>
                      <div className="flex flex-wrap gap-2">
                        {aiAnalysis.detectedElements.map((elem, idx) => (
                          <span key={idx} className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-sm">
                            {elem}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Potential Threats */}
                  {aiAnalysis.potentialThreats.length > 0 && (
                    <div className="mb-4">
                      <div className="text-xs text-gray-500 uppercase mb-2">Potential Threats</div>
                      <div className="space-y-1">
                        {aiAnalysis.potentialThreats.map((threat, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <AlertTriangle className="w-4 h-4 text-orange-400" />
                            <span className="text-white">{threat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {aiAnalysis.recommendations.length > 0 && (
                    <div>
                      <div className="text-xs text-gray-500 uppercase mb-2">AI Recommendations</div>
                      <div className="space-y-1">
                        {aiAnalysis.recommendations.map((rec, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <Shield className="w-4 h-4 text-green-400" />
                            <span className="text-white">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Form Fields */}
              <div className="bg-black/30 rounded-xl p-6 border border-white/10 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Anomaly Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm text-gray-400 mb-1">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Brief title for this anomaly"
                      className="w-full bg-black/30 text-white px-4 py-2 rounded-lg border border-white/10 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm text-gray-400 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what you observed..."
                      rows={3}
                      className="w-full bg-black/30 text-white px-4 py-2 rounded-lg border border-white/10 focus:border-cyan-500 focus:outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="City, Country"
                      className="w-full bg-black/30 text-white px-4 py-2 rounded-lg border border-white/10 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      <AlertTriangle className="w-4 h-4 inline mr-1" />
                      Severity
                    </label>
                    <select
                      value={formData.severity}
                      onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value }))}
                      className="w-full bg-black/30 text-white px-4 py-2 rounded-lg border border-white/10 focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm text-gray-400 mb-1">
                      <Tag className="w-4 h-4 inline mr-1" />
                      Tags
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="infrastructure, supply-chain, climate (comma separated)"
                      className="w-full bg-black/30 text-white px-4 py-2 rounded-lg border border-white/10 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="bg-black/30 rounded-xl p-6 border border-white/10 mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                    <span className="text-white font-medium">
                      {uploadStatus === 'analyzing' ? 'Analyzing with AI Swarm...' : 'Uploading files...'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <div className="text-right text-sm text-gray-400 mt-2">{uploadProgress}%</div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={files.length === 0 || uploading}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                  files.length === 0 || uploading
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:opacity-90'
                }`}
              >
                {uploading ? 'Processing...' : 'Submit for Analysis'}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default AnomalyUploadEnhanced;
