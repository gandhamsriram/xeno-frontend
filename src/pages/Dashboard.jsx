import React, { useState, useEffect } from 'react';
import API from '../api';
import { 
  Users, 
  Layers, 
  Send, 
  TrendingUp, 
  Sparkles,
  Plus,
  Play,
  ArrowUpRight,
  Brain,
  ChevronRight,
  Zap,
  Target
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const Dashboard = ({ setActiveTab, setSelectedCampaignId }) => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalSegments: 0,
    totalCampaigns: 0,
    avgDeliveryRate: 0,
    recentCampaigns: [],
    chartData: []
  });
  const [intelligence, setIntelligence] = useState(null);
  const [aiAnalytics, setAiAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [custRes, segRes, campRes, intelRes, aiAnalyticRes] = await Promise.all([
          API.get('/customers?limit=1'),
          API.get('/segments'),
          API.get('/campaigns'),
          API.get('/customers/intelligence'),
          API.get('/ai/analytics')
        ]);

        const customersCount = custRes.data.pagination.total || 0;
        const segmentsCount = segRes.data.length || 0;
        const campaigns = campRes.data || [];

        // Compute sent sum & average delivery rate
        let totalSent = 0;
        let totalDelivered = 0;
        let deliveryRatesSum = 0;
        let launchedCount = 0;
        let totalRevenue = 0;

        campaigns.forEach(c => {
          if (c.stats) {
            if (c.stats.sent > 0) {
              totalSent += c.stats.sent;
              totalDelivered += c.stats.delivered;
              deliveryRatesSum += (c.stats.delivered / c.stats.sent) * 100;
              launchedCount++;
            }
            if (c.stats.revenue) {
              totalRevenue += c.stats.revenue;
            }
          }
        });

        const avgDelivery = launchedCount > 0 ? (deliveryRatesSum / launchedCount).toFixed(1) : '0.0';

        // Prepare Recharts chart data from recent completed/running campaigns
        const chartData = campaigns
          .filter(c => c.status !== 'draft')
          .slice(0, 7)
          .map(c => ({
            name: c.name.length > 15 ? c.name.substring(0, 15) + '...' : c.name,
            Sent: c.stats.sent || 0,
            Delivered: c.stats.delivered || 0,
            Converted: c.stats.converted || 0
          }))
          .reverse(); // Newest to right

        setStats({
          totalCustomers: customersCount,
          totalSegments: segmentsCount,
          totalCampaigns: campaigns.length,
          avgDeliveryRate: avgDelivery,
          totalRevenue,
          recentCampaigns: campaigns.slice(0, 5),
          chartData
        });

        setIntelligence(intelRes.data);
        setAiAnalytics(aiAnalyticRes.data);
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLaunchCampaign = async (id) => {
    try {
      await API.post(`/campaigns/${id}/launch`);
      // Refresh
      const campRes = await API.get('/campaigns');
      setStats(prev => ({
        ...prev,
        recentCampaigns: campRes.data.slice(0, 5)
      }));
    } catch (err) {
      alert('Failed to launch campaign: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleViewCampaignDetails = (id) => {
    setSelectedCampaignId(id);
    setActiveTab('campaigns'); // switch to campaigns tab which will load campaign details
  };

  const handleTriggerAgent = (promptText) => {
    localStorage.setItem('xeno_agent_prompt', promptText);
    setActiveTab('campaign-agent');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)] text-gray-400">
        <div className="animate-spin w-10 h-10 border-4 border-crmAccent border-t-transparent rounded-full mb-4"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Overview</h1>
          <p className="text-gray-400 text-sm mt-1">Real-time stats and performance metrics of your D2C outreach</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('segments')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-800 bg-crmCard text-gray-300 font-semibold text-sm hover:bg-gray-850 hover:text-white transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            New Segment
          </button>
          <button
            onClick={() => setActiveTab('campaigns')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-crmAccent text-white font-semibold text-sm hover:bg-purple-650 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/35 transition-all duration-200"
          >
            <Send className="w-4 h-4" />
            Launch Campaign
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-crmCard p-6 rounded-2xl border border-gray-800 flex items-center justify-between shadow-xl">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Shoppers</p>
            <h3 className="text-3xl font-extrabold text-white">{stats.totalCustomers.toLocaleString()}</h3>
            <p className="text-xs text-crmSuccess font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              +12.5% this month
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/25">
            <Users className="w-6 h-6 text-blue-400" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-crmCard p-6 rounded-2xl border border-gray-800 flex items-center justify-between shadow-xl">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Target Segments</p>
            <h3 className="text-3xl font-extrabold text-white">{stats.totalSegments}</h3>
            <p className="text-xs text-gray-400 font-medium">Dynamically updated</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/25">
            <Layers className="w-6 h-6 text-purple-400" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-crmCard p-6 rounded-2xl border border-gray-800 flex items-center justify-between shadow-xl">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Campaigns</p>
            <h3 className="text-3xl font-extrabold text-white">{stats.totalCampaigns}</h3>
            <p className="text-xs text-gray-400 font-medium">Across all channels</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center border border-pink-500/25">
            <Send className="w-6 h-6 text-pink-400" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-crmCard p-6 rounded-2xl border border-gray-800 flex items-center justify-between shadow-xl">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Campaign Revenue</p>
            <h3 className="text-3xl font-extrabold text-white">₹{stats.totalRevenue ? stats.totalRevenue.toLocaleString() : '0'}</h3>
            <p className="text-xs text-crmSuccess font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Generated by shoppers
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/25">
            <span className="text-xl font-bold text-green-400">₹</span>
          </div>
        </div>
      </div>

      {/* Customer Intelligence insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-crmCard p-6 rounded-3xl border border-gray-800 shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            Customer Intelligence Layer
          </h2>
          <p className="text-xs text-gray-500">Machine learning categorizations of shopper lifecycles</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="bg-gray-950 p-4 rounded-2xl border border-gray-850">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">VIP Shoppers</span>
              <h4 className="text-2xl font-extrabold text-white mt-1.5">{intelligence?.vipCount || 0}</h4>
            </div>
            <div className="bg-gray-950 p-4 rounded-2xl border border-gray-850">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">High Value</span>
              <h4 className="text-2xl font-extrabold text-crmSuccess mt-1.5">{intelligence?.highValueCount || 0}</h4>
            </div>
            <div className="bg-gray-950 p-4 rounded-2xl border border-gray-850">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">At Risk</span>
              <h4 className="text-2xl font-extrabold text-crmWarning mt-1.5">{intelligence?.atRiskCount || 0}</h4>
            </div>
            <div className="bg-gray-950 p-4 rounded-2xl border border-gray-850">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">Potential Churn</span>
              <h4 className="text-2xl font-extrabold text-red-400 mt-1.5">{intelligence?.churnCount || 0}</h4>
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="bg-crmCard p-6 rounded-3xl border border-gray-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4.5 h-4.5 text-crmAccent animate-pulse" />
              AI CRM Recommendations
            </h2>
            <p className="text-[10px] text-gray-500">Actionable advice compiled from shopper trends</p>
          </div>
          <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1 flex-1 mt-3">
            {intelligence?.recommendations.map((rec) => (
              <div key={rec.id} className="bg-gray-950 p-3 rounded-xl border border-gray-850 text-xs flex flex-col justify-between gap-2.5">
                <div>
                  <h4 className="font-extrabold text-white">{rec.title}</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{rec.message}</p>
                </div>
                <button
                  onClick={() => handleTriggerAgent(rec.promptText)}
                  className="bg-purple-550/10 hover:bg-purple-550/20 text-crmAccent font-extrabold px-3 py-1.5 rounded-lg border border-purple-550/20 text-left flex items-center justify-between mt-1 transition-all duration-150"
                >
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-crmAccent fill-current" />
                    Auto-Launch via Agent
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analytics Chart & AI Analytics panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart (2/3 width) */}
        {stats.chartData.length > 0 && (
          <div className="lg:col-span-2 bg-crmCard p-6 rounded-2xl border border-gray-800 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-white">Campaign Funnel Statistics</h2>
                <p className="text-xs text-gray-400 mt-1">Comparison of Sent, Delivered, and Converted metrics</p>
              </div>
              <span className="text-xs bg-gray-900 border border-gray-800 px-3 py-1 rounded-full text-gray-400 font-medium">Last 7 Campaigns</span>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" vertical={false} />
                  <XAxis dataKey="name" stroke="#718096" fontSize={11} tickLine={false} />
                  <YAxis stroke="#718096" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A1D27', borderColor: '#4A5568', borderRadius: '12px' }}
                    labelStyle={{ color: '#E2E8F0', fontWeight: 'bold' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="Sent" fill="#4B5563" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Delivered" fill="#6C63FF" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Converted" fill="#22C55E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* AI Analytics panel (1/3 width) */}
        <div className="bg-crmCard p-6 rounded-3xl border border-gray-800 shadow-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-1.5 pb-3 border-b border-gray-850">
              <Sparkles className="w-4.5 h-4.5 text-crmAccent animate-pulse" />
              AI Performance Analysis
            </h2>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center bg-gray-950 p-3 rounded-xl border border-gray-850">
                <span className="text-gray-500 font-bold uppercase tracking-wider text-[9px]">Best Segment</span>
                <span className="font-extrabold text-white truncate max-w-[60%]">{aiAnalytics?.bestSegment} ({aiAnalytics?.bestSegmentRate}%)</span>
              </div>
              <div className="flex justify-between items-center bg-gray-950 p-3 rounded-xl border border-gray-850">
                <span className="text-gray-500 font-bold uppercase tracking-wider text-[9px]">Top Channel</span>
                <span className="font-extrabold text-crmAccent uppercase">{aiAnalytics?.bestChannel}</span>
              </div>
              <div className="flex justify-between items-center bg-gray-950 p-3 rounded-xl border border-gray-850">
                <span className="text-gray-500 font-bold uppercase tracking-wider text-[9px]">Effective Tone</span>
                <span className="font-extrabold text-white capitalize">{aiAnalytics?.bestTone}</span>
              </div>
            </div>
            
            <p className="text-xs text-gray-400 leading-relaxed font-semibold italic bg-gray-950/40 p-3 rounded-xl border border-gray-850/50">
              "{aiAnalytics?.summary}"
            </p>
          </div>

          <div className="pt-3 border-t border-gray-850/60 text-center text-[10px] text-gray-650 font-mono">
            <Target className="w-4.5 h-4.5 inline mr-1 text-purple-500" />
            <span>Powered by Xeno AI Engine</span>
          </div>
        </div>
      </div>

      {/* Recent Campaigns Table */}
      <div className="bg-crmCard rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
        <div className="px-6 py-5 border-b border-gray-800 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-white">Recent Outreach Activities</h2>
            <p className="text-xs text-gray-400 mt-0.5">List of newly updated campaigns</p>
          </div>
          <button 
            onClick={() => setActiveTab('campaigns')}
            className="text-xs font-semibold text-crmAccent hover:text-purple-400 flex items-center gap-1.5 transition-colors duration-200"
          >
            View all campaigns
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-900/50 text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-800">
                <th className="px-6 py-4">Campaign Name</th>
                <th className="px-6 py-4">Channel</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Delivered / Sent</th>
                <th className="px-6 py-4">Conversion Rate</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-sm text-gray-300">
              {stats.recentCampaigns.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-gray-500 font-medium">No campaigns created yet. Click "Launch Campaign" to start!</td>
                </tr>
              ) : (
                stats.recentCampaigns.map((c) => {
                  const sent = c.stats.sent || 0;
                  const delivered = c.stats.delivered || 0;
                  const converted = c.stats.converted || 0;
                  const rate = sent > 0 ? ((converted / sent) * 100).toFixed(1) + '%' : '0.0%';

                  return (
                    <tr key={c._id} className="hover:bg-gray-800/30 transition-colors duration-150">
                      <td className="px-6 py-4.5 font-semibold text-white">
                        <button 
                          onClick={() => handleViewCampaignDetails(c._id)}
                          className="hover:text-crmAccent hover:underline text-left outline-none"
                        >
                          {c.name}
                        </button>
                      </td>
                      <td className="px-6 py-4.5 capitalize">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                          c.channel === 'whatsapp' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                          c.channel === 'email' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          c.channel === 'sms' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        }`}>
                          {c.channel}
                        </span>
                      </td>
                      <td className="px-6 py-4.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          c.status === 'completed' ? 'bg-crmSuccess/10 text-crmSuccess border border-crmSuccess/25' :
                          c.status === 'running' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/25 animate-pulse' :
                          c.status === 'scheduled' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25' :
                          'bg-gray-800 text-gray-400 border border-gray-700'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4.5">
                        {c.status === 'draft' ? '-' : `${delivered} / ${sent}`}
                      </td>
                      <td className="px-6 py-4.5 font-bold text-white">
                        {c.status === 'draft' ? '-' : rate}
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {c.status === 'draft' && (
                            <button
                              onClick={() => handleLaunchCampaign(c._id)}
                              className="flex items-center gap-1 bg-crmAccent hover:bg-purple-650 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              Launch
                            </button>
                          )}
                          <button
                            onClick={() => handleViewCampaignDetails(c._id)}
                            className="bg-gray-850 hover:bg-gray-800 text-gray-300 px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-750 transition-all duration-150"
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
