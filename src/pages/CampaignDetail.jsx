import React, { useState, useEffect } from 'react';
import API from '../api';
import { 
  ArrowLeft, 
  Send, 
  CheckCircle2, 
  Eye, 
  BookOpen, 
  MousePointerClick, 
  DollarSign, 
  Sparkles, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  AlertCircle,
  FileText,
  Heart
} from 'lucide-react';

const CampaignDetail = ({ campaignId, onBack }) => {
  const [campaign, setCampaign] = useState(null);
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [logsPage, setLogsPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);

  // AI Insights State
  const [aiInsights, setAiInsights] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Fetch campaign details & logs
  const fetchCampaignData = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/campaigns/${campaignId}/stats`);
      setCampaign(res.data);
    } catch (err) {
      console.error('Error fetching campaign details:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      setLogsLoading(true);
      const res = await API.get(`/campaigns/${campaignId}/logs?page=${logsPage}&limit=10`);
      setLogs(res.data.logs);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Error fetching communication logs:', err);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaignData();
  }, [campaignId]);

  useEffect(() => {
    fetchLogs();
  }, [campaignId, logsPage]);

  // Generate Claude performance insights
  const handleGenerateInsights = async () => {
    try {
      setAiLoading(true);
      setAiInsights(null);
      const res = await API.post('/ai/insights', { campaignId });
      setAiInsights(res.data);
    } catch (err) {
      alert('AI Insights generation failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setAiLoading(false);
    }
  };

  const handleLaunchDraft = async () => {
    try {
      await API.post(`/campaigns/${campaignId}/launch`);
      fetchCampaignData();
      fetchLogs();
    } catch (err) {
      alert('Launch failed: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)] text-gray-400">
        <div className="animate-spin w-10 h-10 border-4 border-crmAccent border-t-transparent rounded-full mb-4"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-20 text-gray-500 font-medium">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        Campaign not found.
        <button onClick={onBack} className="block mt-4 mx-auto text-crmAccent font-semibold underline">Go Back</button>
      </div>
    );
  }

  // Calculate Funnel Conversion Rates
  const { sent = 0, delivered = 0, opened = 0, read = 0, clicked = 0, converted = 0 } = campaign.stats || {};
  const deliveryRate = sent > 0 ? ((delivered / sent) * 100).toFixed(1) : 0;
  const openRate = delivered > 0 ? ((opened / delivered) * 100).toFixed(1) : 0;
  const clickRate = opened > 0 ? ((clicked / opened) * 100).toFixed(1) : 0;
  const conversionRate = clicked > 0 ? ((converted / clicked) * 100).toFixed(1) : 0;
  const overallConversion = sent > 0 ? ((converted / sent) * 100).toFixed(1) : 0;

  const funnelData = [
    { name: 'Sent', count: sent, percentage: 100, dropoff: null, color: 'bg-gray-550' },
    { name: 'Delivered', count: delivered, percentage: sent > 0 ? Math.round((delivered / sent) * 100) : 0, dropoff: sent > 0 ? Math.round((1 - delivered / sent) * 100) : 0, color: 'bg-blue-500' },
    { name: 'Opened', count: opened, percentage: delivered > 0 ? Math.round((opened / delivered) * 100) : 0, dropoff: delivered > 0 ? Math.round((1 - opened / delivered) * 100) : 0, color: 'bg-purple-500' },
    { name: 'Clicked', count: clicked, percentage: opened > 0 ? Math.round((clicked / opened) * 100) : 0, dropoff: opened > 0 ? Math.round((1 - clicked / opened) * 100) : 0, color: 'bg-pink-500' },
    { name: 'Converted', count: converted, percentage: clicked > 0 ? Math.round((converted / clicked) * 100) : 0, dropoff: clicked > 0 ? Math.round((1 - converted / clicked) * 100) : 0, color: 'bg-green-500' }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Detail Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 rounded-xl bg-crmCard border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">{campaign.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                campaign.status === 'completed' ? 'bg-crmSuccess/10 text-crmSuccess border border-crmSuccess/25' :
                campaign.status === 'running' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/25 animate-pulse' :
                campaign.status === 'scheduled' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25' :
                'bg-gray-800 text-gray-400 border border-gray-700'
              }`}>
                {campaign.status}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1 capitalize">Channel: {campaign.channel} · Target Segment: {campaign.segmentId?.name || 'Loading...'}</p>
          </div>
        </div>

        {campaign.status === 'draft' && (
          <button
            onClick={handleLaunchDraft}
            className="flex items-center gap-2 bg-crmAccent hover:bg-purple-650 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-purple-500/20 transition-all duration-200"
          >
            <Send className="w-4.5 h-4.5" />
            Launch Campaign Now
          </button>
        )}
      </div>

      {/* KPI stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {/* Sent */}
        <div className="bg-crmCard p-5 rounded-2xl border border-gray-800 shadow-xl space-y-2">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Sent</span>
          <h3 className="text-2xl font-extrabold text-white">{sent.toLocaleString()}</h3>
          <div className="w-full bg-gray-900 rounded-full h-1.5">
            <div className="bg-gray-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
          </div>
          <span className="text-[10px] text-gray-400">Total queued target size</span>
        </div>

        {/* Delivered */}
        <div className="bg-crmCard p-5 rounded-2xl border border-gray-800 shadow-xl space-y-2">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Delivered</span>
          <h3 className="text-2xl font-extrabold text-white">{delivered.toLocaleString()}</h3>
          <div className="w-full bg-gray-900 rounded-full h-1.5">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${deliveryRate}%` }}></div>
          </div>
          <span className="text-[10px] text-blue-400">{deliveryRate}% Delivery Rate</span>
        </div>

        {/* Opened */}
        <div className="bg-crmCard p-5 rounded-2xl border border-gray-800 shadow-xl space-y-2">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Opened</span>
          <h3 className="text-2xl font-extrabold text-white">{opened.toLocaleString()}</h3>
          <div className="w-full bg-gray-900 rounded-full h-1.5">
            <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${openRate}%` }}></div>
          </div>
          <span className="text-[10px] text-purple-400">{openRate}% Open Rate</span>
        </div>

        {/* Clicked */}
        <div className="bg-crmCard p-5 rounded-2xl border border-gray-800 shadow-xl space-y-2">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Clicked</span>
          <h3 className="text-2xl font-extrabold text-white">{clicked.toLocaleString()}</h3>
          <div className="w-full bg-gray-900 rounded-full h-1.5">
            <div className="bg-pink-500 h-1.5 rounded-full" style={{ width: `${clickRate}%` }}></div>
          </div>
          <span className="text-[10px] text-pink-400">{clickRate}% Click-to-Open</span>
        </div>

        {/* Converted */}
        <div className="bg-crmCard p-5 rounded-2xl border border-gray-800 shadow-xl space-y-2">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Converted</span>
          <h3 className="text-2xl font-extrabold text-white">{converted.toLocaleString()}</h3>
          <div className="w-full bg-gray-900 rounded-full h-1.5">
            <div className="bg-crmSuccess h-1.5 rounded-full" style={{ width: `${overallConversion}%` }}></div>
          </div>
          <span className="text-[10px] text-crmSuccess font-semibold">{overallConversion}% Conversion Rate</span>
        </div>

        {/* Revenue */}
        <div className="bg-crmCard p-5 rounded-2xl border border-gray-800 shadow-xl space-y-2">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Revenue</span>
          <h3 className="text-2xl font-extrabold text-crmSuccess">₹{(campaign.stats?.revenue || 0).toLocaleString()}</h3>
          <div className="w-full bg-gray-900 rounded-full h-1.5">
            <div className="bg-crmSuccess h-1.5 rounded-full" style={{ width: '105%' }}></div>
          </div>
          <span className="text-[10px] text-gray-400">Total purchase returns</span>
        </div>
      </div>

      {/* Visual Funnel and Message Template Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Funnel chart Card */}
        <div className="lg:col-span-2 bg-crmCard p-6 rounded-2xl border border-gray-800 shadow-xl space-y-6">
          <h3 className="font-extrabold text-white text-base">Conversion Funnel Drop-off</h3>
          
          <div className="space-y-4">
            {funnelData.map((item, idx) => {
              const relativeWidth = sent > 0 ? (item.count / sent) * 100 : 0;
              return (
                <div key={item.name} className="space-y-1">
                  {/* Dropoff badge */}
                  {idx > 0 && (
                    <div className="flex justify-between items-center px-4 py-0.5 text-[9px] text-red-400 font-extrabold font-mono bg-red-500/5 border border-red-500/10 rounded-lg max-w-[200px] mx-auto text-center">
                      <span>↓ Drop-off: {item.dropoff}%</span>
                    </div>
                  )}

                  <div className="flex justify-between text-xs font-semibold text-gray-400 px-1 pt-1.5">
                    <span>{item.name}</span>
                    <span className="text-white">
                      {item.count.toLocaleString()}
                      <span className="text-gray-500 font-medium ml-1">
                        ({idx === 0 ? 'Base' : `${item.percentage}% of previous`})
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-950 rounded-xl h-9 relative overflow-hidden border border-gray-850">
                    <div 
                      className={`h-full rounded-l-xl transition-all duration-500 ${item.color}`}
                      style={{ 
                        width: `${Math.max(4, relativeWidth)}%`
                      }}
                    ></div>
                    {/* Centered label */}
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-extrabold text-white uppercase tracking-widest pointer-events-none drop-shadow">
                      {item.name}: {item.count} ({sent > 0 ? ((item.count / sent) * 100).toFixed(1) : 0}% of overall)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Message Template details */}
        <div className="bg-crmCard p-6 rounded-2xl border border-gray-800 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-crmAccent" />
              Message Template
            </h3>
            <div className="p-4 rounded-xl bg-gray-950 border border-gray-850 min-h-[120px] text-xs font-mono text-gray-300 whitespace-pre-wrap leading-relaxed">
              {campaign.messageTemplate}
            </div>
            <p className="text-[10px] text-gray-500 italic leading-relaxed">
              Variables like <code className="text-purple-400 font-bold font-mono">{"{{name}}"}</code> and <code className="text-purple-400 font-bold font-mono">{"{{city}}"}</code> are automatically replaced with recipient shopper profile values at launch.
            </p>
          </div>
        </div>
      </div>

      {/* AI Insights & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Logs table list */}
        <div className="lg:col-span-2 bg-crmCard rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-800">
            <h3 className="font-extrabold text-white text-base">Delivery Logs</h3>
            <p className="text-xs text-gray-500 mt-1">Status history per message dispatch</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-900/50 text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-800">
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Recipient</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 text-sm text-gray-300">
                {logsLoading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-10">
                      <Loader2 className="w-6 h-6 text-crmAccent animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-10 text-gray-500 font-medium">No logs recorded. Launch the campaign to start sending logs!</td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-800/20 group transition-colors">
                      <td className="px-6 py-3.5">
                        <p className="font-semibold text-white">{log.customerId?.name || 'Deleted Customer'}</p>
                      </td>
                      <td className="px-6 py-3.5 font-mono text-xs">{log.recipient}</td>
                      <td className="px-6 py-3.5 relative">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            log.status === 'converted' ? 'bg-crmSuccess/10 text-crmSuccess border border-crmSuccess/20' :
                            log.status === 'failed' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            log.status === 'queued' ? 'bg-gray-900 text-gray-400 border border-gray-800' :
                            'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          }`}>
                            {log.status}
                          </span>
                          
                          {/* Attempts / Retry indicators */}
                          {log.attempts > 1 && (
                            <span className="text-[9px] bg-purple-550/10 text-crmAccent border border-purple-550/20 px-1.5 py-0.5 rounded font-extrabold font-mono shrink-0">
                              {log.status === 'failed' ? `Attempt #${log.attempts}` : `Retry #${log.attempts - 1}`}
                            </span>
                          )}
                        </div>

                        {/* Status history hover tooltip */}
                        <div className="hidden group-hover:block absolute left-6 bottom-8 z-30 bg-crmCard border border-gray-850 p-3 rounded-xl shadow-2xl w-52 text-[10px] space-y-1.5 animate-fadeIn">
                          <p className="font-extrabold text-white border-b border-gray-800 pb-1 mb-1 uppercase tracking-wider">Status & Retry History</p>
                          {log.statusHistory.map((h, i) => (
                            <div key={i} className="flex justify-between text-gray-400 gap-2">
                              <span className="capitalize">{h.status === 'queued' && i > 0 ? `queued (Retry #${i})` : h.status}</span>
                              <span className="font-mono text-gray-650">{new Date(h.timestamp).toLocaleTimeString()}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-xs text-gray-500">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Log Pagination */}
          {!logsLoading && pagination.pages > 1 && (
            <div className="flex justify-between items-center px-6 py-4 bg-gray-900/40 border-t border-gray-800">
              <span className="text-xs text-gray-500">Showing page {logsPage} of {pagination.pages} ({pagination.total} logs total)</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setLogsPage(p => Math.max(1, p - 1))}
                  disabled={logsPage === 1}
                  className="p-1 rounded bg-crmCard border border-gray-800 disabled:opacity-35 text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLogsPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={logsPage === pagination.pages}
                  className="p-1 rounded bg-crmCard border border-gray-800 disabled:opacity-35 text-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* AI Performance Insights panel */}
        <div className="bg-crmCard p-6 rounded-2xl border border-gray-800 shadow-xl space-y-6 self-start">
          <div className="pb-4 border-b border-gray-850 flex justify-between items-center">
            <h3 className="font-extrabold text-white text-base">Campaign Insights</h3>
            <Sparkles className="w-4 h-4 text-crmAccent animate-pulse" />
          </div>

          {aiLoading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
              <Loader2 className="w-8 h-8 text-crmAccent animate-spin" />
              <p className="text-xs text-gray-500 font-semibold animate-pulse">Claude is interpreting metrics...</p>
            </div>
          ) : aiInsights ? (
            <div className="space-y-5 animate-fadeIn">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Summary</span>
                <p className="text-xs text-gray-300 leading-relaxed font-semibold">{aiInsights.summary}</p>
              </div>

              <div className="space-y-3 pt-3 border-t border-gray-855">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Claude Suggestions</span>
                <ul className="space-y-2.5">
                  {aiInsights.suggestions.map((s, idx) => (
                    <li key={idx} className="text-xs text-gray-400 leading-relaxed flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-crmAccent shrink-0 mt-1.5"></span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={handleGenerateInsights}
                className="w-full mt-4 bg-gray-900 hover:bg-gray-850 text-crmAccent border border-purple-550/20 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center gap-1.5"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Regenerate Report
              </button>
            </div>
          ) : (
            <div className="text-center py-10 space-y-4">
              <p className="text-xs text-gray-500 leading-relaxed">
                Generate a comprehensive diagnostic report analyzing conversion drop-off rates and message engagement copy using Claude AI.
              </p>
              <button
                onClick={handleGenerateInsights}
                className="w-full bg-crmAccent hover:bg-purple-650 text-white font-bold py-2.5 rounded-xl text-xs transition-all duration-200 shadow-lg shadow-purple-500/10 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                ✨ Generate AI Insights
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
