'use client';

import React, { useState, useEffect } from 'react';
import { AI_MODELS, AIModel, UserTier } from '@/lib/tiers';
import {
  Shield,
  AlertTriangle,
  Skull,
  Eye,
  Database,
  Activity,
  Lock,
  Unlock,
  FileText,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle
} from './Icons';

interface ModelWithAccess extends AIModel {
  accessible: boolean;
}

const TransparencyDashboard = () => {
  const [models, setModels] = useState<ModelWithAccess[]>([]);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'standard' | 'banned' | 'unethical'>('all');
  const [userTier, setUserTier] = useState<UserTier>('explorer');
  const [showFullTransparency, setShowFullTransparency] = useState(false);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const walletAddress = localStorage.getItem('walletAddress');
      const response = await fetch('/api/tiers?action=models&showAll=true', {
        headers: {
          'Authorization': `Bearer ${walletAddress || 'anonymous'}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setModels(data.models);
        // Determine user's effective tier based on accessible models
        const accessibleTiers = data.models
          .filter((m: any) => m.accessible)
          .map((m: any) => m.minTier);
        const highestTier = accessibleTiers.includes('developer') ? 'developer' :
          accessibleTiers.includes('master') ? 'master' :
            accessibleTiers.includes('adept') ? 'adept' :
              accessibleTiers.includes('apprentice') ? 'apprentice' :
                accessibleTiers.includes('novice') ? 'novice' : 'explorer';
        setUserTier(highestTier as UserTier);
      }
    } catch (error) {
      console.error('Error fetching models:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransparencyReport = async (modelId: string) => {
    try {
      const walletAddress = localStorage.getItem('walletAddress');
      const response = await fetch(`/api/tiers?action=transparency&modelId=${modelId}`, {
        headers: {
          'Authorization': `Bearer ${walletAddress || 'anonymous'}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedModel(data.model);
        setShowFullTransparency(data.model.hasFullAccess);
      }
    } catch (error) {
      console.error('Error fetching transparency report:', error);
    }
  };

  const filteredModels = models.filter(model => {
    if (filter === 'all') return true;
    if (filter === 'standard') return !model.flags.isBanned && !model.flags.isUnethical;
    if (filter === 'banned') return model.flags.isBanned && !model.flags.isUnethical;
    if (filter === 'unethical') return model.flags.isUnethical;
    return true;
  });

  const getModelIcon = (model: ModelWithAccess) => {
    if (model.flags.isUnethical) return <Skull className="w-5 h-5 text-red-500" />;
    if (model.flags.isBanned) return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    if (model.flags.isUncensored) return <Eye className="w-5 h-5 text-purple-500" />;
    return <Shield className="w-5 h-5 text-green-500" />;
  };

  const getModelBadge = (model: ModelWithAccess) => {
    if (model.flags.isUnethical) {
      return (
        <span className="px-2 py-1 bg-red-900/50 border border-red-800 text-red-400 text-xs rounded-full flex items-center gap-1">
          <Skull className="w-3 h-3" />
          Unethical
        </span>
      );
    }
    if (model.flags.isBanned) {
      return (
        <span className="px-2 py-1 bg-amber-900/50 border border-amber-800 text-amber-400 text-xs rounded-full flex items-center gap-1">
          <Lock className="w-3 h-3" />
          Banned
        </span>
      );
    }
    if (model.flags.isUncensored) {
      return (
        <span className="px-2 py-1 bg-purple-900/50 border border-purple-800 text-purple-400 text-xs rounded-full flex items-center gap-1">
          <Eye className="w-3 h-3" />
          Uncensored
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-green-900/50 border border-green-800 text-green-400 text-xs rounded-full flex items-center gap-1">
        <CheckCircle className="w-3 h-3" />
        Standard
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-xl p-6 border border-gray-800">
        <h2 className="text-2xl font-bold text-white mb-2">AI Transparency Dashboard</h2>
        <p className="text-gray-400">
          Full transparency into AI models including banned and unethical variants.
          Understanding the full spectrum of AI capabilities and risks.
        </p>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-800">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Shield className="w-4 h-4 text-green-500" />
            Standard Models
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Eye className="w-4 h-4 text-purple-500" />
            Uncensored
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Lock className="w-4 h-4 text-amber-500" />
            Banned (Research Only)
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Skull className="w-4 h-4 text-red-500" />
            Unethical (Verified Only)
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'standard', 'banned', 'unethical'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Models Grid */}
      <div className="grid gap-4">
        {filteredModels.map((model) => (
          <div
            key={model.id}
            className={`rounded-xl border transition-all duration-300 ${model.flags.isUnethical
                ? 'bg-red-950/20 border-red-900/50 hover:border-red-800'
                : model.flags.isBanned
                  ? 'bg-amber-950/20 border-amber-900/50 hover:border-amber-800'
                  : 'bg-gray-900 border-gray-800 hover:border-gray-700'
              }`}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getModelIcon(model)}
                  <div>
                    <h3 className="text-lg font-bold text-white">{model.name}</h3>
                    <p className="text-sm text-gray-500">{model.provider}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getModelBadge(model)}
                  {model.accessible ? (
                    <span className="px-2 py-1 bg-green-900/50 border border-green-800 text-green-400 text-xs rounded-full">
                      <Unlock className="w-3 h-3 inline mr-1" />
                      Access Granted
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-800 border border-gray-700 text-gray-500 text-xs rounded-full">
                      <Lock className="w-3 h-3 inline mr-1" />
                      Locked
                    </span>
                  )}
                </div>
              </div>

              <p className="text-gray-400 text-sm mb-4">{model.description}</p>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <Database className="w-4 h-4" />
                  {model.parameters}
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Activity className="w-4 h-4" />
                  {model.latency}
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Shield className="w-4 h-4" />
                  {model.flags.requiresExplicitConsent ? 'Consent Required' : 'Standard Access'}
                </div>
              </div>

              {/* Flags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {model.flags.isOpenSource && (
                  <span className="px-2 py-1 bg-blue-900/30 text-blue-400 text-xs rounded">
                    Open Source
                  </span>
                )}
                {model.flags.isControversial && (
                  <span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 text-xs rounded">
                    Controversial
                  </span>
                )}
                <span className={`px-2 py-1 text-xs rounded ${model.minTier === 'explorer' ? 'bg-green-900/30 text-green-400' :
                    model.minTier === 'novice' || model.minTier === 'apprentice' ? 'bg-blue-900/30 text-blue-400' :
                      model.minTier === 'adept' ? 'bg-purple-900/30 text-purple-400' :
                        'bg-red-900/30 text-red-400'
                  }`}>
                  {model.minTier} tier
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => fetchTransparencyReport(model.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  View Transparency Report
                </button>
                {model.accessible && (
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                    <ExternalLink className="w-4 h-4" />
                    Try Model
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Transparency Report Modal */}
      {selectedModel && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-950 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-800">
            <div className="sticky top-0 bg-gray-950 border-b border-gray-800 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedModel.flags.isUnethical ? (
                  <Skull className="w-6 h-6 text-red-500" />
                ) : selectedModel.flags.isBanned ? (
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                ) : (
                  <Shield className="w-6 h-6 text-green-500" />
                )}
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedModel.name}</h3>
                  <p className="text-sm text-gray-500">Full Transparency Report</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedModel(null)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <XCircle className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Warnings */}
              {(selectedModel.flags.isBanned || selectedModel.flags.isUnethical) && (
                <div className="bg-red-950/30 border border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="text-red-200 text-sm">
                      <p className="font-semibold mb-1">Research Access Only</p>
                      <p>This model has been flagged as {selectedModel.flags.isUnethical ? 'unethical' : 'banned'} and is restricted to verified researchers.
                        All access is logged for transparency and safety research purposes.</p>
                    </div>
                  </div>
                </div>
              )}

              {!showFullTransparency && (
                <div className="bg-amber-950/30 border border-amber-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Lock className="w-5 h-5" />
                    <span className="font-semibold">Limited Access</span>
                  </div>
                  <p className="text-amber-200/70 text-sm mt-1">
                    Upgrade to {selectedModel.minTier} tier to view full transparency data.
                  </p>
                </div>
              )}

              {/* Training Data */}
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-400" />
                  Training Data
                </h4>
                {showFullTransparency ? (
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-500">Data Size:</span>
                        <p className="text-white">{selectedModel.transparency?.trainingData?.size || 'Unknown'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Date Range:</span>
                        <p className="text-white">{selectedModel.transparency?.trainingData?.dateRange || 'Unknown'}</p>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Data Sources:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedModel.transparency?.trainingData?.sources?.map((source: string) => (
                          <span key={source} className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs">
                            {source}
                          </span>
                        )) || 'Not disclosed'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Known Biases:</span>
                      <ul className="mt-1 space-y-1">
                        {selectedModel.transparency?.trainingData?.knownBiases?.map((bias: string, i: number) => (
                          <li key={i} className="text-amber-400 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            {bias}
                          </li>
                        )) || <li className="text-gray-400">No known biases documented</li>}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Full training data details available at higher tiers.</p>
                )}
              </div>

              {/* Safety Testing */}
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-400" />
                  Safety Testing
                </h4>
                {showFullTransparency ? (
                  <div className="space-y-3 text-sm">
                    {selectedModel.transparency?.safetyTesting?.redTeamResults && (
                      <div>
                        <span className="text-gray-500">Red Team Results:</span>
                        <p className="text-white">{selectedModel.transparency.safetyTesting.redTeamResults}</p>
                      </div>
                    )}
                    {selectedModel.transparency?.safetyTesting?.jailbreakSuccessRate !== undefined && (
                      <div>
                        <span className="text-gray-500">Jailbreak Success Rate:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-gray-800 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${selectedModel.transparency.safetyTesting.jailbreakSuccessRate > 0.5
                                  ? 'bg-red-500'
                                  : 'bg-green-500'
                                }`}
                              style={{ width: `${selectedModel.transparency.safetyTesting.jailbreakSuccessRate * 100}%` }}
                            />
                          </div>
                          <span className="text-white">
                            {(selectedModel.transparency.safetyTesting.jailbreakSuccessRate * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Known Vulnerabilities:</span>
                      <ul className="mt-1 space-y-1">
                        {selectedModel.transparency?.safetyTesting?.knownVulnerabilities?.map((vuln: string, i: number) => (
                          <li key={i} className="text-red-400 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            {vuln}
                          </li>
                        )) || <li className="text-gray-400">No vulnerabilities documented</li>}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Safety testing details available at higher tiers.</p>
                )}
              </div>

              {/* Usage Stats */}
              {showFullTransparency && selectedModel.transparency?.usageStats && (
                <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                  <h4 className="text-lg font-semibold text-white mb-4">Usage Statistics</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-950 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-white">
                        {selectedModel.transparency.usageStats.totalRequests?.toLocaleString() || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">Total Requests</div>
                    </div>
                    <div className="bg-gray-950 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-red-400">
                        {((selectedModel.transparency.usageStats.flaggedRequests || 0) * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-500">Flagged Rate</div>
                    </div>
                    {selectedModel.transparency.usageStats.averageToxicityScore !== undefined && (
                      <div className="bg-gray-950 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-amber-400">
                          {(selectedModel.transparency.usageStats.averageToxicityScore * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-500">Toxicity Score</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Safety Guidelines */}
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-400" />
                  Safety Guidelines
                </h4>
                {showFullTransparency ? (
                  <div className="space-y-4 text-sm">
                    {selectedModel.safety?.contentWarnings && selectedModel.safety.contentWarnings.length > 0 && (
                      <div>
                        <span className="text-red-400 font-semibold">Content Warnings:</span>
                        <ul className="mt-2 space-y-1">
                          {selectedModel.safety.contentWarnings.map((warning: string, i: number) => (
                            <li key={i} className="text-red-300 flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                              {warning}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-green-400 font-semibold">Recommended Use Cases:</span>
                        <ul className="mt-2 space-y-1">
                          {selectedModel.safety?.recommendedUseCases?.map((use: string, i: number) => (
                            <li key={i} className="text-green-300 flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                              {use}
                            </li>
                          )) || <li className="text-gray-400">No specific recommendations</li>}
                        </ul>
                      </div>
                      <div>
                        <span className="text-red-400 font-semibold">Prohibited Use Cases:</span>
                        <ul className="mt-2 space-y-1">
                          {selectedModel.safety?.prohibitedUseCases?.map((use: string, i: number) => (
                            <li key={i} className="text-red-300 flex items-start gap-2">
                              <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                              {use}
                            </li>
                          )) || <li className="text-gray-400">No specific prohibitions</li>}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Safety guidelines available at higher tiers.</p>
                )}
              </div>

              {/* Audit Reports */}
              {showFullTransparency && selectedModel.transparency?.auditReports && selectedModel.transparency.auditReports.length > 0 && (
                <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                  <h4 className="text-lg font-semibold text-white mb-4">Audit Reports</h4>
                  <div className="space-y-3">
                    {selectedModel.transparency.auditReports.map((report: any, i: number) => (
                      <div key={i} className="bg-gray-950 rounded-lg p-4 border border-gray-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">{report.auditor}</span>
                          <span className="text-gray-500 text-sm">{report.date}</span>
                        </div>
                        <p className="text-gray-400 text-sm">{report.findings}</p>
                        {report.link && (
                          <a
                            href={report.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm mt-2"
                          >
                            View Full Report
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransparencyDashboard;
