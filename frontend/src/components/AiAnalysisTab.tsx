import { useState } from 'react';
import api from '../services/api';
import { type AiResponse } from '../types';
import { Sparkles, Brain, Cpu, MessageSquare, AlertCircle, CheckCircle, RefreshCw, Layers, Clipboard, HelpCircle } from 'lucide-react';

interface AiAnalysisTabProps {
  hasRoutines: boolean;
}

export default function AiAnalysisTab({ hasRoutines }: AiAnalysisTabProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AiResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleRunAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/ai/analyze');
      if (response.data.success) {
        setAnalysis(response.data.analysis);
      } else {
        setError(response.data.error || 'Failed to finish schedule analysis.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to run Gemini analysis middleware.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (analysis?.overallSummary) {
      navigator.clipboard.writeText(analysis.overallSummary).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6" id="ai-analysis-tab">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">AI-Powered Schedule Optimizations</h2>
        <p className="text-xs text-gray-500 mt-1">
          Leverage the Gemini AI model to perform full class routine audits, detect bottlenecks, and suggest faculty optimizations.
        </p>
      </div>

      {!hasRoutines ? (
        <div className="p-8 text-center bg-white border border-gray-200 rounded-lg shadow-xs">
          <Brain className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Academic Routine Required</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            You must automatically generate a course routine layout first before requesting AI Optimization auditing.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Analyze Trigger Card */}
          <div className="lg:col-span-1 bg-white p-5 rounded-lg border border-gray-200 shadow-xs h-fit space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Cpu className="text-sky-600 w-4.5 h-4.5" />
                <h3 className="text-sm font-semibold text-gray-700">Audit Trigger Panel</h3>
              </div>
              <button 
                onClick={() => setShowHelp(!showHelp)}
                className="text-gray-400 hover:text-gray-600 transition p-1 rounded courser-pointer"
                title="Learn more about AI audits"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            {showHelp && (
              <div className="p-3 bg-blue-50 border border-blue-100 rounded text-[11px] text-blue-800 leading-relaxed animate-fade-in">
                <strong>What gets analyzed?</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Teacher contact-hours density</li>
                  <li>Overlapping room allocations</li>
                  <li>Inconsistencies in section assignments</li>
                </ul>
              </div>
            )}
            <p className="text-xs text-gray-600 leading-relaxed">
              When clicked, the system bundles overall schedule grids, seating metrics, and teacher workloads to query the model.
            </p>

            <button
              onClick={handleRunAnalysis}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#2C4A6F] text-white text-xs font-semibold py-3 px-4 rounded hover:bg-[#1B324F] transition disabled:opacity-50 shadow-xs cursor-pointer"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {analysis ? 'Revise Audit Review' : 'Run Schedule Analysis Audit'}
            </button>

            {loading && (
              <div className="p-3 bg-slate-50 border border-gray-100 rounded text-[11px] text-gray-500 flex flex-col gap-1.5 animate-pulse">
                <span className="font-semibold text-gray-700">Processing optimization query...</span>
                <span>Gemini is scrutinizing over 20+ scheduling parameters...</span>
              </div>
            )}

            {error && (
              <div className="p-3.5 bg-red-50 border-l-3 border-red-500 rounded text-red-800 text-xs flex gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* AI Analysis Report Display area */}
          <div className="lg:col-span-2 space-y-6">
            {analysis ? (
              <div className="space-y-6 animate-none">
                
                {/* Executive Summary */}
                <div className="bg-emerald-50/55 p-5 rounded-lg border border-emerald-200/60 shadow-xs">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4.5 h-4.5 text-emerald-600" />
                      <h3 className="text-sm font-bold text-emerald-950">Executive Auditor Summary</h3>
                    </div>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-100 hover:bg-emerald-200/80 px-2 py-1 rounded transition-smooth cursor-pointer"
                      title="Copy Summary to Clipboard"
                    >
                      <Clipboard className="w-3.5 h-3.5" />
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                    {analysis.overallSummary}
                  </p>
                </div>

                {/* Structured Audit Recommendations list */}
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 pb-1 border-b border-gray-100 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-sky-600" />
                    Actionable Optimization Bulletins ({analysis.suggestions?.length || 0})
                  </h3>
                  <div className="space-y-3">
                    {analysis.suggestions && analysis.suggestions.length > 0 ? (
                      analysis.suggestions.map((suggestion, index) => (
                        <div key={index} className="p-3 bg-gray-50 border-l-4 border-[#2C4A6F] rounded text-xs text-gray-700 leading-relaxed">
                          {suggestion}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500 italic">No warnings found in generated allocations.</p>
                    )}
                  </div>
                </div>

                {/* Deep-dive subtopics grids */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2 border-b pb-1">Teacher Workload Assessor</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {analysis.teacherWorkloadReview}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2 border-b pb-1">Room Utilization Assessor</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {analysis.roomUtilizationReview}
                    </p>
                  </div>
                </div>

                {/* Full narrative assessment report */}
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 pb-1 border-b border-gray-100 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-sky-600" />
                    Formal Comprehensive Schedule Assessment Report
                  </h3>
                  <div className="text-xs text-gray-700 space-y-4 whitespace-pre-wrap leading-relaxed">
                    {analysis.narrativeReportMarkdown}
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-gray-50/50 rounded-lg border border-dashed border-gray-200 p-12 text-center">
                <Brain className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <h3 className="text-xs font-semibold text-gray-700 mb-1">Awaiting Schedule Trigger</h3>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">
                  Click 'Run Schedule Analysis Audit' on the left controller to check the academic routines health indicators.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
